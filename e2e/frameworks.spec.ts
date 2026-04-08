import { expect, test } from "@playwright/test";

test.describe("Frameworks", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/frameworks");
	});

	test("Solid counter SSR content is present", async ({ page }) => {
		await expect(page.getByTestId("solid-count")).toBeAttached();
		await expect(page.getByTestId("solid-count")).not.toBeEmpty();
	});

	test("React counter SSR content is present", async ({ page }) => {
		await expect(page.getByTestId("react-count")).toBeAttached();
		await expect(page.getByTestId("react-count")).not.toBeEmpty();
	});

	test("Solid counter starts at initial value 10", async ({ page }) => {
		await expect(page.getByTestId("solid-count")).toHaveText("10");
	});

	test("React counter starts at initial value 20", async ({ page }) => {
		await expect(page.getByTestId("react-count")).toHaveText("20");
	});

	test("Solid counter increments independently", async ({ page }) => {
		await page.getByTestId("solid-inc").click();
		await expect(page.getByTestId("solid-count")).toHaveText("11");
		// React counter must be unaffected
		await expect(page.getByTestId("react-count")).toHaveText("20");
	});

	test("React counter increments independently", async ({ page }) => {
		await page.getByTestId("react-inc").click();
		await expect(page.getByTestId("react-count")).toHaveText("21");
		// Solid counter must be unaffected
		await expect(page.getByTestId("solid-count")).toHaveText("10");
	});

	test("both frameworks coexist without console errors", async ({ page }) => {
		const errors: string[] = [];
		page.on("console", (msg) => {
			if (msg.type() === "error") errors.push(msg.text());
		});
		await page.reload();
		// Give hydration a moment
		await page.waitForTimeout(500);
		expect(errors).toHaveLength(0);
	});
});
