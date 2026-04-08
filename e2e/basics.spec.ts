import { expect, test } from "@playwright/test";

test.describe("Basics", () => {
	test("Solid counter SSR content present before hydration", async ({ page }) => {
		await page.goto("/basics");
		// The count strong tag exists in the SSR HTML
		const count = page.getByTestId("solid-count");
		await expect(count).toBeAttached();
		await expect(count).toHaveText("0");
	});

	test("Solid counter increments on click", async ({ page }) => {
		await page.goto("/basics");
		await page.getByTestId("solid-inc").first().click();
		await expect(page.getByTestId("solid-count").first()).toHaveText("1");
	});

	test("Solid counter decrements on click", async ({ page }) => {
		await page.goto("/basics");
		await page.getByTestId("solid-inc").first().click();
		await page.getByTestId("solid-inc").first().click();
		await page.getByTestId("solid-dec").first().click();
		await expect(page.getByTestId("solid-count").first()).toHaveText("1");
	});

	test("React counter SSR content present before hydration", async ({ page }) => {
		await page.goto("/basics");
		const count = page.getByTestId("react-count");
		await expect(count).toBeAttached();
		await expect(count).toHaveText("0");
	});

	test("React counter increments on click", async ({ page }) => {
		await page.goto("/basics");
		await page.getByTestId("react-inc").click();
		await expect(page.getByTestId("react-count")).toHaveText("1");
	});

	test("Solid no-prop island renders without props", async ({ page }) => {
		await page.goto("/basics");
		await expect(page.getByTestId("solid-noprop")).toBeVisible();
		await expect(page.getByTestId("solid-noprop")).toContainText("Solid island");
	});

	test("React no-prop island renders without props", async ({ page }) => {
		await page.goto("/basics");
		await expect(page.getByTestId("react-noprop")).toBeVisible();
		await expect(page.getByTestId("react-noprop")).toContainText("React island");
	});

	test("two Solid counters are independent", async ({ page }) => {
		await page.goto("/basics");
		const counters = page.getByTestId("solid-count");
		const incs = page.getByTestId("solid-inc");
		// Click the first counter's + button (inside counter-a section)
		await page.getByTestId("counter-a").getByTestId("solid-inc").click();
		await expect(page.getByTestId("counter-a").getByTestId("solid-count")).toHaveText("1");
		await expect(page.getByTestId("counter-b").getByTestId("solid-count")).toHaveText("0");
	});

	test("zero-js page has no data-island elements", async ({ page }) => {
		await page.goto("/zero-js");
		const islands = page.locator("[data-island]");
		await expect(islands).toHaveCount(0);
	});

	test("zero-js page renders heading", async ({ page }) => {
		await page.goto("/zero-js");
		await expect(page.getByTestId("zero-js-heading")).toHaveText("Zero JS");
	});
});
