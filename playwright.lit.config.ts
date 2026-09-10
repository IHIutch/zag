import { defineConfig } from "@playwright/test"
import base from "./playwright.config"

export default defineConfig({
  ...base,
  // Every example shipped by lit-ts has its existing framework E2E suite.
  testMatch: ["accordion.e2e.ts", "checkbox.e2e.ts", "toggle-group.e2e.ts"],
})
