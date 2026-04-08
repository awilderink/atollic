import { expect, test } from "./fixtures.js";

test.describe("Context", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/context");
	});

	test("Solid context: cards render initially in light theme", async ({
		page,
	}) => {
		const section = page.getByTestId("solid-context-section");
		// At least one card should be visible
		await expect(
			section.locator("div").filter({ hasText: "Dashboard" }).first(),
		).toBeVisible();
	});

	test("Solid context: toggle switches theme for all cards", async ({
		page,
	}) => {
		const section = page.getByTestId("solid-context-section");
		await section.getByRole("button", { name: /switch to dark/i }).click();
		await section.getByRole("button", { name: /switch to light/i }).isVisible();
	});

	test("React context: initial light theme", async ({ page }) => {
		const card = page.getByTestId("react-context-card-0");
		await expect(card).toHaveAttribute("data-theme", "light");
	});

	test("React context: toggle switches theme", async ({ page }) => {
		await page.getByTestId("react-context-toggle").click();
		const card = page.getByTestId("react-context-card-0");
		await expect(card).toHaveAttribute("data-theme", "dark");
	});

	test("React context: all cards switch together", async ({ page }) => {
		await page.getByTestId("react-context-toggle").click();
		await expect(page.getByTestId("react-context-card-0")).toHaveAttribute(
			"data-theme",
			"dark",
		);
		await expect(page.getByTestId("react-context-card-1")).toHaveAttribute(
			"data-theme",
			"dark",
		);
		await expect(page.getByTestId("react-context-card-2")).toHaveAttribute(
			"data-theme",
			"dark",
		);
	});

	test("React context: toggle back to light theme", async ({ page }) => {
		await page.getByTestId("react-context-toggle").click();
		await page.getByTestId("react-context-toggle").click();
		await expect(page.getByTestId("react-context-card-0")).toHaveAttribute(
			"data-theme",
			"light",
		);
	});

	test("no context leak: toggling island-1 does not affect island-2", async ({
		page,
	}) => {
		const island1 = page.getByTestId("context-island-1");
		const island2 = page.getByTestId("context-island-2");
		await island1.getByRole("button", { name: /switch to dark/i }).click();
		// island-2 should still have light theme toggle available
		await expect(
			island2.getByRole("button", { name: /switch to dark/i }),
		).toBeVisible();
	});
});
