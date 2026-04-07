import { createRequire } from "node:module";
import type { FrameworkAdapter, IslandExport } from "../adapter.js";

const require = createRequire(import.meta.url);

/**
 * Solid.js framework adapter for atollic.
 *
 * Requires peer dependencies: `solid-js`, `vite-plugin-solid`
 *
 * Files are automatically detected via the `@jsxImportSource solid-js`
 * pragma — no include/exclude patterns needed.
 */
export function solid(): FrameworkAdapter {
	return {
		name: "solid",

		plugins() {
			const mod = require("vite-plugin-solid");
			const factory = typeof mod === "function" ? mod : mod.default;
			const solidPlugin = factory({ ssr: true });
			return Array.isArray(solidPlugin) ? solidPlugin : [solidPlugin];
		},

		ssrStub(rawImportPath: string, fileExports: IslandExport[]): string {
			const defaultExport = fileExports.find((e) => e.exportName === "default");
			const namedExports = fileExports.filter(
				(e) => e.exportName !== "default",
			);

			const importParts: string[] = [];
			if (defaultExport) importParts.push("__raw_default");
			if (namedExports.length) {
				const named = namedExports
					.map((e) => `${e.exportName} as __raw_${e.exportName}`)
					.join(", ");
				importParts.push(`{ ${named} }`);
			}

			let code = `import { renderToString } from "solid-js/web";\n`;
			code += `import ${importParts.join(", ")} from "${rawImportPath}";\n`;
			code += `let __ix_idx = 0;\n`;
			code += `function __unwrap(v) { return v && typeof v === "object" && "t" in v ? v.t : String(v); }\n`;

			for (const exp of fileExports) {
				const isDefault = exp.exportName === "default";
				const rawName = isDefault ? "__raw_default" : `__raw_${exp.exportName}`;
				const decl = isDefault
					? "export default function"
					: `export function ${exp.exportName}`;

				code += `${decl}(props) {
  const id = "ix-${exp.islandName}-" + __ix_idx++;
  const { children: __children, ...jsonProps } = props;
  const propsJson = JSON.stringify(jsonProps);
  const html = __unwrap(renderToString(() => ${rawName}(props), { renderId: id }));
  return '<div data-island="${exp.islandName}" data-framework="solid" id="' + id + '">'
    + html + '<script type="application/json">' + propsJson + '</script></div>';
}\n`;
			}

			return code;
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
  if (value && typeof value === "object" && "t" in value && typeof value.t === "string") {
    return value.t;
  }
  if (Array.isArray(value)) {
    const html = value.flat(Infinity).map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "t" in item) return item.t;
      return "";
    }).join("");
    return html || null;
  }
  return null;
}`,
	};
}
