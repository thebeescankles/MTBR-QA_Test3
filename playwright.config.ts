import { defineConfig } from "@playwright/test";

const baseURL = process.env.LIBRARY_API_BASE_URL ?? "https://rahulshettyacademy.com/Library";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    baseURL: baseURL.endsWith("/") ? baseURL : `${baseURL}/`,
    extraHTTPHeaders: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  },
  timeout: 15_000,
  expect: {
    timeout: 5_000,
  },
});
