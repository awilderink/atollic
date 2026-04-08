# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: state.spec.ts >> Cross-island State >> clicking toggle reveals the panel
- Location: e2e/state.spec.ts:16:2

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#demo-panel')
Expected substring: "This panel is driven by a shared signal."
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('#demo-panel')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - navigation [ref=e2]:
    - link "Basics" [ref=e3] [cursor=pointer]:
      - /url: /basics
    - link "Zero JS" [ref=e4] [cursor=pointer]:
      - /url: /zero-js
    - link "Props" [ref=e5] [cursor=pointer]:
      - /url: /props
    - link "Frameworks" [ref=e6] [cursor=pointer]:
      - /url: /frameworks
    - link "Children" [ref=e7] [cursor=pointer]:
      - /url: /children
    - link "Named Exports" [ref=e8] [cursor=pointer]:
      - /url: /named-exports
    - link "State" [ref=e9] [cursor=pointer]:
      - /url: /state
    - link "Context" [ref=e10] [cursor=pointer]:
      - /url: /context
    - link "Lifecycle" [ref=e11] [cursor=pointer]:
      - /url: /lifecycle
    - link "HTMX" [ref=e12] [cursor=pointer]:
      - /url: /htmx
    - link "Dynamic" [ref=e13] [cursor=pointer]:
      - /url: /dynamic
    - link "Scripts" [ref=e14] [cursor=pointer]:
      - /url: /scripts
    - link "Async" [ref=e15] [cursor=pointer]:
      - /url: /async
  - heading "Cross-island State" [level=1] [ref=e16]
  - paragraph [ref=e17]: Toggle and Panel share a module-level signal — separate island roots, no context provider.
  - generic [ref=e18]:
    - button "Hide Show panel" [active] [ref=e20]
    - generic [ref=e23]: This panel is driven by a shared signal.
  - generic [ref=e24]:
    - paragraph [ref=e25]: "A second panel on the same signal:"
    - generic [ref=e26]: Second panel — same signal source.
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test.describe("Cross-island State", () => {
  4  | 	test.beforeEach(async ({ page }) => {
  5  | 		await page.goto("/state");
  6  | 	});
  7  | 
  8  | 	test("panel starts hidden", async ({ page }) => {
  9  | 		// Panel starts with max-height 0 / opacity 0 (closed state)
  10 | 		const panel = page.locator("#demo-panel");
  11 | 		// Check that the toggle button says "Show"
  12 | 		const toggleBtn = page.getByRole("button", { name: /show panel/i });
  13 | 		await expect(toggleBtn).toBeVisible();
  14 | 	});
  15 | 
  16 | 	test("clicking toggle reveals the panel", async ({ page }) => {
  17 | 		await page.getByRole("button", { name: /show panel/i }).click();
  18 | 		// After toggle, panel content is visible
> 19 | 		await expect(page.locator("#demo-panel")).toContainText(
     |                                             ^ Error: expect(locator).toContainText(expected) failed
  20 | 			"This panel is driven by a shared signal.",
  21 | 		);
  22 | 	});
  23 | 
  24 | 	test("clicking toggle again hides the panel", async ({ page }) => {
  25 | 		const btn = page.getByRole("button", { name: /show panel/i });
  26 | 		await btn.click();
  27 | 		await page.getByRole("button", { name: /hide panel/i }).click();
  28 | 		// Panel collapses — button text returns to "Show"
  29 | 		await expect(page.getByRole("button", { name: /show panel/i })).toBeVisible();
  30 | 	});
  31 | 
  32 | 	test("second panel on same signal responds to toggle", async ({ page }) => {
  33 | 		await page.getByRole("button", { name: /show panel/i }).click();
  34 | 		// Both panel divs should now show their content
  35 | 		await expect(page.locator("#demo-panel")).toContainText(
  36 | 			"This panel is driven by a shared signal.",
  37 | 		);
  38 | 		await expect(page.locator("#demo-panel-2")).toContainText(
  39 | 			"Second panel — same signal source.",
  40 | 		);
  41 | 	});
  42 | });
  43 | 
```