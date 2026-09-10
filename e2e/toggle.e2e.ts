import { expect, test } from "@playwright/test"

test.describe("toggle", () => {
  test("toggles with pointer and keyboard interaction", async ({ page }) => {
    await page.goto("/toggle/basic")

    const toggle = page.getByRole("main").getByRole("button")
    await expect(toggle).toHaveAttribute("aria-pressed", "false")

    await toggle.click()
    await expect(toggle).toHaveAttribute("aria-pressed", "true")

    await toggle.press("Space")
    await expect(toggle).toHaveAttribute("aria-pressed", "false")
  })
})
