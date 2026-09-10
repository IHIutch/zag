import { expect, test } from "@playwright/test"

test.describe("range slider", () => {
  test("supports keyboard interaction for both thumbs", async ({ page }) => {
    await page.goto("/range-slider/basic")

    const thumbs = page.getByRole("slider")
    await expect(thumbs).toHaveCount(2)
    await expect(thumbs.nth(0)).toHaveAttribute("aria-valuenow", "10")
    await expect(thumbs.nth(1)).toHaveAttribute("aria-valuenow", "60")

    await thumbs.nth(0).focus()
    await thumbs.nth(0).press("ArrowRight")
    await expect(thumbs.nth(0)).toHaveAttribute("aria-valuenow", "11")

    await thumbs.nth(1).focus()
    await thumbs.nth(1).press("ArrowLeft")
    await expect(thumbs.nth(1)).toHaveAttribute("aria-valuenow", "59")
  })
})
