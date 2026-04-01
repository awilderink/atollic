/**
 * Server-side helpers for atollic.
 */

import { ensureDoctype } from "./shared.js";

// ---------------------------------------------------------------------------
// Production asset injection
// ---------------------------------------------------------------------------

const PROD_ASSETS_KEY = "__atollicProdAssets";

/**
 * Set the production asset tags (scripts + CSS) to inject into HTML responses.
 * Called by the generated production entry before the server starts.
 */
export function setProductionAssets(assets: string): void {
	(globalThis as Record<string, unknown>)[PROD_ASSETS_KEY] = assets;
}

export function getProductionAssets(): string | undefined {
	return (globalThis as Record<string, unknown>)[PROD_ASSETS_KEY] as
		| string
		| undefined;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Wrap a pre-rendered HTML string in a Response with proper DOCTYPE and headers.
 */
export function html(input: string): Response {
	return new Response(ensureDoctype(input), {
		headers: { "content-type": "text/html; charset=utf-8" },
	});
}
