import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit tests live next to source. We deliberately exclude tests/ — that
    // directory is for Playwright E2E specs which Vitest cannot run.
    include: ["src/**/*.test.ts", "supabase/functions/**/*.test.ts"],
    environment: "node",
  },
});
