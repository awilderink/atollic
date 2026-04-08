import { expect, test } from "@playwright/test";

test.describe("Children", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/children");
	});

	test("plain text children render inside island", async ({ page }) => {
		const section = page.getByTestId("solid-text-children");
		await expect(section).toContainText("Just a string passed as children.");
	});

	test("server JSX children render inside Solid island", async ({ page }) => {
		const section = page.getByTestId("solid-jsx-children");
		await expect(section.locator("p")).toContainText("Paragraph rendered");
		await expect(section.locator("li").first()).toHaveText("Item one");
	});

	test("Solid toggle show/hide children", async ({ page }) => {
		// Content starts visible
		await expect(page.getByTestId("solid-children-content")).toBeVisible();
		// Click hide
		await page.getByTestId("solid-children-toggle").click();
		await expect(page.getByTestId("solid-children-content")).not.toBeVisible();
		// Click show
		await page.getByTestId("solid-children-toggle").click();
		await expect(page.getByTestId("solid-children-content")).toBeVisible();
	});

	test("toggleable content is present in children slot", async ({ page }) => {
		await expect(page.getByTestId("toggleable-content")).toContainText("This content can be hidden.");
	});

	test("async server children resolve inside Solid island", async ({ page }) => {
		const section = page.getByTestId("solid-async-children");
		await expect(section.getByTestId("async-content")).toBeVisible();
	});

	test("nested island in Solid children slot hydrates", async ({ page }) => {
		const section = page.getByTestId("solid-nested-island-children");
		await section.getByTestId("solid-inc").click();
		await expect(section.getByTestId("solid-count")).toHaveText("1");
	});

	test("server JSX children inside React island", async ({ page }) => {
		const section = page.getByTestId("react-jsx-children");
		await expect(section.locator("p")).toContainText("Paragraph rendered");
	});

	test("cross-framework: React outer with Solid inner hydrates both", async ({ page }) => {
		const section = page.getByTestId("cross-react-solid-children");
		// React toggle still works
		await expect(page.getByTestId("react-children-content").first()).toBeVisible();
		// Solid counter inside hydrates
		await section.getByTestId("solid-inc").click();
		await expect(section.getByTestId("solid-count")).toHaveText("6");
	});

	test("cross-framework: Solid outer with React inner hydrates both", async ({ page }) => {
		const section = page.getByTestId("cross-solid-react-children");
		// React counter inside hydrates
		await section.getByTestId("react-inc").click();
		await expect(section.getByTestId("react-count")).toHaveText("6");
	});

	test("three-level nesting: leaf server content visible", async ({ page }) => {
		await expect(page.getByTestId("three-level-leaf")).toHaveText("Leaf server content");
	});

	test("React toggle show/hide children", async ({ page }) => {
		const toggle = page.getByTestId("react-children-toggle").first();
		const content = page.getByTestId("react-children-content").first();
		await expect(content).toBeVisible();
		await toggle.click();
		await expect(content).not.toBeVisible();
		await toggle.click();
		await expect(content).toBeVisible();
	});
});
