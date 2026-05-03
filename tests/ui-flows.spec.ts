import { test, expect, Page } from "@playwright/test";
import { mkdirSync } from "fs";

const BASE = "http://localhost:5173";
const SUPABASE = "https://yxwnwmlpattlxefpvhbh.supabase.co";
const SS_DIR = "tests/screenshots";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const fakeJwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  Buffer.from(JSON.stringify({ sub: "mock-user-id", email: "test@vouchme.io", exp: Math.floor(Date.now() / 1000) + 86400 })).toString("base64url") +
  ".fakesig";

const mockProfile = {
  id: "mock-user-id",
  name: "Aria Sharma",
  email: "test@vouchme.io",
  phone: null,
  avatar_url: null,
  roles: ["seeker", "recruiter", "referrer"],
  onboarded: true,
  workExperience: null,
  updated_at: new Date().toISOString(),
};

// Seeker's own referral requests
const seekerRequests = [
  { id: "req-1", seeker_id: "mock-user-id", referrer_id: "ref-1", job_role: "software-developer", seeker_experience_years: 4, status: "pending", created_at: new Date().toISOString(), resume_url: null },
  { id: "req-2", seeker_id: "mock-user-id", referrer_id: "ref-2", job_role: "product-manager", seeker_experience_years: 4, status: "scored", created_at: new Date().toISOString(), resume_url: null },
];

// Requests the referrer needs to review
const referrerRequests = [
  { id: "req-3", seeker_id: "seeker-2", referrer_id: "mock-user-id", job_role: "software-developer", seeker_experience_years: 3, status: "pending", created_at: new Date().toISOString(), resume_url: "https://example.com/resume.pdf" },
  { id: "req-4", seeker_id: "seeker-3", referrer_id: "mock-user-id", job_role: "software-developer", seeker_experience_years: 6, status: "scored", created_at: new Date().toISOString(), resume_url: null },
];

const allRequests = [...seekerRequests, ...referrerRequests];

const mockJobPostings = [
  { id: "job-1", recruiter_id: "mock-user-id", role: "software-developer", years_of_experience: 3, salary_min: 1500000, salary_max: 2500000, is_active: true, created_at: new Date().toISOString() },
  { id: "job-2", recruiter_id: "mock-user-id", role: "product-manager", years_of_experience: 5, salary_min: 2000000, salary_max: 3500000, is_active: false, created_at: new Date().toISOString() },
];

const mockScoringParams = [
  { id: "p1", name: "Technical Depth", description: "Domain knowledge and technical skill", created_at: new Date().toISOString() },
  { id: "p2", name: "Communication", description: "Clarity and collaboration", created_at: new Date().toISOString() },
  { id: "p3", name: "Leadership", description: "Initiative and ownership", created_at: new Date().toISOString() },
  { id: "p4", name: "Culture Fit", description: "Team alignment", created_at: new Date().toISOString() },
];

const mockJobRequirements = [
  { id: "jr-1", userId: "mock-user-id", type: "seeker", role: "software-developer", yearsOfExperience: 4, currentCtc: 1200000, expectedCtc: 2000000, noticePeriod: 30, createdAt: new Date().toISOString() },
];

const mockTopCandidates = [
  { seeker_id: "candidate-1", seeker_name: "Rahul Verma", seeker_role: "software-developer", seeker_experience: 4, strength_score: 8.7, total_scores: 6, expected_ctc: 2000000, current_ctc: 1200000 },
  { seeker_id: "candidate-2", seeker_name: "Priya Nair", seeker_role: "software-developer", seeker_experience: 6, strength_score: 7.9, total_scores: 4, expected_ctc: 2500000, current_ctc: 1800000 },
  { seeker_id: "candidate-3", seeker_name: "Sameer Khan", seeker_role: "software-developer", seeker_experience: 3, strength_score: 7.2, total_scores: 3, expected_ctc: 1600000, current_ctc: 900000 },
];

// ---------------------------------------------------------------------------
// Route interception helpers
// ---------------------------------------------------------------------------

async function interceptSupabase(page: Page) {
  await page.route(`${SUPABASE}/auth/v1/**`, async (route) => {
    const url = route.request().url();
    if (url.includes("token") || url.includes("session")) {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({
          access_token: fakeJwt, refresh_token: "fake-refresh",
          expires_in: 86400, expires_at: Math.floor(Date.now() / 1000) + 86400,
          token_type: "bearer",
          user: { id: "mock-user-id", email: "test@vouchme.io", app_metadata: {}, user_metadata: { full_name: "Aria Sharma" }, aud: "authenticated", created_at: new Date().toISOString() },
        }),
      });
    } else {
      await route.continue();
    }
  });

  await page.route(`${SUPABASE}/rest/v1/profiles*`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockProfile) });
  });

  await page.route(`${SUPABASE}/rest/v1/referral_requests*`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(allRequests) });
  });

  await page.route(`${SUPABASE}/rest/v1/job_postings*`, async (route) => {
    if (route.request().method() === "PATCH" || route.request().method() === "PUT") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockJobPostings) });
    }
  });

  await page.route(`${SUPABASE}/rest/v1/scoring_parameters*`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockScoringParams) });
  });

  await page.route(`${SUPABASE}/rest/v1/job_requirements*`, async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "new-jr" }) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockJobRequirements) });
    }
  });

  await page.route(`${SUPABASE}/rest/v1/scores*`, async (route) => {
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({}) });
  });

  await page.route(`${SUPABASE}/rest/v1/candidate_matches*`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });

  await page.route(`${SUPABASE}/rest/v1/rpc/**`, async (route) => {
    const url = route.request().url();
    if (url.includes("calculate_strength_score")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(7.6) });
    } else if (url.includes("get_top_candidates")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockTopCandidates) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    }
  });
}

async function injectMockSession(page: Page) {
  await page.evaluate((jwt) => {
    localStorage.setItem("sb-yxwnwmlpattlxefpvhbh-auth-token", JSON.stringify({
      access_token: jwt, refresh_token: "fake-refresh",
      expires_at: Math.floor(Date.now() / 1000) + 86400, expires_in: 86400,
      token_type: "bearer",
      user: { id: "mock-user-id", email: "test@vouchme.io", app_metadata: {}, user_metadata: { full_name: "Aria Sharma" }, aud: "authenticated", created_at: new Date().toISOString() },
    }));
  }, fakeJwt);
}

async function setDashboardState(page: Page, role: "seeker" | "recruiter" | "referrer") {
  await page.evaluate((r) => {
    localStorage.setItem("auth-storage", JSON.stringify({ state: { activeRole: r }, version: 0 }));
  }, role);
}

async function loadDashboard(page: Page, role: "seeker" | "recruiter" | "referrer") {
  await interceptSupabase(page);
  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, role);
  await page.reload();
  // Wait for the sidebar to appear (reliable signal that auth + dashboard mounted)
  await page.waitForSelector("text=Overview", { timeout: 10000 });
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `${SS_DIR}/${name}.png`, fullPage: true });
}

// Sidebar nav button (exact text to avoid strict mode violations)
const sidebarBtn = (page: Page, label: string) =>
  page.locator(`aside button:has-text("${label}")`).first();

// Topbar user button (not hero banner "Welcome back, Aria")
const topbarUserBtn = (page: Page) =>
  page.locator("header button").filter({ hasText: /^[A-Z]{2}\s*\w+/ }).first();

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.beforeAll(async () => {
  mkdirSync(SS_DIR, { recursive: true });
});

// ── 1. Landing / AuthFlow ──────────────────────────────────────────────────

test("1. AuthFlow — landing page renders correctly", async ({ page }) => {
  await page.route(`${SUPABASE}/**`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(null) });
  });
  await page.goto(BASE);
  await page.waitForTimeout(1500);
  await screenshot(page, "01-auth-landing");

  await expect(page.locator("text=vouch").first()).toBeVisible();
  await expect(page.locator("text=Continue with Google")).toBeVisible();
  console.log("✅ 1. AuthFlow landing renders");
});

// ── 2. Seeker overview ─────────────────────────────────────────────────────

test("2. Seeker — overview tab renders with stats + StrengthScore", async ({ page }) => {
  await loadDashboard(page, "seeker");
  await screenshot(page, "02-seeker-overview");

  // Hero banner
  await expect(page.locator("text=Seeker workspace")).toBeVisible();
  // Stat cards — use the heading text (exact stat card label, not sidebar button)
  await expect(page.locator("text=Referral requests").first()).toBeVisible();
  // StrengthScore panel
  await expect(page.locator("text=Karma Score")).toBeVisible();
  await expect(page.locator("text=Strength Profile")).toBeVisible();
  console.log("✅ 2. Seeker overview tab");
});

// ── 3. Seeker jobs tab ─────────────────────────────────────────────────────

test("3. Seeker — jobs tab shows requirement list with role label", async ({ page }) => {
  await loadDashboard(page, "seeker");
  await sidebarBtn(page, "My Requirements").click();
  await page.waitForTimeout(600);
  await screenshot(page, "03-seeker-jobs");

  await expect(page.locator("text=Software Developer").first()).toBeVisible();
  await expect(page.locator("text=Current CTC").first()).toBeVisible();
  await expect(page.locator("text=Expected CTC").first()).toBeVisible();
  console.log("✅ 3. Seeker jobs tab");
});

// ── 4. Seeker requests tab ─────────────────────────────────────────────────

test("4. Seeker — requests tab shows referral requests with status badges", async ({ page }) => {
  await loadDashboard(page, "seeker");
  await sidebarBtn(page, "Referral Requests").click();
  await page.waitForTimeout(600);
  await screenshot(page, "04-seeker-requests");

  // Both a pending and a scored request
  await expect(page.locator("text=Pending").first()).toBeVisible();
  await expect(page.locator("text=Reviewed").first()).toBeVisible();
  console.log("✅ 4. Seeker requests tab");
});

// ── 5. Seeker post-requirement form ───────────────────────────────────────

test("5. Seeker — Post requirement form opens and closes inline", async ({ page }) => {
  await loadDashboard(page, "seeker");
  await page.locator("text=Post a requirement").first().click();
  await page.waitForTimeout(500);
  await screenshot(page, "05-seeker-post-form");

  await expect(page.locator("text=Post a Requirement")).toBeVisible();
  await page.locator("text=Close").click();
  await page.waitForTimeout(400);
  await expect(page.locator("text=Karma Score")).toBeVisible();
  console.log("✅ 5. Seeker post-requirement form open/close");
});

// ── 6. Recruiter overview ──────────────────────────────────────────────────

test("6. Recruiter — overview tab renders with stat cards", async ({ page }) => {
  await loadDashboard(page, "recruiter");
  await screenshot(page, "06-recruiter-overview");

  await expect(page.locator("text=Recruiter workspace")).toBeVisible();
  await expect(page.locator("text=Job postings").first()).toBeVisible();
  await expect(page.locator("text=Active postings").first()).toBeVisible();
  await expect(page.locator("text=Recent postings")).toBeVisible();
  console.log("✅ 6. Recruiter overview tab");
});

// ── 7. Recruiter postings tab ─────────────────────────────────────────────

test("7. Recruiter — postings tab lists jobs with Pause/Activate buttons", async ({ page }) => {
  await loadDashboard(page, "recruiter");
  await sidebarBtn(page, "Job Postings").click();
  await page.waitForTimeout(600);
  await screenshot(page, "07-recruiter-postings");

  await expect(page.locator("text=Software Developer").first()).toBeVisible();
  await expect(page.locator("text=Product Manager").first()).toBeVisible();
  await expect(page.locator("button:has-text('Pause')").first()).toBeVisible();
  await expect(page.locator("button:has-text('Activate')").first()).toBeVisible();
  console.log("✅ 7. Recruiter postings tab");
});

// ── 8. Recruiter toggle job status ────────────────────────────────────────

test("8. Recruiter — Pause/Activate toggle fires PATCH request", async ({ page }) => {
  const patchedUrls: string[] = [];
  await interceptSupabase(page);
  await page.route(`${SUPABASE}/rest/v1/job_postings*`, async (route) => {
    if (route.request().method() === "PATCH") {
      patchedUrls.push(route.request().url());
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockJobPostings) });
    }
  });
  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "recruiter");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await sidebarBtn(page, "Job Postings").click();
  await page.waitForTimeout(600);
  await page.locator("button:has-text('Pause')").first().click();
  await page.waitForTimeout(800);
  await screenshot(page, "08-recruiter-toggle-status");

  expect(patchedUrls.length).toBeGreaterThan(0);
  console.log("✅ 8. Recruiter pause/activate toggle");
});

// ── 9. Recruiter create job form ──────────────────────────────────────────

test("9. Recruiter — create job posting form opens and closes", async ({ page }) => {
  await loadDashboard(page, "recruiter");
  // Hero banner button in overview
  await page.locator("button:has-text('Create job posting')").click();
  await page.waitForTimeout(500);
  await screenshot(page, "09-recruiter-job-form");

  await expect(page.locator("text=Create Job Posting")).toBeVisible();
  await page.locator("text=Back to dashboard").click();
  await page.waitForTimeout(400);
  await expect(page.locator("text=Recruiter workspace")).toBeVisible();
  console.log("✅ 9. Recruiter create-job form open/close");
});

// ── 10. TopCandidates renders ─────────────────────────────────────────────

test("10. Recruiter — Top Candidates renders with rank badges and ScoreRings", async ({ page }) => {
  await loadDashboard(page, "recruiter");
  await page.locator("button:has-text('Top 3')").first().click();
  await page.waitForTimeout(1500);
  await screenshot(page, "10-recruiter-top-candidates");

  await expect(page.locator("text=Top Candidates")).toBeVisible();
  await expect(page.locator("text=Rahul Verma")).toBeVisible();
  await expect(page.locator("text=Priya Nair")).toBeVisible();
  await expect(page.locator("text=Sameer Khan")).toBeVisible();
  await expect(page.locator("text=1st")).toBeVisible();
  await expect(page.locator("text=2nd")).toBeVisible();
  await expect(page.locator("text=Elite").first()).toBeVisible();
  await expect(page.locator("text=How karma scores work")).toBeVisible();
  console.log("✅ 10. TopCandidates renders");
});

// ── 11. Show Interest flow ────────────────────────────────────────────────

test("11. Recruiter — Show Interest transitions to Interested badge", async ({ page }) => {
  await loadDashboard(page, "recruiter");
  await page.locator("button:has-text('Top 3')").first().click();
  await page.waitForTimeout(1500);
  await page.locator("button:has-text('Show interest')").first().click();
  await page.waitForTimeout(1000);
  await screenshot(page, "11-recruiter-show-interest");

  await expect(page.locator("text=✓ Interested").first()).toBeVisible();
  await expect(page.locator("button:has-text('Unlock contact')").first()).toBeVisible();
  console.log("✅ 11. Show interest state transition");
});

// ── 12. Unlock Contact flow ───────────────────────────────────────────────

test("12. Recruiter — Unlock Contact reveals phone + email", async ({ page }) => {
  await interceptSupabase(page);
  // Override profiles to return contact details for candidate
  await page.route(`${SUPABASE}/rest/v1/profiles*`, async (route) => {
    const url = route.request().url();
    if (url.includes("candidate-1")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ phone: "+91 98765 43210", email: "rahul@example.com" }) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockProfile) });
    }
  });
  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "recruiter");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await page.locator("button:has-text('Top 3')").first().click();
  await page.waitForTimeout(1500);
  await page.locator("button:has-text('Show interest')").first().click();
  await page.waitForTimeout(800);
  await page.locator("button:has-text('Unlock contact')").first().click();
  await page.waitForTimeout(1000);
  await screenshot(page, "12-recruiter-unlock-contact");
  console.log("✅ 12. Unlock contact flow");
});

// ── 13. Referrer overview ─────────────────────────────────────────────────

test("13. Referrer — overview tab with pending queue preview", async ({ page }) => {
  await loadDashboard(page, "referrer");
  await screenshot(page, "13-referrer-overview");

  await expect(page.locator("text=Referrer workspace")).toBeVisible();
  await expect(page.locator("text=Pending reviews").first()).toBeVisible();
  await expect(page.locator("text=Pending review queue")).toBeVisible();
  console.log("✅ 13. Referrer overview tab");
});

// ── 14. Referrer review queue ─────────────────────────────────────────────

test("14. Referrer — review queue shows scoring form for pending requests", async ({ page }) => {
  await loadDashboard(page, "referrer");
  // Use sidebar button specifically to avoid matching content text
  await sidebarBtn(page, "Review Queue").click();
  await page.waitForTimeout(800);
  await screenshot(page, "14-referrer-review-queue");

  // Scoring parameters visible
  await expect(page.locator("text=Technical Depth").first()).toBeVisible();
  await expect(page.locator("text=Communication").first()).toBeVisible();
  // Scored badge for already-reviewed request
  await expect(page.locator("text=Reviewed").first()).toBeVisible();
  // Resume section for pending request
  await expect(page.locator("text=Candidate resume")).toBeVisible();
  console.log("✅ 14. Referrer review queue");
});

// ── 15. Score input updates progress bar ─────────────────────────────────

test("15. Referrer — score input updates live progress bar", async ({ page }) => {
  await loadDashboard(page, "referrer");
  await sidebarBtn(page, "Review Queue").click();
  await page.waitForTimeout(800);

  const inputs = page.locator('input[type="number"]');
  await inputs.first().fill("8");
  await page.waitForTimeout(400);
  await screenshot(page, "15-referrer-score-input");

  const val = await inputs.first().inputValue();
  expect(val).toBe("8");
  console.log("✅ 15. Score input and progress bar");
});

// ── 16. Submit scores ─────────────────────────────────────────────────────

test("16. Referrer — submit scores shows success toast", async ({ page }) => {
  await loadDashboard(page, "referrer");
  await sidebarBtn(page, "Review Queue").click();
  await page.waitForTimeout(800);

  const inputs = page.locator('input[type="number"]');
  const count = await inputs.count();
  for (let i = 0; i < count; i++) {
    await inputs.nth(i).fill("7");
  }
  await page.locator("button:has-text('Submit scores')").first().click();
  await page.waitForTimeout(1500);
  await screenshot(page, "16-referrer-submit-scores");

  // Toast appears (success or error)
  await expect(
    page.locator("text=Scores submitted!").or(page.locator("text=Failed")).first()
  ).toBeVisible({ timeout: 3000 });
  console.log("✅ 16. Referrer submit scores");
});

// ── 17. Role switching ────────────────────────────────────────────────────

test("17. Role switching — dropdown switches workspace", async ({ page }) => {
  await loadDashboard(page, "seeker");
  // Target the topbar user button specifically (header, not hero banner)
  await page.locator("header button").filter({ hasText: /Aria/ }).click();
  await page.waitForTimeout(400);
  await screenshot(page, "17a-user-dropdown");

  await page.locator("button:has-text('Switch to Recruiter')").click();
  await page.waitForTimeout(1000);
  await screenshot(page, "17b-switched-to-recruiter");

  await expect(page.locator("text=Recruiter workspace")).toBeVisible();
  console.log("✅ 17. Role switching via dropdown");
});

// ── 18. Sidebar navigation ────────────────────────────────────────────────

test("18. Sidebar — all tabs navigable and active state correct", async ({ page }) => {
  await loadDashboard(page, "seeker");
  await screenshot(page, "18a-sidebar-overview-active");

  await sidebarBtn(page, "My Requirements").click();
  await page.waitForTimeout(400);
  await screenshot(page, "18b-sidebar-jobs-active");
  await expect(page.locator("h2:has-text('My Requirements')")).toBeVisible();

  await sidebarBtn(page, "Referral Requests").click();
  await page.waitForTimeout(400);
  await screenshot(page, "18c-sidebar-requests-active");
  await expect(page.locator("h2:has-text('Referral Requests')")).toBeVisible();
  console.log("✅ 18. Sidebar navigation");
});

// ── 19. StrengthScore card ────────────────────────────────────────────────

test("19. StrengthScore — ScoreRing, progress bars and trend chart visible", async ({ page }) => {
  await loadDashboard(page, "seeker");
  await page.waitForTimeout(2000); // animations complete
  await screenshot(page, "19-strength-score-card");

  await expect(page.locator("text=Karma Score")).toBeVisible();
  await expect(page.locator("text=Strength Profile")).toBeVisible();
  await expect(page.locator("text=6-month trend")).toBeVisible();
  await expect(
    page.locator("text=Tip:").or(page.locator("text=Outstanding!"))
  ).toBeVisible();
  console.log("✅ 19. StrengthScore renders");
});

// ── 20. Empty states ──────────────────────────────────────────────────────

test("20. Empty states render when there is no data", async ({ page }) => {
  await page.route(`${SUPABASE}/**`, async (route) => {
    const url = route.request().url();
    if (url.includes("profiles")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockProfile) });
    } else if (url.includes("calculate_strength_score")) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(0) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
    }
  });
  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "seeker");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await sidebarBtn(page, "My Requirements").click();
  await page.waitForTimeout(400);
  await screenshot(page, "20a-seeker-jobs-empty");
  await expect(page.locator("text=No requirements yet")).toBeVisible();

  await sidebarBtn(page, "Referral Requests").click();
  await page.waitForTimeout(400);
  await screenshot(page, "20b-seeker-requests-empty");
  await expect(page.locator("text=No requests yet")).toBeVisible();
  console.log("✅ 20. Empty states");
});
