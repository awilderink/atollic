import { createRequire } from "node:module";
import {
	buildSsrStub,
	type FrameworkAdapter,
	loadVitePluginFactory,
} from "../adapter.js";

const require = createRequire(import.meta.url);

/** Solid.js framework adapter. Requires `solid-js` and `vite-plugin-solid`. */
export function solid(): FrameworkAdapter {
	return {
		name: "solid",
		jsxImportSources: ["solid-js"],

		plugins() {
			return loadVitePluginFactory(require, "vite-plugin-solid", { ssr: true });
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
			});
		},

		clientRuntime: `
import { hydrate as _hydrate, render as _render } from "solid-js/web";
import { $DEVCOMP } from "solid-js";

export function hydrateIsland(el, Component, props, id) {
  if ($DEVCOMP && !($DEVCOMP in Component)) {
    Component[$DEVCOMP] = true;
  }
  return _hydrate(() => Component(props), el, { renderId: id });
}

export function renderIsland(el, Component, props) {
  if ($DEVCOMP && !($DEVCOMP in Component)) {
    Component[$DEVCOMP] = true;
  }
  el.textContent = "";
  return _render(() => Component(props), el);
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
