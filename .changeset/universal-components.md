---
"atollic": minor
---

## Universal components

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
