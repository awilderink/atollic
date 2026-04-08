import { expect, test } from "./fixtures.js";

test.describe("Async Server Components", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/async");
	});

	test("standalone async component content is visible", async ({ page }) => {
		const section = page.getByTestId("async-standalone-section");
		await expect(section.getByTestId("async-content")).toBeVisible();
		await expect(section.getByTestId("async-content")).toHaveText(
			"Async server content resolved",
		);
	});

	test("async component as island children resolves", async ({ page }) => {
		const section = page.getByTestId("async-as-children-section");
		await expect(section.getByTestId("async-content")).toBeVisible();
	});

	test("multiple async components all resolve", async ({ page }) => {
		const section = page.getByTestId("async-multiple-section");
		const items = section.getByTestId("async-content");
		await expect(items).toHaveCount(3);
	});

	test("page has no console errors from async resolution", async ({ page }) => {
		const errors: string[] = [];
		page.on("console", (msg) => {
			if (msg.type() === "error") errors.push(msg.text());
		});
		await page.reload();
		await page.waitForTimeout(500);
		expect(errors).toHaveLength(0);
	});
});
