import { expect, test } from "@playwright/test";

test.describe("HTMX", () => {
	test("page loads without console errors", async ({ page }) => {
		const errors: string[] = [];
		page.on("console", (msg) => {
			if (msg.type() === "error") errors.push(msg.text());
		});
		await page.goto("/htmx");
		await page.waitForTimeout(300);
		expect(errors).toHaveLength(0);
	});

	test("load button is present", async ({ page }) => {
		await page.goto("/htmx");
		await expect(page.getByTestId("htmx-load-btn")).toBeVisible();
	});

	test("htmx target is initially empty of islands", async ({ page }) => {
		await page.goto("/htmx");
		const islands = page.getByTestId("htmx-target").locator("[data-island]");
		await expect(islands).toHaveCount(0);
	});

	test("clicking load inserts island via HTMX swap", async ({ page }) => {
		await page.goto("/htmx");
		await page.getByTestId("htmx-load-btn").click();
		// Wait for HTMX swap + hydration
		await expect(page.getByTestId("solid-count")).toBeVisible({ timeout: 5000 });
	});

	test("island inserted by HTMX is interactive", async ({ page }) => {
		await page.goto("/htmx");
		await page.getByTestId("htmx-load-btn").click();
		await expect(page.getByTestId("solid-count")).toBeVisible({ timeout: 5000 });
		await page.getByTestId("solid-inc").click();
		await expect(page.getByTestId("solid-count")).toHaveText("1");
	});

	test("second click replaces the island (innerHTML swap)", async ({ page }) => {
		await page.goto("/htmx");
		await page.getByTestId("htmx-load-btn").click();
		await expect(page.getByTestId("solid-count")).toBeVisible({ timeout: 5000 });
		// Increment, then reload — counter should reset
		await page.getByTestId("solid-inc").click();
		await page.getByTestId("htmx-load-btn").click();
		await expect(page.getByTestId("solid-count")).toHaveText("0", { timeout: 5000 });
	});

	test("fragment-only response is valid HTML with island wrapper", async ({ page }) => {
		const response = await page.request.get("/htmx/fragment");
		expect(response.ok()).toBe(true);
		const body = await response.text();
		expect(body).toContain("data-island");
	});
});
