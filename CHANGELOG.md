# atollic

## 0.1.0

### Minor Changes

- [#13](https://github.com/awilderink/atollic/pull/13) [`a7e43fe`](https://github.com/awilderink/atollic/commit/a7e43fef7bca0d64db756e1ca07257a00f3f3e78) Thanks [@awilderink](https://github.com/awilderink)! - ## Universal components

  Plain `.tsx` files without a `"use client"` directive or `@jsxImportSource` pragma are now **universal components**. They automatically compile to the correct JSX runtime based on who imports them:

  - Imported from a server route: compiles with Atollic HTML JSX (string output)
  - Imported from a React island: compiles with React JSX (`className`, style objects)
  - Imported from a Solid island: compiles with Solid JSX (no transform needed)

  Write `class`, `onClick`, and string `style` once. It works everywhere.

  ### New exports

  - `UniversalFC<P>` - typed function component signature for universal components
  - `UniversalChildren` - opaque children type alias

  ```tsx
  import type { UniversalFC } from "atollic";

  const Button: UniversalFC<{ variant?: "primary" | "ghost" }> = (props) => (
    <button class={props.variant}>{props.children}</button>
  );
  export default Button;
  ```

  ### How it works

  The Vite plugin detects when a universal component is imported from a `"use client"` island and resolves it with a `?framework=X` query. The `load` hook injects the correct `@jsxImportSource` pragma and applies attribute mapping (e.g. `class` to `className` for React, `style` strings to style objects). Function-valued props like `onClick` are silently dropped when rendering as server HTML.

  ### Other changes

  - `FrameworkAdapter` interface gains an optional `transformUniversal(code)` method for framework-specific attribute mapping
  - Server HTML JSX runtime now skips function-valued props instead of rendering them as strings
  - Event handler types (`on*`) in Atollic's JSX namespace accept functions alongside strings

## 0.0.6

### Patch Changes

- [#11](https://github.com/awilderink/atollic/pull/11) [`e49d311`](https://github.com/awilderink/atollic/commit/e49d3119a2d2c213e9822c60b1fda74fbf847b88) Thanks [@awilderink](https://github.com/awilderink)! - Fix async children and React children hydration inside islands. Server-rendered children passed into an island now resolve correctly when they are async (promises/JSX returning a promise) and survive hydration on React islands without being reconciled away.

- [#11](https://github.com/awilderink/atollic/pull/11) [`e49d311`](https://github.com/awilderink/atollic/commit/e49d3119a2d2c213e9822c60b1fda74fbf847b88) Thanks [@awilderink](https://github.com/awilderink)! - Preserve hydrated island state across server HMR. Editing a server file no longer resets the state of mounted islands: the morph now skips island subtrees (via `beforeNodeMorphed`) and island ids stay stable across the HMR refetch thanks to a per-request id counter backed by `AsyncLocalStorage`.

## 0.0.5

### Patch Changes

- [`97cd69a`](https://github.com/awilderink/atollic/commit/97cd69a47ca1a7254ba1facc28bc64e05be29f5d) Thanks [@awilderink](https://github.com/awilderink)! - Add Atollic logo and capitalize brand name in README. Logo is now displayed at the top of the README and on the npm package page via an absolute raw.githubusercontent URL.

## 0.0.4

### Patch Changes

- [#4](https://github.com/awilderink/atollic/pull/4) [`784f12a`](https://github.com/awilderink/atollic/commit/784f12aea37d6b1f69d544493307642a8568c505) Thanks [@awilderink](https://github.com/awilderink)! - Fix `dev:elysia` and `dev:hono` scripts to run from inside the example
  directory. Vite's `--config` flag defaults `root` to the current working
  directory, which broke entry resolution when running from the repo root.
