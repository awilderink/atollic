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
}
