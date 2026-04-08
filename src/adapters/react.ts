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
				renderExpr: (rawName, _id, propsVar) =>
					`renderToString(createElement(${rawName}, ${propsVar}))`,
				serializeChildren: true,
			});
		},

		clientRuntime: `
import { hydrateRoot, createRoot } from "react-dom/client";
import { createElement } from "react";

function resolveProps(props) {
  const { __atollic_children__: rawHtml, ...rest } = props;
  if (!rawHtml) return rest;
  return { ...rest, children: createElement("div", {
    dangerouslySetInnerHTML: { __html: rawHtml },
    style: { display: "contents" },
  }) };
}

export function hydrateIsland(el, Component, props) {
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
