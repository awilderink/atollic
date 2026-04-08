# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: async.spec.ts >> Async Server Components >> async component as island children resolves
- Location: e2e/async.spec.ts:14:2

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('async-as-children-section').getByTestId('async-content')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('async-as-children-section').getByTestId('async-content')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
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
  - heading "Async Server Components" [level=1] [ref=e16]
  - generic [ref=e17]:
    - heading "Standalone async component" [level=2] [ref=e18]
    - paragraph [ref=e19]: Async server content resolved
  - generic [ref=e20]:
    - heading "Async component as island children" [level=2] [ref=e21]
    - generic [ref=e23]:
      - generic [ref=e24]:
        - strong [ref=e25]: Async children
        - button "🤍" [ref=e26] [cursor=pointer]
      - generic [ref=e27]: "[object Promise]"
  - generic [ref=e28]:
    - heading "Multiple async components" [level=2] [ref=e29]
    - paragraph [ref=e30]: Async server content resolved
    - paragraph [ref=e31]: Async server content resolved
    - paragraph [ref=e32]: Async server content resolved
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test.describe("Async Server Components", () => {
  4  | 	test.beforeEach(async ({ page }) => {
  5  | 		await page.goto("/async");
  6  | 	});
  7  | 
  8  | 	test("standalone async component content is visible", async ({ page }) => {
  9  | 		const section = page.getByTestId("async-standalone-section");
  10 | 		await expect(section.getByTestId("async-content")).toBeVisible();
  11 | 		await expect(section.getByTestId("async-content")).toHaveText("Async server content resolved");
  12 | 	});
  13 | 
  14 | 	test("async component as island children resolves", async ({ page }) => {
  15 | 		const section = page.getByTestId("async-as-children-section");
> 16 | 		await expect(section.getByTestId("async-content")).toBeVisible();
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  17 | 	});
  18 | 
  19 | 	test("multiple async components all resolve", async ({ page }) => {
  20 | 		const section = page.getByTestId("async-multiple-section");
  21 | 		const items = section.getByTestId("async-content");
  22 | 		await expect(items).toHaveCount(3);
  23 | 	});
  24 | 
  25 | 	test("page has no console errors from async resolution", async ({ page }) => {
  26 | 		const errors: string[] = [];
  27 | 		page.on("console", (msg) => {
  28 | 			if (msg.type() === "error") errors.push(msg.text());
  29 | 		});
  30 | 		await page.reload();
  31 | 		await page.waitForTimeout(500);
  32 | 		expect(errors).toHaveLength(0);
  33 | 	});
  34 | });
  35 | 
```