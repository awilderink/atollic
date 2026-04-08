import { createRequire } from "node:module";
import {
	ATOLLIC_CHILDREN_KEY,
	buildSsrStub,
	type FrameworkAdapter,
} from "../adapter.js";

const require = createRequire(import.meta.url);

/** Solid.js framework adapter. Requires `solid-js` and `vite-plugin-solid`. */
export function solid(): FrameworkAdapter {
	return {
		name: "solid",
		jsxImportSources: ["solid-js"],

		plugins() {
			const mod = require("vite-plugin-solid");
			const factory = typeof mod === "function" ? mod : mod.default;
			return [factory({ ssr: true })];
		},

		ssrStub(rawImportPath, fileExports) {
			return buildSsrStub(rawImportPath, fileExports, {
				framework: "solid",
				// Solid's renderToString with renderId returns `{ t: string }`;
				// without renderId it returns a plain string. Handle both.
				imports: `import { renderToString } from "solid-js/web";
function __ix_solidHtml(v) {
  return typeof v === "string" ? v : v && typeof v.t === "string" ? v.t : "";
}`,
				renderExpr: (rawName, id, propsVar) =>
					`__ix_solidHtml(renderToString(() => ${rawName}(${propsVar}), { renderId: ${id} }))`,
				serializeChildren: true,
			});
		},

		clientRuntime: `
import { hydrate as _hydrate, render as _render } from "solid-js/web";
import { $DEVCOMP } from "solid-js";

const CHILDREN_KEY = ${JSON.stringify(ATOLLIC_CHILDREN_KEY)};

// Getter rebuilds the children fragment on each access so conditional
// re-renders (e.g. {visible() && <div>{children}</div>}) get fresh DOM
// + fresh nested islands after toggle.
function resolveProps(props) {
  const { [CHILDREN_KEY]: rawHtml, ...rest } = props;
  if (rawHtml == null) return rest;
  const resolved = { ...rest };
  Object.defineProperty(resolved, 'children', {
    enumerable: true,
    get() {
      const c = document.createElement('div');
      c.style.cssText = 'display:contents';
      c.innerHTML = rawHtml;
      return c;
    },
  });
  return resolved;
}

export function hydrateIsland(el, Component, props, id) {
  if ($DEVCOMP && !($DEVCOMP in Component)) {
    Component[$DEVCOMP] = true;
  }
  // Skip hydration when children are spliced — sentinel substitution breaks Solid's keys.
  if (CHILDREN_KEY in props) {
    el.textContent = "";
    return _render(() => Component(resolveProps(props)), el);
  }
  return _hydrate(() => Component(props), el, { renderId: id });
}

export function renderIsland(el, Component, props) {
  if ($DEVCOMP && !($DEVCOMP in Component)) {
    Component[$DEVCOMP] = true;
  }
  el.textContent = "";
  return _render(() => Component(resolveProps(props)), el);
}
`,

		hydrationScript:
			"<script>(self._$HY||(self._$HY={events:[],completed:new WeakSet,r:{}}))</script>",

		extractHtml: `(value) => {
  const unwrap = (v) =>
    typeof v === "string" ? v
    : Array.isArray(v) ? v.flat(Infinity).map(unwrap).join("")
    : v && typeof v === "object" && typeof v.t === "string" ? v.t
    : "";
  return unwrap(value) || null;
}`,
	};
}
