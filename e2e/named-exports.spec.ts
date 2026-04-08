import { expect, test } from "@playwright/test";

test.describe("Named Exports", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/named-exports");
	});

	test("Solid IslandA renders and hydrates", async ({ page }) => {
		await expect(page.getByTestId("solid-island-a-count")).toHaveText("0");
		await page.getByTestId("solid-island-a-inc").click();
		await expect(page.getByTestId("solid-island-a-count")).toHaveText("1");
	});

	test("Solid IslandB renders and hydrates", async ({ page }) => {
		await expect(page.getByTestId("solid-island-b-count")).toHaveText("0");
		await page.getByTestId("solid-island-b-inc").click();
		await expect(page.getByTestId("solid-island-b-count")).toHaveText("1");
	});

	test("Solid IslandC renders and hydrates", async ({ page }) => {
		await expect(page.getByTestId("solid-island-c-count")).toHaveText("0");
		await page.getByTestId("solid-island-c-inc").click();
		await expect(page.getByTestId("solid-island-c-count")).toHaveText("1");
	});

	test("Solid islands A/B/C are independent", async ({ page }) => {
		await page.getByTestId("solid-island-a-inc").click();
		await page.getByTestId("solid-island-a-inc").click();
		await page.getByTestId("solid-island-b-inc").click();
		await expect(page.getByTestId("solid-island-a-count")).toHaveText("2");
		await expect(page.getByTestId("solid-island-b-count")).toHaveText("1");
		await expect(page.getByTestId("solid-island-c-count")).toHaveText("0");
	});

	test("React IslandA renders and hydrates", async ({ page }) => {
		await expect(page.getByTestId("react-island-a-count")).toHaveText("0");
		await page.getByTestId("react-island-a-inc").click();
		await expect(page.getByTestId("react-island-a-count")).toHaveText("1");
	});

	test("React IslandB renders and hydrates", async ({ page }) => {
		await expect(page.getByTestId("react-island-b-count")).toHaveText("0");
		await page.getByTestId("react-island-b-inc").click();
		await expect(page.getByTestId("react-island-b-count")).toHaveText("1");
	});

	test("React IslandC renders and hydrates", async ({ page }) => {
		await expect(page.getByTestId("react-island-c-count")).toHaveText("0");
		await page.getByTestId("react-island-c-inc").click();
		await expect(page.getByTestId("react-island-c-count")).toHaveText("1");
	});

	test("React islands A/B/C are independent", async ({ page }) => {
		await page.getByTestId("react-island-a-inc").click();
		await page.getByTestId("react-island-a-inc").click();
		await page.getByTestId("react-island-b-inc").click();
		await expect(page.getByTestId("react-island-a-count")).toHaveText("2");
		await expect(page.getByTestId("react-island-b-count")).toHaveText("1");
		await expect(page.getByTestId("react-island-c-count")).toHaveText("0");
	});
});
