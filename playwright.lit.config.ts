import { defineConfig } from "@playwright/test"
import base from "./playwright.config"

export default defineConfig({
  ...base,
  // Every example shipped by lit-ts has its existing framework E2E suite.
  testMatch: [
    "accordion.e2e.ts",
    "checkbox.e2e.ts",
    "collapsible.e2e.ts",
    "dialog.e2e.ts",
    "dialog-basic.e2e.ts",
    "menu.e2e.ts",
    "menu-nested.e2e.ts",
    "menu-option.e2e.ts",
    "popover.e2e.ts",
    "radio-group.e2e.ts",
    "slider.e2e.ts",
    "range-slider.e2e.ts",
    "switch.e2e.ts",
    "tabs.e2e.ts",
    "toggle.e2e.ts",
    "toggle-group.e2e.ts",
  ],
})
