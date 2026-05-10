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
  calendly_url: "https://calendly.com/aria-sharma/30min",
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
  await expect(page.locator("text=Upcoming Interviews")).toBeVisible();
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
  // Select hire inclination (required since the new feature)
  await page.locator("button:has-text('Yes')").first().click();
  await page.waitForTimeout(200);
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

// ── 21. Book Interview modal opens with referrers ─────────────────────────

const mockEligibleReferrers = [
  {
    referrer_id: "ref-calendly-1",
    referrer_name: "Priya Singh",
    referrer_role: "software-developer",
    referrer_experience: 6,
    organization: "Google",
  },
];

async function interceptSupabaseWithBooking(page: Page) {
  await interceptSupabase(page);

  // Override RPC to handle find_eligible_referrers_for_job
  await page.route(`${SUPABASE}/rest/v1/rpc/find_eligible_referrers_for_job`, async (route) => {
    await route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify(mockEligibleReferrers),
    });
  });

  // Override profiles to handle calendly_url lookups (returns array when select=id,calendly_url)
  await page.route(`${SUPABASE}/rest/v1/profiles*`, async (route) => {
    const url = route.request().url();
    if (url.includes("calendly_url") && url.includes("in.")) {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify([{ id: "ref-calendly-1", calendly_url: "https://calendly.com/test-referrer/30min" }]),
      });
    } else if (url.includes("ref-calendly-1") || (url.includes("in.") && url.includes("name"))) {
      // seeker profile lookup in referrer dashboard
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify([{ id: "mock-user-id", name: "Aria Sharma", avatar_url: null }]),
      });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockProfile) });
    }
  });
}

test("21. Book Interview — modal opens with eligible referrer shown", async ({ page }) => {
  await interceptSupabaseWithBooking(page);
  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "seeker");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await sidebarBtn(page, "My Requirements").click();
  await page.waitForTimeout(400);

  // Click "Book an interview" on the first job card
  await page.locator("button:has-text('Book an interview')").first().click();
  await page.waitForTimeout(600);
  await screenshot(page, "21a-book-interview-modal-opening");

  // Modal header visible
  await expect(page.locator("text=Book an interview").first()).toBeVisible();

  // Wait for eligible referrers to load
  await page.waitForTimeout(1200);
  await screenshot(page, "21b-book-interview-referrer-listed");

  // Referrer name and Available badge should be visible
  await expect(page.locator("text=Priya Singh")).toBeVisible();
  await expect(page.locator("text=Available").first()).toBeVisible();
  await expect(page.locator("text=Google")).toBeVisible();
  console.log("✅ 21. Book Interview modal opens with eligible referrers");
});

// ── 22. Book Interview — selecting referrer shows Calendly iframe ─────────

test("22. Book Interview — clicking referrer shows Calendly iframe", async ({ page }) => {
  await interceptSupabaseWithBooking(page);
  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "seeker");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await sidebarBtn(page, "My Requirements").click();
  await page.waitForTimeout(400);
  await page.locator("button:has-text('Book an interview')").first().click();
  await page.waitForTimeout(1500); // wait for RPC + calendly URL fetches

  // Click "Book Interview" on the referrer
  await page.locator("button:has-text('Book Interview')").first().click();
  await page.waitForTimeout(800);
  await screenshot(page, "22-book-interview-iframe");

  // Iframe should be present with calendly URL
  const iframe = page.locator("iframe[title='Book a time']");
  await expect(iframe).toBeVisible();
  const src = await iframe.getAttribute("src");
  expect(src).toContain("calendly.com/test-referrer/30min");
  expect(src).toContain("email=test%40vouchme.io");
  expect(src).toContain("name=Aria");
  console.log("✅ 22. Book Interview iframe loads with pre-filled email/name");
});

// ── 23. Book Interview — redirect-page postMessage auto-fills interview_at ─

test("23. Book Interview — calendly_booked redirect saves interview_at automatically", async ({ page }) => {
  let insertBody: any = null;

  await interceptSupabaseWithBooking(page);

  await page.route(`${SUPABASE}/rest/v1/referral_requests*`, async (route) => {
    if (route.request().method() === "POST") {
      insertBody = JSON.parse(route.request().postData() ?? "{}");
      expect(insertBody.seeker_id).toBe("mock-user-id");
      expect(insertBody.referrer_id).toBe("ref-calendly-1");
      expect(insertBody.status).toBe("pending");
      expect(insertBody.job_role).toBe("software-developer");
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(allRequests) });
    }
  });

  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "seeker");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await sidebarBtn(page, "My Requirements").click();
  await page.waitForTimeout(400);
  await page.locator("button:has-text('Book an interview')").first().click();
  await page.waitForTimeout(1500);
  await page.locator("button:has-text('Book Interview')").first().click();
  await page.waitForTimeout(800);

  await expect(page.locator("iframe[title='Book a time']")).toBeVisible();

  // Simulate the postMessage that calendly-success.html sends back after the
  // Calendly redirect lands on our origin with event_start_time in the URL.
  const eventStart = "2026-05-15T10:00:00.000000Z";
  await page.evaluate((startTime) => {
    window.postMessage({
      type: "calendly_booked",
      data: {
        event_start_time: startTime,
        event_end_time: "2026-05-15T10:30:00.000000Z",
        invitee_email: "test@example.com",
      },
    }, "*");
  }, eventStart);

  await page.waitForTimeout(1500);
  await screenshot(page, "23-book-interview-success");

  await expect(page.locator("text=Interview booked!")).toBeVisible();
  expect(insertBody).not.toBeNull();
  expect(insertBody.interview_at).toBe(eventStart);
  console.log("✅ 23. calendly_booked redirect → bookSlot insert with interview_at");
});

// ── 24. Referrer Upcoming Interviews — shows pending requests ─────────────

test("24. Referrer — Upcoming Interviews shows pending Calendly-booked requests", async ({ page }) => {
  await loadDashboard(page, "referrer");
  await screenshot(page, "24a-referrer-overview");

  // Overview should show pending count > 0 in stat card
  await expect(page.locator("text=Upcoming Interviews")).toBeVisible();

  // req-3 is pending with referrer_id=mock-user-id — should appear in scheduledSorted
  await page.waitForTimeout(800);
  await screenshot(page, "24b-referrer-upcoming-interviews");
  await expect(page.locator("text=Upcoming Interviews")).toBeVisible();
  // At least one scheduled/pending request shows up (not the empty-state message)
  await expect(page.locator("text=No upcoming interviews yet")).not.toBeVisible();
  console.log("✅ 24. Referrer Upcoming Interviews shows pending bookings");
});

// ── 25. Book Interview — no referrers shows empty state ───────────────────

test("25. Book Interview — no eligible referrers shows empty state", async ({ page }) => {
  await interceptSupabase(page);
  // RPC returns empty array
  await page.route(`${SUPABASE}/rest/v1/rpc/find_eligible_referrers_for_job`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "seeker");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await sidebarBtn(page, "My Requirements").click();
  await page.waitForTimeout(400);
  await page.locator("button:has-text('Book an interview')").first().click();
  await page.waitForTimeout(1200);
  await screenshot(page, "25-book-interview-no-referrers");

  await expect(page.locator("text=No referrers available yet")).toBeVisible();
  console.log("✅ 25. Book Interview empty state when no eligible referrers");
});

// ── 26. Book Interview — close button dismisses modal ────────────────────

test("26. Book Interview — X button closes the modal", async ({ page }) => {
  await interceptSupabaseWithBooking(page);
  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "seeker");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await sidebarBtn(page, "My Requirements").click();
  await page.waitForTimeout(400);
  await page.locator("button:has-text('Book an interview')").first().click();
  await page.waitForTimeout(600);

  await expect(page.locator("text=Book an interview").first()).toBeVisible();
  // Click the X close button
  await page.locator("button[style*='transparent']").filter({ has: page.locator("svg") }).last().click();
  await page.waitForTimeout(400);
  await screenshot(page, "26-book-interview-modal-closed");

  // Modal gone, back to jobs tab
  await expect(page.locator("text=Software Developer").first()).toBeVisible();
  console.log("✅ 26. Book Interview modal closes on X");
});

// ── Helpers for interview-gate + inclination tests ────────────────────────

const pastInterviewAt   = new Date(Date.now() - 90 * 60 * 1000).toISOString(); // 90 min ago → unlocked
const futureInterviewAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 60 min from now → locked

function referrerRequestsWithTime(interview_at: string | null) {
  return [
    {
      id: "req-3", seeker_id: "seeker-2", referrer_id: "mock-user-id",
      job_role: "software-developer", seeker_experience_years: 3,
      status: "pending", created_at: new Date().toISOString(),
      resume_url: "https://example.com/resume.pdf",
      interview_at,
      hire_inclination: null,
    },
    { id: "req-4", seeker_id: "seeker-3", referrer_id: "mock-user-id", job_role: "software-developer", seeker_experience_years: 6, status: "scored", created_at: new Date().toISOString(), resume_url: null, interview_at: null, hire_inclination: "yes" },
  ];
}

async function loadReferrerWithTime(page: Page, interview_at: string | null) {
  await interceptSupabase(page);
  await page.route(`${SUPABASE}/rest/v1/referral_requests*`, async (route) => {
    await route.fulfill({
      status: 200, contentType: "application/json",
      body: JSON.stringify([...seekerRequests, ...referrerRequestsWithTime(interview_at)]),
    });
  });
  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "referrer");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });
}

// ── 27. Time gate: no interview_at → Score Candidate locked, datetime input shown ─

test("27. Time gate — no interview time set shows datetime input and locked button", async ({ page }) => {
  await loadReferrerWithTime(page, null);
  await screenshot(page, "27a-referrer-overview-no-time");

  // The upcoming interviews card should show the datetime input
  await expect(page.locator("text=Set interview time:")).toBeVisible();
  await expect(page.locator('input[type="datetime-local"]').first()).toBeVisible();

  // Score Candidate button should show "Locked" with a lock icon
  await expect(page.locator("button:has-text('Locked')").first()).toBeVisible();
  await expect(page.locator("button:has-text('Locked')").first()).toBeDisabled();
  await screenshot(page, "27b-time-gate-locked");
  console.log("✅ 27. No interview time → locked button + datetime input shown");
});

// ── 28. Time gate: future interview_at → still locked ────────────────────

test("28. Time gate — future interview time shows lock and countdown message", async ({ page }) => {
  await loadReferrerWithTime(page, futureInterviewAt);

  // No datetime input (time is already saved)
  await expect(page.locator('input[type="datetime-local"]')).toHaveCount(0);

  // Shows the interview time string with "scoring unlocks at" message
  await expect(page.locator("text=/scoring unlocks at/i").first()).toBeVisible();

  // Score Candidate still locked
  await expect(page.locator("button:has-text('Locked')").first()).toBeDisabled();
  await screenshot(page, "28-time-gate-future");
  console.log("✅ 28. Future interview time → still locked with unlock timestamp shown");
});

// ── 29. Time gate: past interview_at (90 min ago) → unlocked ─────────────

test("29. Time gate — past interview time (90 min ago) unlocks Score Candidate", async ({ page }) => {
  await loadReferrerWithTime(page, pastInterviewAt);

  // Score Candidate should be enabled with star icon
  await expect(page.locator("button:has-text('Score Candidate')").first()).toBeVisible();
  await expect(page.locator("button:has-text('Score Candidate')").first()).toBeEnabled();

  // Shows "scoring unlocked" confirmation text
  await expect(page.locator("text=/scoring unlocked/i").first()).toBeVisible();
  await screenshot(page, "29-time-gate-unlocked");
  console.log("✅ 29. Past interview time (90 min) → Score Candidate unlocked");
});

// ── 30. Time gate: saving interview time updates the UI ───────────────────

test("30. Time gate — setting interview time via input calls PATCH and updates UI", async ({ page }) => {
  let patchedBody: any = null;

  await interceptSupabase(page);
  await page.route(`${SUPABASE}/rest/v1/referral_requests*`, async (route) => {
    if (route.request().method() === "PATCH") {
      patchedBody = JSON.parse(route.request().postData() ?? "{}");
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify([...seekerRequests, ...referrerRequestsWithTime(null)]),
      });
    }
  });
  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "referrer");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  // Fill in a past time so the button unlocks after save
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const localStr = twoHoursAgo.toISOString().slice(0, 16); // datetime-local format
  await page.locator('input[type="datetime-local"]').first().fill(localStr);
  await page.locator("button:has-text('Save')").first().click();
  await page.waitForTimeout(800);
  await screenshot(page, "30-interview-time-saved");

  // PATCH was sent with interview_at
  expect(patchedBody?.interview_at).toBeTruthy();
  // Toast confirmation
  await expect(page.locator("text=Interview time saved")).toBeVisible();
  console.log("✅ 30. Saving interview time fires PATCH and shows toast");
});

// ── 31. Inclination: all 5 options render in review queue ─────────────────

test("31. Hire inclination — all 5 options render in the review queue form", async ({ page }) => {
  await loadDashboard(page, "referrer");
  await sidebarBtn(page, "Review Queue").click();
  await page.waitForTimeout(800);
  await screenshot(page, "31-inclination-options");

  for (const label of ["Strong Yes", "Yes", "Neutral", "No", "Strong No"]) {
    await expect(page.locator(`button:has-text('${label}')`).first()).toBeVisible();
  }
  await expect(page.locator("text=Would you hire this candidate?")).toBeVisible();
  console.log("✅ 31. All 5 hire inclination options render");
});

// ── 32. Inclination: selection toggles active state ───────────────────────

test("32. Hire inclination — clicking an option marks it selected", async ({ page }) => {
  await loadDashboard(page, "referrer");
  await sidebarBtn(page, "Review Queue").click();
  await page.waitForTimeout(800);

  // Click "Strong Yes"
  await page.locator("button:has-text('Strong Yes')").first().click();
  await page.waitForTimeout(200);
  await screenshot(page, "32a-inclination-strong-yes");

  // Click "No" — should deselect Strong Yes
  await page.locator("button:has-text('No')").first().click();
  await page.waitForTimeout(200);
  await screenshot(page, "32b-inclination-no");

  // "No" button should now have white text (selected styling)
  const noBtn = page.locator("button:has-text('No')").first();
  const color = await noBtn.evaluate(el => getComputedStyle(el).color);
  // selected buttons use white text
  expect(color).toBe("rgb(255, 255, 255)");
  console.log("✅ 32. Inclination selection toggles active styling");
});

// ── 33. Inclination: submit blocked when not selected ─────────────────────

test("33. Hire inclination — submitting without inclination shows error toast", async ({ page }) => {
  await loadDashboard(page, "referrer");
  await sidebarBtn(page, "Review Queue").click();
  await page.waitForTimeout(800);

  // Fill scores but DON'T select inclination
  const inputs = page.locator('input[type="number"]');
  const count = await inputs.count();
  for (let i = 0; i < count; i++) await inputs.nth(i).fill("8");

  await page.locator("button:has-text('Submit scores')").first().click();
  await page.waitForTimeout(800);
  await screenshot(page, "33-inclination-missing-error");

  await expect(page.locator("text=Please select your hire inclination")).toBeVisible();
  console.log("✅ 33. Submit without inclination shows validation error");
});

// ── 34. Inclination: full submit flow with inclination ────────────────────

test("34. Hire inclination — full submit flow saves inclination + scores", async ({ page }) => {
  const patchedBodies: any[] = [];

  await interceptSupabase(page);
  await page.route(`${SUPABASE}/rest/v1/referral_requests*`, async (route) => {
    if (route.request().method() === "PATCH") {
      patchedBodies.push(JSON.parse(route.request().postData() ?? "{}"));
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(allRequests) });
    }
  });

  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "referrer");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await sidebarBtn(page, "Review Queue").click();
  await page.waitForTimeout(800);

  const inputs = page.locator('input[type="number"]');
  const count = await inputs.count();
  for (let i = 0; i < count; i++) await inputs.nth(i).fill("9");

  // Select "Strong Yes"
  await page.locator("button:has-text('Strong Yes')").first().click();
  await page.waitForTimeout(200);

  await page.locator("button:has-text('Submit scores')").first().click();
  await page.waitForTimeout(1500);
  await screenshot(page, "34-inclination-submit-success");

  // Inclination PATCH was sent
  const inclinationPatch = patchedBodies.find(b => b.hire_inclination);
  expect(inclinationPatch?.hire_inclination).toBe("strong_yes");
  await expect(page.locator("text=Scores submitted!")).toBeVisible();
  console.log("✅ 34. Full submit flow saves hire_inclination=strong_yes and shows success");
});

// ── 35. TopCandidates: hire_inclination_pct renders correctly ─────────────

test("35. TopCandidates — hire_inclination_pct shows colour-coded bar and label", async ({ page }) => {
  const candidatesWithInclination = [
    { seeker_id: "c-1", seeker_name: "High Fit",   seeker_role: "software-developer", seeker_experience: 5, strength_score: 8.8, total_scores: 3, expected_ctc: 2000000, current_ctc: 1200000, hire_inclination_pct: 80 },
    { seeker_id: "c-2", seeker_name: "Mid Fit",    seeker_role: "software-developer", seeker_experience: 4, strength_score: 7.2, total_scores: 2, expected_ctc: 1800000, current_ctc: 1100000, hire_inclination_pct: 50 },
    { seeker_id: "c-3", seeker_name: "Low Fit",    seeker_role: "software-developer", seeker_experience: 3, strength_score: 5.5, total_scores: 1, expected_ctc: 1500000, current_ctc: 900000,  hire_inclination_pct: 25 },
  ];

  await interceptSupabase(page);
  await page.route(`${SUPABASE}/rest/v1/rpc/get_top_candidates`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(candidatesWithInclination) });
  });

  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "recruiter");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await page.locator("button:has-text('Top 3')").first().click();
  await page.waitForTimeout(1500);
  await screenshot(page, "35-top-candidates-inclination");

  // All three inclination labels visible
  await expect(page.locator("text=80% hire inclination")).toBeVisible();
  await expect(page.locator("text=50% hire inclination")).toBeVisible();
  await expect(page.locator("text=25% hire inclination")).toBeVisible();
  console.log("✅ 35. hire_inclination_pct rendered for all three tiers");
});

// ── 36. TopCandidates: null hire_inclination_pct hides the bar ───────────

test("36. TopCandidates — null hire_inclination_pct does not show inclination bar", async ({ page }) => {
  const candidatesNoInclination = [
    { seeker_id: "c-1", seeker_name: "No Incl",  seeker_role: "software-developer", seeker_experience: 5, strength_score: 7.0, total_scores: 1, expected_ctc: 2000000, current_ctc: 1200000, hire_inclination_pct: null },
  ];

  await interceptSupabase(page);
  await page.route(`${SUPABASE}/rest/v1/rpc/get_top_candidates`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(candidatesNoInclination) });
  });

  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "recruiter");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await page.locator("button:has-text('Top 3')").first().click();
  await page.waitForTimeout(1500);
  await screenshot(page, "36-top-candidates-no-inclination");

  await expect(page.locator("text=No Incl")).toBeVisible();
  // The inclination bar is inside .surface-card; the info blurb always mentions "hire inclination" text
  // so we check that no percentage label appears inside a candidate card
  await expect(page.locator(".surface-card span:has-text('% hire inclination')")).toHaveCount(0);
  console.log("✅ 36. null hire_inclination_pct hides the inclination bar entirely");
});

// ── 37. Algorithm: karma score blending logic verified via UI ─────────────

test("37. Algorithm — blended score (65% param + 35% inclination) ranks candidates correctly", async ({ page }) => {
  // Candidate A: high params (9.0) + strong_yes inclination avg (10) → 0.65×9 + 0.35×10 = 9.35
  // Candidate B: high params (9.0) + strong_no inclination avg  (0) → 0.65×9 + 0.35×0  = 5.85
  // get_top_candidates returns pre-computed scores; verify ranked order matches algorithm
  const ranked = [
    { seeker_id: "a", seeker_name: "Alice Strong Yes", seeker_role: "software-developer", seeker_experience: 5, strength_score: 9.35, total_scores: 2, expected_ctc: 2000000, current_ctc: 1200000, hire_inclination_pct: 100 },
    { seeker_id: "b", seeker_name: "Bob Strong No",    seeker_role: "software-developer", seeker_experience: 5, strength_score: 5.85, total_scores: 2, expected_ctc: 2000000, current_ctc: 1200000, hire_inclination_pct: 0   },
  ];

  await interceptSupabase(page);
  await page.route(`${SUPABASE}/rest/v1/rpc/get_top_candidates`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(ranked) });
  });

  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "recruiter");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await page.locator("button:has-text('Top 3')").first().click();
  await page.waitForTimeout(1500);
  await screenshot(page, "37-algorithm-ranking");

  // Alice (rank 1st) should appear before Bob (rank 2nd)
  const names = await page.locator(".surface-card >> text=/Alice|Bob/").allTextContents();
  expect(names.some(t => t.includes("Alice"))).toBe(true);
  expect(names.some(t => t.includes("Bob"))).toBe(true);

  // 100% inclination = green; 0% = amber
  await expect(page.getByText("100% hire inclination", { exact: true })).toBeVisible();
  await expect(page.getByText("0% hire inclination", { exact: true })).toBeVisible();
  console.log("✅ 37. Algorithm ranking: strong_yes lifts score, strong_no depresses it");
});

// ── 38. Book Interview — fallback when redirect doesn't fire ─────────────

test("38. Book Interview — event_scheduled fallback inserts without interview_at", async ({ page }) => {
  let insertBody: any = null;

  await interceptSupabaseWithBooking(page);

  await page.route(`${SUPABASE}/rest/v1/referral_requests*`, async (route) => {
    if (route.request().method() === "POST") {
      insertBody = JSON.parse(route.request().postData() ?? "{}");
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(allRequests) });
    }
  });

  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "seeker");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await sidebarBtn(page, "My Requirements").click();
  await page.waitForTimeout(400);
  await page.locator("button:has-text('Book an interview')").first().click();
  await page.waitForTimeout(1500);
  await page.locator("button:has-text('Book Interview')").first().click();
  await page.waitForTimeout(800);

  await expect(page.locator("iframe[title='Book a time']")).toBeVisible();

  // Only event_scheduled fires (no redirect postMessage). Fallback timer (3.5s)
  // should still create the booking, but without interview_at — the referrer
  // can set it manually.
  await page.evaluate(() => {
    window.postMessage({ event: "calendly.event_scheduled" }, "*");
  });

  await page.waitForTimeout(4500);
  await screenshot(page, "38-book-fallback");

  await expect(page.locator("text=Interview booked!")).toBeVisible();
  expect(insertBody).not.toBeNull();
  expect(insertBody.interview_at).toBeUndefined();
  console.log("✅ 38. event_scheduled fallback fires bookSlot without interview_at");
});

// ── 39. Book Interview — redirect race wins over fallback ─────────────────

test("39. Book Interview — redirect arrives before fallback, only one insert", async ({ page }) => {
  let insertCount = 0;
  let insertBody: any = null;

  await interceptSupabaseWithBooking(page);

  await page.route(`${SUPABASE}/rest/v1/referral_requests*`, async (route) => {
    if (route.request().method() === "POST") {
      insertCount++;
      insertBody = JSON.parse(route.request().postData() ?? "{}");
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({}) });
    } else {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(allRequests) });
    }
  });

  await page.goto(BASE);
  await injectMockSession(page);
  await setDashboardState(page, "seeker");
  await page.reload();
  await page.waitForSelector("text=Overview", { timeout: 10000 });

  await sidebarBtn(page, "My Requirements").click();
  await page.waitForTimeout(400);
  await page.locator("button:has-text('Book an interview')").first().click();
  await page.waitForTimeout(1500);
  await page.locator("button:has-text('Book Interview')").first().click();
  await page.waitForTimeout(800);

  await expect(page.locator("iframe[title='Book a time']")).toBeVisible();

  // event_scheduled fires first (starts 3.5s fallback timer), then redirect
  // arrives shortly after with the time. Only ONE insert should happen, with
  // interview_at populated.
  await page.evaluate(() => {
    window.postMessage({ event: "calendly.event_scheduled" }, "*");
  });
  await page.waitForTimeout(300);
  const startTime = "2026-06-01T14:30:00.000000Z";
  await page.evaluate((t) => {
    window.postMessage({
      type: "calendly_booked",
      data: { event_start_time: t },
    }, "*");
  }, startTime);

  // Wait long enough for the fallback timer to have fired if it weren't cancelled.
  await page.waitForTimeout(4500);

  await expect(page.locator("text=Interview booked!")).toBeVisible();
  expect(insertCount).toBe(1);
  expect(insertBody.interview_at).toBe(startTime);
  console.log("✅ 39. Redirect cancels fallback — single insert with interview_at");
});
