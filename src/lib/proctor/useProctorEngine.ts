import { useCallback, useEffect, useRef, useState } from "react";
import type { FaceLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ViolationType = "blur" | "no_face" | "multiple_faces" | "gaze_away";
export type ModelStatus = "loading" | "ready" | "error";

export interface ProctorViolation {
  type: ViolationType;
  label: string;
  detail: string;
}

export interface ProctorEngineState {
  modelStatus: ModelStatus;
  currentViolation: ProctorViolation | null;
  isSuspended: boolean;
  suspendMessage: string;
  warningCount: number;
  blockCount: number;
  borderColor: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const POLL_MS = 700;

// Blur: Laplacian variance — below this = blurry/covered
const BLUR_THRESHOLD = 90;

// Head pose: normalized offset of nose tip within face bounding box
const YAW_THRESHOLD  = 0.18;  // ±18% → looking sideways
const PITCH_DN_THRESHOLD = 0.12;  // +12% → looking down (phone in lap)
const PITCH_UP_THRESHOLD = -0.18;  // -18% → looking up

// How long a violation must persist before escalating
const WARN_AFTER_SEC: Record<ViolationType, number> = {
  multiple_faces: 2,
  blur:           5,
  no_face:        5,
  gaze_away:      4,
};
const BLOCK_AFTER_SEC: Record<ViolationType, number> = {
  multiple_faces: 8,
  blur:           12,
  no_face:        12,
  gaze_away:      10,
};

const MAX_BLOCKS = 3;

const VIOLATION_META: Record<ViolationType, { label: string; detail: string }> = {
  blur: {
    label: "Camera is blurred or covered",
    detail: "Your camera lens appears covered or blurred. Please ensure the camera is clean and unobstructed.",
  },
  no_face: {
    label: "No face detected",
    detail: "Your face is no longer visible in the camera. Please ensure you remain fully in frame throughout the test.",
  },
  multiple_faces: {
    label: "Multiple people detected",
    detail: "More than one person has been detected in the camera frame. Tests must be completed independently.",
  },
  gaze_away: {
    label: "Looking away from screen",
    detail: "You appear to be looking away from the screen. Please keep your eyes on the test at all times.",
  },
};

// ── Blur detection (Laplacian variance, no ML needed) ──────────────────────────

const BLUR_W = 160;
const BLUR_H = 120;

function laplacianVariance(ctx: CanvasRenderingContext2D): number {
  const d = ctx.getImageData(0, 0, BLUR_W, BLUR_H).data;
  let sum = 0;
  for (let y = 1; y < BLUR_H - 1; y++) {
    for (let x = 1; x < BLUR_W - 1; x++) {
      const g = (yy: number, xx: number) => {
        const i = (yy * BLUR_W + xx) * 4;
        return 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      };
      const lap = g(y-1,x) + g(y+1,x) + g(y,x-1) + g(y,x+1) - 4*g(y,x);
      sum += lap * lap;
    }
  }
  return sum / ((BLUR_W - 2) * (BLUR_H - 2));
}

// ── Head pose from 478 FaceMesh landmarks ─────────────────────────────────────
// Returns normalized offsets: yaw / pitch ≈ 0 when face is frontal.

function headPose(landmarks: NormalizedLandmark[]): { yaw: number; pitch: number } {
  if (landmarks.length < 5) return { yaw: 0, pitch: 0 };

  // Nose tip index 4 in MediaPipe FaceMesh
  const nose = landmarks[4];

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < Math.min(468, landmarks.length); i++) {
    if (landmarks[i].x < minX) minX = landmarks[i].x;
    if (landmarks[i].x > maxX) maxX = landmarks[i].x;
    if (landmarks[i].y < minY) minY = landmarks[i].y;
    if (landmarks[i].y > maxY) maxY = landmarks[i].y;
  }
  const fw = maxX - minX;
  const fh = maxY - minY;
  if (fw < 0.01 || fh < 0.01) return { yaw: 0, pitch: 0 };

  return {
    yaw:   (nose.x - (minX + maxX) / 2) / fw,
    pitch: (nose.y - (minY + maxY) / 2) / fh,
  };
}

// ── MediaPipe singleton ───────────────────────────────────────────────────────
// We keep one shared instance across test sessions so the model is only
// downloaded and compiled once per browser session.

let _landmarkerPromise: Promise<FaceLandmarker> | null = null;

async function getLandmarker(): Promise<FaceLandmarker> {
  if (_landmarkerPromise) return _landmarkerPromise;
  _landmarkerPromise = (async () => {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
    );
    return FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
      runningMode: "VIDEO",
      numFaces: 4,
    });
  })();
  return _landmarkerPromise;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useProctorEngine(
  videoRef: React.RefObject<HTMLVideoElement>,
  active: boolean,
  onWarn: (violation: ProctorViolation, warnNumber: number) => void,
  onBlock: (violation: ProctorViolation, blockNumber: number) => void,
  onTerminate: (reason: string) => void,
): ProctorEngineState & { acknowledge: () => void } {

  const [modelStatus, setModelStatus] = useState<ModelStatus>("loading");
  const [currentViolation, setCurrentViolation] = useState<ProctorViolation | null>(null);
  const [isSuspended, setIsSuspended]   = useState(false);
  const [suspendMessage, setSuspendMessage] = useState("");
  const [warningCount, setWarningCount] = useState(0);
  const [blockCount,   setBlockCount]   = useState(0);

  // Mutable refs so the interval closure always sees fresh values
  const suspendedRef     = useRef(false);
  const blockCountRef    = useRef(0);
  const warningCountRef  = useRef(0);
  const violStartRef     = useRef<number | null>(null);
  const prevViolType     = useRef<ViolationType | null>(null);
  const warnIssuedRef    = useRef(false);  // has a warn been issued for this streak?
  const blurCanvasRef    = useRef<HTMLCanvasElement | null>(null);

  const onWarnRef     = useRef(onWarn);
  const onBlockRef    = useRef(onBlock);
  const onTerminateRef = useRef(onTerminate);
  useEffect(() => { onWarnRef.current = onWarn; }, [onWarn]);
  useEffect(() => { onBlockRef.current = onBlock; }, [onBlock]);
  useEffect(() => { onTerminateRef.current = onTerminate; }, [onTerminate]);

  // Create off-screen canvas for blur detection
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = BLUR_W; c.height = BLUR_H;
    blurCanvasRef.current = c;
    return () => { blurCanvasRef.current = null; };
  }, []);

  // Load MediaPipe model eagerly as soon as active
  useEffect(() => {
    if (!active) return;
    getLandmarker()
      .then(() => setModelStatus("ready"))
      .catch(() => setModelStatus("error"));
  }, [active]);

  const acknowledge = useCallback(() => {
    suspendedRef.current = false;
    setIsSuspended(false);
    // Reset the violation streak so the user gets fresh time after acknowledging
    violStartRef.current = null;
    prevViolType.current = null;
    warnIssuedRef.current = false;
    setCurrentViolation(null);
  }, []);

  // Detection loop
  useEffect(() => {
    if (!active || modelStatus !== "ready") return;

    let stopped = false;

    const tick = async () => {
      if (stopped || suspendedRef.current) return;
      const video = videoRef.current;
      const canvas = blurCanvasRef.current;
      if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) return;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(video, 0, 0, BLUR_W, BLUR_H);

      // ── 1. Blur check ────────────────────────────────────────────────────
      const blurScore = laplacianVariance(ctx);
      const isBlurry  = blurScore < BLUR_THRESHOLD;

      // ── 2. Face ML detection ─────────────────────────────────────────────
      let faceCount = 0;
      let gazeYaw   = 0;
      let gazePitch = 0;

      try {
        const lm = await getLandmarker();
        const result = lm.detectForVideo(video, performance.now());
        faceCount = result.faceLandmarks.length;
        if (faceCount === 1) {
          const pose = headPose(result.faceLandmarks[0]);
          gazeYaw   = pose.yaw;
          gazePitch = pose.pitch;
        }
      } catch {
        // detection error — not treated as violation
      }

      // ── 3. Classify ──────────────────────────────────────────────────────
      let vType: ViolationType | null = null;

      // Priority order: multiple people > blur/blocked > gaze
      if (faceCount >= 2) {
        vType = "multiple_faces";
      } else if (isBlurry) {
        vType = "blur";
      } else if (faceCount === 0) {
        vType = "no_face";
      } else if (
        Math.abs(gazeYaw) > YAW_THRESHOLD ||
        gazePitch > PITCH_DN_THRESHOLD ||
        gazePitch < PITCH_UP_THRESHOLD
      ) {
        vType = "gaze_away";
      }

      // ── 4. State machine ─────────────────────────────────────────────────
      const now = Date.now();

      if (vType !== prevViolType.current) {
        violStartRef.current  = vType ? now : null;
        prevViolType.current  = vType;
        warnIssuedRef.current = false;
        setCurrentViolation(vType ? { type: vType, ...VIOLATION_META[vType] } : null);
      }

      if (!vType) return;

      const elapsedSec = (now - (violStartRef.current ?? now)) / 1000;
      const warnThreshold  = WARN_AFTER_SEC[vType];
      const blockThreshold = BLOCK_AFTER_SEC[vType];
      const violation = { type: vType, ...VIOLATION_META[vType] };

      // Soft warning
      if (elapsedSec >= warnThreshold && !warnIssuedRef.current) {
        warnIssuedRef.current = true;
        warningCountRef.current += 1;
        setWarningCount(warningCountRef.current);
        onWarnRef.current(violation, warningCountRef.current);
      }

      // Hard block
      if (elapsedSec >= blockThreshold && !suspendedRef.current) {
        suspendedRef.current = true;
        setIsSuspended(true);
        blockCountRef.current += 1;
        setBlockCount(blockCountRef.current);
        setSuspendMessage(violation.detail);

        if (blockCountRef.current >= MAX_BLOCKS) {
          onTerminateRef.current(
            `Proctoring terminated after ${MAX_BLOCKS} repeated violations: ${violation.label}`
          );
        } else {
          onBlockRef.current(violation, blockCountRef.current);
        }
      }
    };

    const id = setInterval(tick, POLL_MS);
    return () => { stopped = true; clearInterval(id); };
  }, [active, modelStatus, videoRef]);

  const borderColor = isSuspended
    ? "#ef4444"
    : currentViolation
      ? "#f59e0b"
      : modelStatus === "ready"
        ? "#22c55e"
        : "#6b7280";

  return {
    modelStatus,
    currentViolation,
    isSuspended,
    suspendMessage,
    warningCount,
    blockCount,
    borderColor,
    acknowledge,
  };
}
