import { expect, test } from "./fixtures.js";

test.describe("Dynamic Island Insertion", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/dynamic");
	});

	test("insert Solid island via button click hydrates", async ({ page }) => {
		await page.getByTestId("insert-solid-btn").click();
		await expect(page.getByTestId("solid-count")).toBeVisible({
			timeout: 5000,
		});
	});

	test("inserted Solid island is interactive", async ({ page }) => {
		await page.getByTestId("insert-solid-btn").click();
		await expect(page.getByTestId("solid-count")).toBeVisible({
			timeout: 5000,
		});
		await page.getByTestId("solid-inc").click();
		await expect(page.getByTestId("solid-count")).toHaveText("1");
	});

	test("insert React island via button click hydrates", async ({ page }) => {
		await page.getByTestId("insert-react-btn").click();
		await expect(page.getByTestId("react-count")).toBeVisible({
			timeout: 5000,
		});
	});

	test("inserted React island is interactive", async ({ page }) => {
		await page.getByTestId("insert-react-btn").click();
		await expect(page.getByTestId("react-count")).toBeVisible({
			timeout: 5000,
		});
		await page.getByTestId("react-inc").click();
		await expect(page.getByTestId("react-count")).toHaveText("1");
	});

	test("clear button removes all inserted islands", async ({ page }) => {
		await page.getByTestId("insert-solid-btn").click();
		await expect(page.getByTestId("solid-count")).toBeVisible({
			timeout: 5000,
		});
		await page.getByTestId("clear-btn").click();
		await expect(page.getByTestId("solid-count")).toHaveCount(0);
	});

	test("inserting multiple islands all hydrate", async ({ page }) => {
		await page.getByTestId("insert-solid-btn").click();
		await page.getByTestId("insert-react-btn").click();
		await expect(page.getByTestId("solid-count")).toBeVisible({
			timeout: 5000,
		});
		await expect(page.getByTestId("react-count")).toBeVisible({
			timeout: 5000,
		});
	});

	test("remove then re-insert remounts cleanly", async ({ page }) => {
		await page.getByTestId("insert-solid-btn").click();
		await expect(page.getByTestId("solid-count")).toBeVisible({
			timeout: 5000,
		});
		await page.getByTestId("clear-btn").click();
		await page.getByTestId("insert-solid-btn").click();
		// New island starts at 0 again
		await expect(page.getByTestId("solid-count")).toHaveText("0", {
			timeout: 5000,
		});
	});
});
