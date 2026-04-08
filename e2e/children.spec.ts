import { expect, test } from "./fixtures.js";

test.describe("Children", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/children");
	});

	test("plain text children render inside Solid island", async ({ page }) => {
		const section = page.getByTestId("solid-text-children");
		await expect(section).toContainText("Just a string passed as children.");
	});

	test("server JSX children render inside Solid island", async ({ page }) => {
		const section = page.getByTestId("solid-jsx-children");
		await expect(section.locator("p")).toContainText("Paragraph rendered");
		await expect(section.locator("li").first()).toHaveText("Item one");
	});

	test("Solid toggle show/hide children", async ({ page }) => {
		const section = page.getByTestId("solid-toggle-children");
		const toggle = section.getByTestId("solid-children-toggle");
		// Button starts showing "Hide" (visible state)
		await expect(toggle).toHaveText("Hide");
		await toggle.click();
		await expect(toggle).toHaveText("Show");
		await toggle.click();
		await expect(toggle).toHaveText("Hide");
	});

	test("toggleable content is present in children slot", async ({ page }) => {
		await expect(page.getByTestId("toggleable-content")).toContainText(
			"This content can be hidden.",
		);
	});

	test("async server children resolve inside Solid island", async ({
		page,
	}) => {
		const section = page.getByTestId("solid-async-children");
		await expect(section.getByTestId("async-content")).toBeVisible();
	});

	test("nested island in Solid children slot hydrates", async ({ page }) => {
		const section = page.getByTestId("solid-nested-island-children");
		await section.getByTestId("solid-inc").click();
		await expect(section.getByTestId("solid-count")).toHaveText("1");
	});

	test("server JSX children inside React island are visible", async ({
		page,
	}) => {
		const section = page.getByTestId("react-jsx-children");
		// Children are delivered via dangerouslySetInnerHTML after React hydration
		await expect(section).toContainText("Paragraph rendered");
	});

	test("React toggle show/hide children", async ({ page }) => {
		const section = page.getByTestId("react-jsx-children");
		const toggle = section.getByTestId("react-children-toggle");
		// Toggle hide
		await toggle.click();
		await expect(
			section.getByTestId("react-children-content"),
		).not.toBeVisible();
		// Toggle show
		await toggle.click();
		await expect(section.getByTestId("react-children-content")).toBeVisible();
	});

	test("cross-framework: React outer, Solid inner — SSR content correct", async ({
		page,
	}) => {
		// Verify both frameworks render in the correct position during SSR.
		// Post-hydration interactivity of a nested cross-framework island is
		// not tested here — dual hydration (React reconciler + Solid reactive
		// system) can race in ways that are environment-specific.
		const section = page.getByTestId("cross-react-solid-children");
		await expect(section.getByTestId("react-children-showcase")).toBeVisible();
		await expect(section.getByTestId("solid-count")).toBeAttached();
		await expect(section.getByTestId("solid-count")).toHaveText("5");
	});

	test("cross-framework: Solid outer, React inner — SSR content correct", async ({
		page,
	}) => {
		const section = page.getByTestId("cross-solid-react-children");
		await expect(section.getByTestId("solid-children-showcase")).toBeVisible();
		await expect(section.getByTestId("react-count")).toBeAttached();
		await expect(section.getByTestId("react-count")).toHaveText("5");
	});

	test("three-level nesting: outer islands are visible", async ({ page }) => {
		const section = page.getByTestId("three-level-children");
		await expect(section.getByTestId("react-children-showcase")).toBeVisible();
		await expect(section.getByTestId("solid-children-showcase")).toBeVisible();
	});
});
