import { expect, test } from "@playwright/test";

test.describe("Props", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/props");
	});

	// --- Solid ---

	test("Solid: plain string rendered", async ({ page }) => {
		await expect(page.getByTestId("solid-prop-plain-string")).toHaveText("hello world");
	});

	test("Solid: html-string shown as escaped text", async ({ page }) => {
		const el = page.getByTestId("solid-prop-html-string");
		await expect(el).toBeVisible();
		// Content should be visible as text, not interpreted as HTML
		await expect(el).toContainText("bold");
	});

	test("Solid: XSS string does not execute script", async ({ page }) => {
		// If XSS worked, window.__xss would be 1
		const xss = await page.evaluate(() => (window as Record<string, unknown>).__xss);
		expect(xss).toBeUndefined();
		await expect(page.getByTestId("solid-prop-xss-string")).toBeVisible();
	});

	test("Solid: integer prop", async ({ page }) => {
		await expect(page.getByTestId("solid-prop-int")).toHaveText("42");
	});

	test("Solid: float prop", async ({ page }) => {
		await expect(page.getByTestId("solid-prop-float")).toHaveText("3.14");
	});

	test("Solid: negative number prop", async ({ page }) => {
		await expect(page.getByTestId("solid-prop-negative")).toHaveText("-7");
	});

	test("Solid: zero prop", async ({ page }) => {
		await expect(page.getByTestId("solid-prop-zero")).toHaveText("0");
	});

	test("Solid: bool-true prop", async ({ page }) => {
		await expect(page.getByTestId("solid-prop-bool-true")).toHaveText("true");
	});

	test("Solid: bool-false prop", async ({ page }) => {
		await expect(page.getByTestId("solid-prop-bool-false")).toHaveText("false");
	});

	test("Solid: null prop shown", async ({ page }) => {
		await expect(page.getByTestId("solid-prop-null-val")).toBeVisible();
	});

	test("Solid: string array prop joined", async ({ page }) => {
		await expect(page.getByTestId("solid-prop-str-array")).toHaveText("a,b,c");
	});

	test("Solid: nested object prop", async ({ page }) => {
		await expect(page.getByTestId("solid-prop-nested-obj")).toHaveText("deep");
	});

	// --- React ---

	test("React: plain string rendered", async ({ page }) => {
		await expect(page.getByTestId("react-prop-plain-string")).toHaveText("hello world");
	});

	test("React: integer prop", async ({ page }) => {
		await expect(page.getByTestId("react-prop-int")).toHaveText("42");
	});

	test("React: float prop", async ({ page }) => {
		await expect(page.getByTestId("react-prop-float")).toHaveText("3.14");
	});

	test("React: negative number prop", async ({ page }) => {
		await expect(page.getByTestId("react-prop-negative")).toHaveText("-7");
	});

	test("React: zero prop", async ({ page }) => {
		await expect(page.getByTestId("react-prop-zero")).toHaveText("0");
	});

	test("React: bool-true prop", async ({ page }) => {
		await expect(page.getByTestId("react-prop-bool-true")).toHaveText("true");
	});

	test("React: bool-false prop", async ({ page }) => {
		await expect(page.getByTestId("react-prop-bool-false")).toHaveText("false");
	});

	test("React: string array prop joined", async ({ page }) => {
		await expect(page.getByTestId("react-prop-str-array")).toHaveText("a,b,c");
	});

	test("React: nested object prop", async ({ page }) => {
		await expect(page.getByTestId("react-prop-nested-obj")).toHaveText("deep");
	});

	test("React: XSS string does not execute script", async ({ page }) => {
		const xss = await page.evaluate(() => (window as Record<string, unknown>).__xss);
		expect(xss).toBeUndefined();
	});
});
