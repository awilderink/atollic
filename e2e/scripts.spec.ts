import { expect, test } from "@playwright/test";

test.describe("Client Scripts", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/scripts");
	});

	test("window.__atollicScriptRan is true after hydration", async ({ page }) => {
		// Give the client script a moment to execute
		await page.waitForFunction(() => (window as Record<string, unknown>).__atollicScriptRan === true, {
			timeout: 5000,
		});
		const ran = await page.evaluate(
			() => (window as Record<string, unknown>).__atollicScriptRan,
		);
		expect(ran).toBe(true);
	});

	test("DOM marker element is updated by script", async ({ page }) => {
		await page.waitForFunction(
			() => document.getElementById("script-target")?.getAttribute("data-ran") === "true",
			{ timeout: 5000 },
		);
		await expect(page.getByTestId("script-target")).toHaveAttribute("data-ran", "true");
		await expect(page.getByTestId("script-target")).toHaveText("Script ran!");
	});

	test("SSR response HTML does not include __atollicScriptRan", async ({ page }) => {
		const response = await page.request.get("/scripts");
		const body = await response.text();
		expect(body).not.toContain("__atollicScriptRan");
	});
});
