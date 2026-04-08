import { createRequire } from "node:module";
import {
	buildSsrStub,
	type FrameworkAdapter,
	loadVitePluginFactory,
} from "../adapter.js";

const require = createRequire(import.meta.url);

/** React framework adapter. Requires `react`, `react-dom`, `@vitejs/plugin-react`. */
export function react(): FrameworkAdapter {
	return {
		name: "react",
		jsxImportSources: ["react"],

		plugins() {
			return loadVitePluginFactory(require, "@vitejs/plugin-react");
		},

		ssrStub(rawImportPath, fileExports) {
			return buildSsrStub(rawImportPath, fileExports, {
				framework: "react",
				imports: `import { renderToString } from "react-dom/server";
import { createElement } from "react";`,
				renderExpr: (rawName) =>
					`renderToString(createElement(${rawName}, props))`,
			});
		},

		clientRuntime: `
import { hydrateRoot, createRoot } from "react-dom/client";
import { createElement } from "react";

export function hydrateIsland(el, Component, props) {
  const root = hydrateRoot(el, createElement(Component, props));
  return () => root.unmount();
}

export function renderIsland(el, Component, props) {
  el.textContent = "";
  const root = createRoot(el);
  root.render(createElement(Component, props));
  return () => root.unmount();
}
`,
	};
}
