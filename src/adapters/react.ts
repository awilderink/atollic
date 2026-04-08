import { createRequire } from "node:module";
import {
	ATOLLIC_CHILDREN_KEY,
	buildSsrStub,
	type FrameworkAdapter,
} from "../adapter.js";

const require = createRequire(import.meta.url);

/** React framework adapter. Requires `react`, `react-dom`, `@vitejs/plugin-react`. */
export function react(): FrameworkAdapter {
	return {
		name: "react",
		jsxImportSources: ["react"],

		plugins() {
			const mod = require("@vitejs/plugin-react");
			const factory = typeof mod === "function" ? mod : mod.default;
			return [factory()];
		},

		ssrStub(rawImportPath, fileExports) {
			return buildSsrStub(rawImportPath, fileExports, {
				framework: "react",
				imports: `import { renderToString } from "react-dom/server";
import { createElement } from "react";`,
				renderExpr: (rawName, _id, propsVar) =>
					`renderToString(createElement(${rawName}, ${propsVar}))`,
				serializeChildren: true,
			});
		},

		clientRuntime: `
import { hydrateRoot, createRoot } from "react-dom/client";
import { createElement } from "react";

const CHILDREN_KEY = ${JSON.stringify(ATOLLIC_CHILDREN_KEY)};

function resolveProps(props) {
  const { [CHILDREN_KEY]: rawHtml, ...rest } = props;
  if (rawHtml == null) return rest;
  return { ...rest, children: createElement("div", {
    dangerouslySetInnerHTML: { __html: rawHtml },
    style: { display: "contents" },
  }) };
}

export function hydrateIsland(el, Component, props) {
  // Skip hydration when children are spliced via sentinel — DOM shapes don't match.
  if (CHILDREN_KEY in props) {
    el.textContent = "";
    const root = createRoot(el);
    root.render(createElement(Component, resolveProps(props)));
    return () => root.unmount();
  }
  const root = hydrateRoot(el, createElement(Component, resolveProps(props)));
  return () => root.unmount();
}

export function renderIsland(el, Component, props) {
  el.textContent = "";
  const root = createRoot(el);
  root.render(createElement(Component, resolveProps(props)));
  return () => root.unmount();
}
`,
	};
}
