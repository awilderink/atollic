import type { Plugin } from "vite";

// ---------------------------------------------------------------------------
// Types shared between the core plugin and framework adapters
// ---------------------------------------------------------------------------

export interface IslandExport {
	/** "default" for default exports, or the named export identifier */
	exportName: string;
	/** PascalCase name used in the `data-island` attribute */
	islandName: string;
}

export interface FrameworkAdapter {
	/** Identifier matching the directive suffix, e.g. `"solid"` for `"use client:solid"` */
	name: string;

	/**
	 * `@jsxImportSource` values that route a file to this adapter. Used to
	 * auto-detect the framework from a plain `"use client"` directive.
	 * Defaults to `[name]` when omitted; declare explicitly when the package
	 * name differs from the adapter name (e.g. `["solid-js"]`).
	 */
	jsxImportSources?: string[];

	/** Vite plugins needed for this framework's JSX/TSX transform */
	plugins?: () => Plugin[];

	/**
	 * Generate SSR stub code for a `"use client"` component file.
	 *
	 * The returned source must:
	 * - Import the real component from `rawImportPath` (the `?raw-island` version)
	 * - For each export in `fileExports`, produce a wrapper that renders the
	 *   component to an HTML string inside a `<div data-island>` wrapper with
	 *   serialized props
	 * - The stub may use framework-specific JSX if the adapter provides Vite
	 *   plugins that transform it (e.g. Solid's SSR stub uses Solid JSX)
	 */
	ssrStub(rawImportPath: string, fileExports: IslandExport[]): string;

	/**
	 * Source code string for the client-side hydrate/render functions.
	 *
	 * Must export:
	 * - `hydrateIsland(el, Component, props, id)` → returns dispose function
	 * - `renderIsland(el, Component, props)` → returns dispose function
	 */
	clientRuntime: string;

	/**
	 * HTML script tag to inject in `<head>` for hydration bootstrap.
	 * For example, Solid needs `_$HY`. Frameworks without a bootstrap script
	 * can omit this.
	 */
	hydrationScript?: string;

	/**
	 * Source code for an extractor function with the signature
	 * `(value: unknown) => string | null`.
	 *
	 * The atollic Vite plugin includes this in the server boot module so the
	 * runtime knows how to convert this framework's SSR output (e.g. Solid's
	 * `{ t: "..." }` shape) into a plain HTML string. Frameworks whose SSR
	 * output is already a string can omit this — the core falls back to
	 * recognizing plain strings on its own.
	 *
	 * @example
	 *   extractHtml: `(value) => value && typeof value === "object" && "t" in value
	 *     ? value.t
	 *     : null`
	 */
	extractHtml?: string;
}

// ---------------------------------------------------------------------------
// Shared helpers for adapter implementations
// ---------------------------------------------------------------------------

/**
 * Resolve a Vite plugin factory from a CJS or ESM package via `createRequire`.
 * Handles the `module.exports = factory` vs `module.exports.default = factory`
 * dual-export pattern that most Vite plugins ship with.
 */
export function loadVitePluginFactory<T = unknown>(
	require: NodeRequire,
	pkg: string,
	options?: T,
): Plugin[] {
	const mod = require(pkg);
	const factory = typeof mod === "function" ? mod : mod.default;
	const result = factory(options);
	return Array.isArray(result) ? result : [result];
}

export interface SsrStubOptions {
	/** Adapter name, used for the `data-framework` attribute. */
	framework: string;
	/** Code prepended before wrapper functions, e.g. import statements. */
	imports: string;
	/**
	 * Returns the JS expression that produces the rendered HTML string for
	 * one island. Receives the local name of the imported component and the
	 * JS variable holding the per-instance render id.
	 */
	renderExpr(rawName: string, idVar: string): string;
}

/**
 * Build the SSR stub source for a `"use client"` component file. Centralizes
 * the import grouping, per-instance id generation, and `<div data-island>`
 * wrapper that's identical across adapters; each framework only supplies its
 * own imports and `renderToString`-equivalent expression.
 */
export function buildSsrStub(
	rawImportPath: string,
	fileExports: IslandExport[],
	{ framework, imports, renderExpr }: SsrStubOptions,
): string {
	const defaultExport = fileExports.find((e) => e.exportName === "default");
	const namedExports = fileExports.filter((e) => e.exportName !== "default");

	const importParts: string[] = [];
	if (defaultExport) importParts.push("__raw_default");
	if (namedExports.length) {
		const named = namedExports
			.map((e) => `${e.exportName} as __raw_${e.exportName}`)
			.join(", ");
		importParts.push(`{ ${named} }`);
	}

	let code = `${imports}\n`;
	code += `import ${importParts.join(", ")} from "${rawImportPath}";\n`;
	code += `let __ix_idx = 0;\n`;

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
  const html = ${renderExpr(rawName, "id")};
  return '<div data-island="${exp.islandName}" data-framework="${framework}" id="' + id + '">'
    + html + '<script type="application/json">' + propsJson + '</script></div>';
}\n`;
	}

	return code;
}
