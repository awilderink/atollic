# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: children.spec.ts >> Children >> three-level nesting: leaf server content visible
- Location: e2e/children.spec.ts:66:2

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByTestId('three-level-leaf')
Expected: "Leaf server content"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" with timeout 5000ms
  - waiting for getByTestId('three-level-leaf')

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
  - heading "Children" [level=1] [ref=e16]
  - generic [ref=e17]:
    - heading "Solid — plain text children" [level=2] [ref=e18]
    - generic [ref=e20]:
      - generic [ref=e21]:
        - strong [ref=e22]: Plain text
        - button "🤍" [ref=e23] [cursor=pointer]
      - generic [ref=e24]: Just a string passed as children.
  - generic [ref=e25]:
    - heading "Solid — server JSX children" [level=2] [ref=e26]
    - generic [ref=e28]:
      - generic [ref=e29]:
        - strong [ref=e30]: Server JSX
        - button "🤍" [ref=e31] [cursor=pointer]
      - generic [ref=e32]:
        - paragraph [ref=e33]:
          - text: Paragraph rendered
          - strong [ref=e34]: on the server
          - text: .
        - list [ref=e35]:
          - listitem [ref=e36]: Item one
          - listitem [ref=e37]: Item two
  - generic [ref=e38]:
    - heading "Solid — conditional children" [level=2] [ref=e39]
    - generic [ref=e41]:
      - generic [ref=e42]:
        - strong [ref=e43]: Toggle me
        - button "Hide" [ref=e44]
      - paragraph [ref=e46]: This content can be hidden.
  - generic [ref=e47]:
    - heading "Solid — async server children" [level=2] [ref=e48]
    - generic [ref=e50]:
      - generic [ref=e51]:
        - strong [ref=e52]: Async
        - button "🤍" [ref=e53] [cursor=pointer]
      - generic [ref=e54]: "[object Promise]"
  - generic [ref=e55]:
    - heading "Solid — nested island in children" [level=2] [ref=e56]
    - generic [ref=e58]:
      - generic [ref=e59]:
        - strong [ref=e60]: Outer card
        - button "🤍" [ref=e61] [cursor=pointer]
      - generic [ref=e64]:
        - paragraph [ref=e65]:
          - text: "Count:"
          - strong [ref=e66]: "0"
        - button "+" [ref=e67]
        - button "-" [ref=e68]
  - generic [ref=e69]:
    - heading "React — server JSX children" [level=2] [ref=e70]
    - generic [ref=e73]:
      - strong [ref=e74]: React + server JSX
      - button "Hide" [ref=e75]
  - generic [ref=e76]:
    - heading "Cross-framework — React outer, Solid inner" [level=2] [ref=e77]
    - generic [ref=e80]:
      - strong [ref=e81]: React outer
      - button "Hide" [ref=e82]
  - generic [ref=e83]:
    - heading "Cross-framework — Solid outer, React inner" [level=2] [ref=e84]
    - generic [ref=e86]:
      - generic [ref=e87]:
        - strong [ref=e88]: Solid outer
        - button "Hide" [ref=e89]
      - generic [ref=e92]:
        - paragraph [ref=e93]:
          - text: "Count:"
          - strong [ref=e94]: "5"
        - button "+" [ref=e95]
        - button "-" [ref=e96]
  - generic [ref=e97]:
    - heading "Three-level nesting" [level=2] [ref=e98]
    - generic [ref=e101]:
      - strong [ref=e102]: React L1
      - button "Hide" [ref=e103]
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test.describe("Children", () => {
  4  | 	test.beforeEach(async ({ page }) => {
  5  | 		await page.goto("/children");
  6  | 	});
  7  | 
  8  | 	test("plain text children render inside island", async ({ page }) => {
  9  | 		const section = page.getByTestId("solid-text-children");
  10 | 		await expect(section).toContainText("Just a string passed as children.");
  11 | 	});
  12 | 
  13 | 	test("server JSX children render inside Solid island", async ({ page }) => {
  14 | 		const section = page.getByTestId("solid-jsx-children");
  15 | 		await expect(section.locator("p")).toContainText("Paragraph rendered");
  16 | 		await expect(section.locator("li").first()).toHaveText("Item one");
  17 | 	});
  18 | 
  19 | 	test("Solid toggle show/hide children", async ({ page }) => {
  20 | 		// Content starts visible
  21 | 		await expect(page.getByTestId("solid-children-content")).toBeVisible();
  22 | 		// Click hide
  23 | 		await page.getByTestId("solid-children-toggle").click();
  24 | 		await expect(page.getByTestId("solid-children-content")).not.toBeVisible();
  25 | 		// Click show
  26 | 		await page.getByTestId("solid-children-toggle").click();
  27 | 		await expect(page.getByTestId("solid-children-content")).toBeVisible();
  28 | 	});
  29 | 
  30 | 	test("toggleable content is present in children slot", async ({ page }) => {
  31 | 		await expect(page.getByTestId("toggleable-content")).toContainText("This content can be hidden.");
  32 | 	});
  33 | 
  34 | 	test("async server children resolve inside Solid island", async ({ page }) => {
  35 | 		const section = page.getByTestId("solid-async-children");
  36 | 		await expect(section.getByTestId("async-content")).toBeVisible();
  37 | 	});
  38 | 
  39 | 	test("nested island in Solid children slot hydrates", async ({ page }) => {
  40 | 		const section = page.getByTestId("solid-nested-island-children");
  41 | 		await section.getByTestId("solid-inc").click();
  42 | 		await expect(section.getByTestId("solid-count")).toHaveText("1");
  43 | 	});
  44 | 
  45 | 	test("server JSX children inside React island", async ({ page }) => {
  46 | 		const section = page.getByTestId("react-jsx-children");
  47 | 		await expect(section.locator("p")).toContainText("Paragraph rendered");
  48 | 	});
  49 | 
  50 | 	test("cross-framework: React outer with Solid inner hydrates both", async ({ page }) => {
  51 | 		const section = page.getByTestId("cross-react-solid-children");
  52 | 		// React toggle still works
  53 | 		await expect(page.getByTestId("react-children-content").first()).toBeVisible();
  54 | 		// Solid counter inside hydrates
  55 | 		await section.getByTestId("solid-inc").click();
  56 | 		await expect(section.getByTestId("solid-count")).toHaveText("6");
  57 | 	});
  58 | 
  59 | 	test("cross-framework: Solid outer with React inner hydrates both", async ({ page }) => {
  60 | 		const section = page.getByTestId("cross-solid-react-children");
  61 | 		// React counter inside hydrates
  62 | 		await section.getByTestId("react-inc").click();
  63 | 		await expect(section.getByTestId("react-count")).toHaveText("6");
  64 | 	});
  65 | 
  66 | 	test("three-level nesting: leaf server content visible", async ({ page }) => {
> 67 | 		await expect(page.getByTestId("three-level-leaf")).toHaveText("Leaf server content");
     |                                                      ^ Error: expect(locator).toHaveText(expected) failed
  68 | 	});
  69 | 
  70 | 	test("React toggle show/hide children", async ({ page }) => {
  71 | 		const toggle = page.getByTestId("react-children-toggle").first();
  72 | 		const content = page.getByTestId("react-children-content").first();
  73 | 		await expect(content).toBeVisible();
  74 | 		await toggle.click();
  75 | 		await expect(content).not.toBeVisible();
  76 | 		await toggle.click();
  77 | 		await expect(content).toBeVisible();
  78 | 	});
  79 | });
  80 | 
```