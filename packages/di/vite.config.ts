/// <reference types='vitest' />
import { defineConfig } from "vite";

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/packages/di",
  plugins: [],
  test: {
    watch: false,
    globals: true,
    environment: "node",
    testTimeout: 60000,
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "./test-output/vitest/coverage",
      provider: "v8",
    },
  },
});
