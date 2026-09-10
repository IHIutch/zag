import { expect, test } from "@playwright/test"

test.describe("basic dialog", () => {
  test("opens, moves focus, and closes with escape", async ({ page }) => {
    await page.goto("/dialog/basic")

    const trigger = page.getByTestId("trigger-1")
    const close = page.getByTestId("close-1")
    const input = page.getByPlaceholder("Enter name...")

    await trigger.click()
    await expect(input).toBeFocused()

    await page.keyboard.press("Escape")
    await expect(close).not.toBeVisible()
    await expect(trigger).toBeFocused()
  })
})
