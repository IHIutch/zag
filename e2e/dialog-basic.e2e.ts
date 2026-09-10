import { expect, test } from "@playwright/test"

test.describe("basic dialog", () => {
  test("opens, moves focus into the dialog, and closes with escape", async ({ page }) => {
    await page.goto("/dialog/basic")

    const trigger = page.getByRole("main").getByRole("button").first()
    const dialog = page.getByRole("dialog")

    await trigger.click()
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText("Edit profile")
    await expect.poll(() => dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true)

    await page.keyboard.press("Escape")
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
  })
})
