# atollic

Island architecture for WinterCG-compatible runtimes. Bring your own server (Elysia, Hono, …) and your own UI framework, powered by Vite.

> **Status: experimental.** atollic is pre-1.0 (`v0.0.x`). The API may change between minor versions until 1.0.

- **Server-agnostic** — any WinterCG runtime that speaks `Request`/`Response` (Elysia, Hono, Bun, Node via adapter, Workers, …).
- **UI-framework-agnostic** — ships with a Solid.js adapter; Preact / React / others pluggable via `FrameworkAdapter`.
- **Zero-JS by default** — pages render to HTML strings on the server; only `"use client"` islands ship JavaScript.
- **HMR with state preserved** — server changes morph the DOM via idiomorph, keeping mounted islands alive.

## How it works

```
Server (Elysia, Hono, ...)     Client (Browser)
─────────────────────────────   ─────────────────────────
1. Route handler returns JSX    4. Find [data-island] elements
2. Islands SSR to real HTML     5. Lazy-import component module
3. Full page sent to browser    6. Hydrate with matching props
```

- Pages are **server-rendered JSX** using atollic's built-in HTML runtime — no virtual DOM, just strings.
- Components marked with `"use client"` become **islands** — they SSR on the server and hydrate on the client.
- Everything else is zero-JS static HTML.

## Quick start

```bash
bun add atollic elysia solid-js vite-plugin-solid
```

### Project structure

```
my-app/
  src/
    app.tsx          # Server entry — routes and layouts
    islands/
      Counter.tsx    # Interactive island component
  vite.config.ts
```

### `vite.config.ts`

```ts
import { defineConfig } from "vite";
import { solid } from "atollic/solid";
import { atollic } from "atollic/vite";

export default defineConfig({
  plugins: [
    atollic({
      entry: "./src/app.tsx",
      frameworks: [solid()],
    }),
  ],
});
```

### `src/app.tsx` — Server entry (Elysia)

```tsx
import { Elysia } from "elysia";
import { Head } from "atollic/head";
import { atollic } from "atollic/elysia";
import Counter from "./islands/Counter.js";

const app = new Elysia()
  .use(atollic())
  .get("/", () => (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <Head />
      </head>
      <body>
        <h1>Hello from the server</h1>
        <Counter initial={0} />
      </body>
    </html>
  ));

export default app.handle;
```

### `src/islands/Counter.tsx` — Island component

```tsx
/** @jsxImportSource solid-js */
"use client";

import { createSignal } from "solid-js";

export default function Counter(props: { initial: number }) {
  const [count, setCount] = createSignal(props.initial);
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Count: {count()}
    </button>
  );
}
```

### Run

```bash
bunx --bun vite        # Dev server with HMR
bunx --bun vite build  # Production build
bun dist/server/app.js # Start production server
```

## Server adapters

Atollic is decoupled from any specific server. Your entry file exports a fetch function — atollic handles the rest.

### Elysia

```ts
import { Elysia } from "elysia";
import { atollic } from "atollic/elysia";

const app = new Elysia()
  .use(atollic())
  .get("/", () => <h1>Hello</h1>);

export default app.handle;
```

The Elysia adapter intercepts responses via `mapResponse`, extracts HTML, ensures DOCTYPE, and injects production assets.

The HTML-extraction step is **registry-based** — each `FrameworkAdapter` contributes an extractor function (via the `extractHtml` field) that knows how to convert its framework's SSR output (e.g. Solid's `{ t: "..." }` shape) into a plain HTML string. The atollic Vite plugin wires these registrations up automatically before the first request, so the core stays framework-agnostic. Plain strings are always recognized as a fallback. See [Writing a framework adapter](#writing-a-framework-adapter) and the [`registerHtmlExtractor`](#atollic) API.

### Hono

```ts
import { Hono } from "hono";
import { atollic } from "atollic/hono";
import { html } from "atollic";

const app = new Hono();
app.use(atollic());

app.get("/", () => html(<h1>Hello</h1>));

export default app.fetch;
```

The Hono adapter is middleware that processes `text/html` responses. Use the `html()` helper to wrap JSX into a proper `Response`.

## Islands

Any `.tsx` or `.jsx` file with `"use client"` at the top becomes an island:

```tsx
/** @jsxImportSource solid-js */
"use client";

// This component SSRs on the server and hydrates on the client
```

### How islands work

1. **Discovery** — The Vite plugin scans for files with `"use client"` and identifies PascalCase component exports
2. **SSR stub** — During SSR, island files are replaced with stubs that render the component to HTML inside a `<div data-island="Name">` wrapper with serialized props
3. **Client entry** — A virtual module registers all discovered islands with lazy imports
4. **Hydration** — The client runtime finds `[data-island]` elements and:
   - If SSR content exists: hydrates with matching `renderId` (reuses existing DOM)
   - If empty (dynamically added): falls back to full client-side render

### Framework directive

When using multiple UI frameworks, specify which one:

```tsx
"use client:solid"   // Solid.js
"use client:preact"  // Preact (when adapter exists)
```

Plain `"use client"` uses the first registered framework.

### Named exports

A single file can export multiple island components. Each PascalCase export becomes its own island boundary:

```tsx
"use client";

export function SearchBar(props: { placeholder: string }) { /* ... */ }
export function TagCloud(props: { tags: string[] }) { /* ... */ }
```

Both are independently hydratable islands.

### Client scripts

Non-JSX files (`.ts`, `.js`) with `"use client"` are bundled as client-side scripts — no framework, just plain JS:

```ts
"use client";

document.addEventListener("click", (e) => {
  // Runs only in the browser
});
```

Import the script from your server entry — it's skipped during SSR and loaded in the browser.

### Cross-island state

Islands are independent roots, but you can share reactive state between them using module-level signals:

```ts
// shared.ts
import { createSignal } from "solid-js";
export const [count, setCount] = createSignal(0);
```

```tsx
// Increment.tsx
"use client";
import { setCount } from "./shared";
export default () => <button onClick={() => setCount((c) => c + 1)}>+</button>;
```

```tsx
// Display.tsx
"use client";
import { count } from "./shared";
export default () => <p>Count: {count()}</p>;
```

Both islands share the same signal — no context provider needed.

## JSX runtime

Atollic includes a server-side JSX runtime (`atollic/jsx-runtime`) that compiles JSX to HTML strings:

- All standard HTML elements and attributes
- Async components (`Promise<string>` return values)
- Boolean attributes (`disabled`, `checked`, etc.)
- Automatic XSS escaping
- Void elements (`<br />`, `<img />`, etc.)

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "atollic"
  }
}
```

## `<Head />`

Place `<Head />` in your document `<head>` to mark where atollic injects CSS and script tags:

```tsx
import { Head } from "atollic/head";

<head>
  <meta charset="UTF-8" />
  <Head />
</head>
```

In dev, atollic injects the hydration bootstrap, collected CSS, and the client entry. In production, it injects the built asset tags. If `<Head />` is omitted, assets are injected before `</head>` as a fallback.

## HMR

Dual HMR strategy for instant feedback:

- **Server file changes** — atollic sends a custom `atollic:reload` event. The client refetches the page and uses [idiomorph](https://github.com/bigskysoftware/idiomorph) to morph the DOM, preserving mounted island state.
- **Island file changes** — handled by the framework's own HMR (e.g., `solid-refresh`).

### Events

Listen to lifecycle events on `document`:

| Event | Detail | Description |
|---|---|---|
| `atollic:ready` | — | All initial islands mounted |
| `atollic:before-morph` | `{ newDoc, mountedIslands }` | Cancelable, before HMR page morph |
| `atollic:after-morph` | `{ defaultSwap }` | After HMR page morph |

## htmx, Alpine, and other DOM-mutating libraries

Islands added to the DOM after the initial mount — by htmx swaps, Alpine templates, or any other source — are picked up automatically. The client runtime installs a `MutationObserver` on `document.body` and mounts any newly inserted `[data-island]` element. No library-specific event listener is required.

## CSS handling

CSS files imported in your server entry (or its transitive imports) are automatically discovered:

- **Dev**: collected from Vite's module graph and injected as `<link>` tags via `<Head />`
- **Prod**: included in the client build, hashed, and referenced in the build manifest

```tsx
import "./styles.css"; // discovered automatically
```

## Production build

```bash
bunx --bun vite build
```

Produces:

```
dist/
  client/          # Static assets (JS, CSS) with content-hashed filenames
    assets/
  server/
    app.js         # Self-contained server entry
```

The generated server entry calls `setProductionAssets()` with the built CSS/JS tags, imports your app, and starts `Bun.serve()` with static file serving from `dist/client/`.

```bash
PORT=3000 bun dist/server/app.js
```

## Writing a framework adapter

Implement `FrameworkAdapter` to add support for any UI framework:

```ts
import type { FrameworkAdapter } from "atollic/adapter";

export function myFramework(): FrameworkAdapter {
  return {
    name: "my-framework",

    // Vite plugins for JSX transform
    plugins: () => [myFrameworkVitePlugin()],

    // Generate SSR stub for "use client" components
    ssrStub(rawImportPath, fileExports) {
      return `/* SSR stub that renders to HTML string */`;
    },

    // Client-side hydrate/render functions
    clientRuntime: `
      export function hydrateIsland(el, Component, props, id) {
        // Hydrate existing SSR content — return dispose function
      }
      export function renderIsland(el, Component, props) {
        // Render into empty container — return dispose function
      }
    `,

    // Optional: script tag for hydration bootstrap (e.g., Solid's _$HY)
    hydrationScript: `<script>/* bootstrap */</script>`,

    // Optional: source code for an extractor function `(value) => string | null`.
    // Atollic includes this in the server boot module so the runtime knows
    // how to convert this framework's SSR output (e.g. Solid's `{ t: "..." }`
    // shape) into a plain HTML string. Frameworks whose SSR output is already
    // a string can omit this — plain strings are always recognized.
    extractHtml: `(value) => {
      if (value && typeof value === "object" && "t" in value) return value.t;
      return null;
    }`,
  };
}
```

The `extractHtml` strings from every registered adapter are emitted into a generated server-boot module that runs once before the first request. Each one calls `registerHtmlExtractor()` on the atollic core, which `extractHtml` (used internally by the Elysia and Hono adapters) iterates in order. This is how the core stays decoupled from any specific UI framework's SSR output shape.

## API reference

### `atollic/vite`

```ts
atollic(options: AtollicOptions): Plugin[]
```

| Option | Type | Description |
|---|---|---|
| `entry` | `string` | Path to server entry that default-exports a fetch function |
| `frameworks` | `FrameworkAdapter[]` | UI framework adapters (e.g., `[solid()]`) |

### `atollic`

```ts
// Wrap an HTML string (or async JSX) in a Response with DOCTYPE.
// Returns a Promise<Response> when given a Promise<string>.
html(input: string | Promise<string>): Response | Promise<Response>

setProductionAssets(assets: string): void   // Set production asset tags
getProductionAssets(): string | undefined   // Get production asset tags

// Register a function that converts a framework-specific SSR output value
// into an HTML string (or returns null if it doesn't recognize the shape).
// Normally wired up automatically by the Vite plugin from each adapter's
// `extractHtml` field — call this directly only if you need a custom one.
// Returns a dispose function.
type HtmlExtractor = (value: unknown) => string | null
registerHtmlExtractor(fn: HtmlExtractor): () => void
```

### `atollic/elysia`

```ts
atollic(): Elysia  // Elysia plugin — intercepts HTML responses, injects assets
```

### `atollic/hono`

```ts
atollic(): MiddlewareHandler  // Hono middleware — processes HTML responses, injects assets
```

### `atollic/head`

```ts
Head(): string  // Returns marker for asset injection
```

### `atollic/solid`

```ts
solid(): FrameworkAdapter  // Solid.js framework adapter
```

### `atollic/html`

Types for server-side JSX:

```ts
type Children =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | Promise<Children>
  | Children[]

type Component<T = {}> = (
  props: T & { children?: Children },
) => string | Promise<string>
```

## Exports

| Export | Description |
|---|---|
| `atollic` | Core — `html()`, `setProductionAssets()`, `getProductionAssets()`, `registerHtmlExtractor()` |
| `atollic/vite` | Vite plugin |
| `atollic/client` | Client runtime (auto-imported) |
| `atollic/adapter` | `FrameworkAdapter` type |
| `atollic/head` | `<Head />` component |
| `atollic/solid` | Solid.js adapter |
| `atollic/elysia` | Elysia server adapter |
| `atollic/hono` | Hono server adapter |
| `atollic/jsx-runtime` | Server JSX runtime |
| `atollic/html` | HTML types (`Component`, `Children`, JSX namespace) |

## Requirements

- A WinterCG-compatible runtime — [Bun](https://bun.sh), [Node](https://nodejs.org) (via fetch adapter), [Deno](https://deno.com), or Cloudflare Workers
- [Vite](https://vite.dev) ^8.0.0
- Examples and the bundled production server template currently target Bun; other runtimes work but require providing your own server entry

## License

MIT
