import { test as base } from "@playwright/test";

/** Wraps page.goto to wait for __atollicReady so clicks don't race hydration. */
export const test = base.extend({
	page: async ({ page }, use) => {
		const originalGoto = page.goto.bind(page);
		page.goto = async (
			url: string,
			options?: Parameters<typeof originalGoto>[1],
		) => {
			const res = await originalGoto(url, options);
			await page.waitForFunction(
				() =>
					(window as unknown as { __atollicReady?: boolean }).__atollicReady ===
					true,
				undefined,
				{ timeout: 10_000 },
			);
			return res;
		};
		await use(page);
	},
});

export { expect } from "@playwright/test";
