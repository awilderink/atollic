import { expect, test } from "./fixtures.js";

test.describe("Universal Components", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/universal");
	});

	test("server-rendered Button has class attr and no onclick", async ({
		page,
	}) => {
		const btn = page.getByTestId("server-universal-btn");
		await expect(btn).toBeAttached();
		await expect(btn).toHaveAttribute("class", "server-btn");
		const onclick = await btn.getAttribute("onclick");
		expect(onclick).toBeNull();
	});

	test("React island with shared Button increments on click", async ({
		page,
	}) => {
		await expect(page.getByTestId("react-universal-count")).toHaveText("0");
		await page.getByTestId("react-universal-btn").click();
		await expect(page.getByTestId("react-universal-count")).toHaveText("1");
	});

	test("Solid island with shared Button increments on click", async ({
		page,
	}) => {
		await expect(page.getByTestId("solid-universal-count")).toHaveText("0");
		await page.getByTestId("solid-universal-btn").click();
		await expect(page.getByTestId("solid-universal-count")).toHaveText("1");
	});

	test("both frameworks use same shared component without errors", async ({
		page,
	}) => {
		const errors: string[] = [];
		page.on("console", (msg) => {
			if (msg.type() === "error") errors.push(msg.text());
		});
		await page.reload();
		await page.waitForFunction(
			() =>
				(window as unknown as { __atollicReady?: boolean }).__atollicReady ===
				true,
			undefined,
			{ timeout: 10_000 },
		);
		expect(errors).toHaveLength(0);
	});
});
