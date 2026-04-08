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
	 * one island. Receives the local name of the imported component, the
	 * JS variable holding the per-instance render id, and the variable name
	 * that holds the (possibly children-substituted) props to pass into the
	 * framework's SSR.
	 */
	renderExpr(rawName: string, idVar: string, propsVar: string): string;
	/**
	 * When true, the serialized children HTML is included in propsJson under
	 * `__atollic_children__` so the client runtime can reconstruct children
	 * after hydration. Required for frameworks (e.g. React) whose hydration
	 * reconciles children away when the prop is absent client-side.
	 */
	serializeChildren?: boolean;
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
	{ framework, imports, renderExpr, serializeChildren }: SsrStubOptions,
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
	// Children arrive as pre-rendered HTML from atollic's JSX runtime:
	// strings, numbers, or (possibly nested) arrays thereof. Flatten into
	// a single HTML string so the sentinel substitution below has something
	// to splice in.
	// async so that Promise children (async server components used as children)
	// are awaited before sentinel substitution rather than stringified as
	// "[object Promise]".
	code += `async function __ix_unwrap(v) {
  if (v instanceof Promise) return __ix_unwrap(await v);
  if (v == null || v === false || v === true) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return (await Promise.all(v.map(__ix_unwrap))).join("");
  return String(v);
}\n`;

	for (const exp of fileExports) {
		const isDefault = exp.exportName === "default";
		const rawName = isDefault ? "__raw_default" : `__raw_${exp.exportName}`;
		const decl = isDefault
			? "export default async function"
			: `export async function ${exp.exportName}`;

		// Children are pre-rendered HTML from atollic's JSX runtime, but Solid
		// and React escape string children on SSR. Swap them for an
		// escape-safe sentinel, render, then splice the real HTML back in.
		// The stub is async so that Promise children (async server components)
		// are awaited before the sentinel substitution.
		code += `${decl}(props) {
  const id = "ix-${exp.islandName}-" + __ix_idx++;
  const { children: __ix_children, ...jsonProps } = props;
  const __ix_rawChildren = await __ix_unwrap(__ix_children);
  const propsJson = JSON.stringify(${serializeChildren ? `__ix_rawChildren ? { ...jsonProps, __atollic_children__: __ix_rawChildren } : jsonProps` : "jsonProps"});
  const __ix_sentinel = __ix_rawChildren ? "__atollic_children_" + id + "__" : null;
  const __ix_props = __ix_sentinel
    ? { ...jsonProps, children: __ix_sentinel }
    : props;
  let __ix_html = ${renderExpr(rawName, "id", "__ix_props")};
  if (__ix_sentinel) {
    __ix_html = __ix_html.split(__ix_sentinel).join(__ix_rawChildren);
  }
  return '<div data-island="${exp.islandName}" data-framework="${framework}" id="' + id + '">'
    + __ix_html + '<script type="application/json">' + propsJson + '</script></div>';
}\n`;
	}

	return code;
}
