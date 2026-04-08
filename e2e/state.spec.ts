import { expect, test } from "./fixtures.js";

test.describe("Cross-island State", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/state");
	});

	test("panel starts hidden", async ({ page }) => {
		const toggleBtn = page.getByRole("button", { name: /show panel/i });
		await expect(toggleBtn).toBeVisible();
	});

	test("clicking toggle reveals the panel", async ({ page }) => {
		await page.getByRole("button", { name: /show panel/i }).click();
		// After toggle, panel content is visible
		await expect(page.locator("#demo-panel")).toContainText(
			"This panel is driven by a shared signal.",
		);
	});

	test("clicking toggle again hides the panel", async ({ page }) => {
		const btn = page.getByRole("button", { name: /show panel/i });
		await btn.click();
		await page.getByRole("button", { name: /hide panel/i }).click();
		// Panel collapses — button text returns to "Show"
		await expect(
			page.getByRole("button", { name: /show panel/i }),
		).toBeVisible();
	});

	test("second panel on same signal responds to toggle", async ({ page }) => {
		await page.getByRole("button", { name: /show panel/i }).click();
		// Both panel divs should now show their content
		await expect(page.locator("#demo-panel")).toContainText(
			"This panel is driven by a shared signal.",
		);
		await expect(page.locator("#demo-panel-2")).toContainText(
			"Second panel — same signal source.",
		);
	});
});
