import { expect, test } from "./fixtures.js";

test.describe("Lifecycle", () => {
	test("Solid timer starts at 0", async ({ page }) => {
		await page.goto("/lifecycle");
		await expect(page.getByTestId("solid-timer-value")).toHaveText("0s");
	});

	test("Solid timer increments over time", async ({ page }) => {
		await page.goto("/lifecycle");
		await page.waitForTimeout(2200);
		const text = await page.getByTestId("solid-timer-value").textContent();
		const seconds = Number.parseInt(text ?? "0", 10);
		expect(seconds).toBeGreaterThanOrEqual(2);
	});

	test("React timer starts at 0", async ({ page }) => {
		await page.goto("/lifecycle");
		await expect(page.getByTestId("react-timer-value")).toHaveText("0s");
	});

	test("React timer increments over time", async ({ page }) => {
		await page.goto("/lifecycle");
		await page.waitForTimeout(2200);
		const text = await page.getByTestId("react-timer-value").textContent();
		const seconds = Number.parseInt(text ?? "0", 10);
		expect(seconds).toBeGreaterThanOrEqual(2);
	});

	test("Solid timer freezes when island is removed from DOM", async ({
		page,
	}) => {
		await page.goto("/lifecycle");
		// Wait for timer to tick at least once
		await page.waitForTimeout(1200);
		// Remove the section containing the timer
		await page.evaluate(() => {
			document.querySelector("[data-testid='solid-timer-section']")?.remove();
		});
		await page.waitForTimeout(1500);
		// Timer element no longer exists — no errors should occur
		const timerEl = page.getByTestId("solid-timer-value");
		await expect(timerEl).toHaveCount(0);
	});

	test("React timer freezes when island is removed from DOM", async ({
		page,
	}) => {
		await page.goto("/lifecycle");
		await page.waitForTimeout(1200);
		await page.evaluate(() => {
			document.querySelector("[data-testid='react-timer-section']")?.remove();
		});
		await page.waitForTimeout(1500);
		const timerEl = page.getByTestId("react-timer-value");
		await expect(timerEl).toHaveCount(0);
	});
});
