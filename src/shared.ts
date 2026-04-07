/** Matches the <Head /> marker rendered by atollic/head */
const HEAD_MARKER_RE = /<meta\s+name="atollic-head"\s*\/?>/;

/** Replace <Head /> marker with tags, or fall back to </head> injection. */
export function injectHead(html: string, tags: string): string {
	const replaced = html.replace(HEAD_MARKER_RE, tags);
	if (replaced !== html) return replaced;
	if (html.includes("</head>")) {
		return html.replace("</head>", `  ${tags}\n</head>`);
	}
	return html;
}

// ---------------------------------------------------------------------------
// HTML extractor registry
// ---------------------------------------------------------------------------

/**
 * A function that converts a framework-specific SSR output value into an HTML
 * string, or returns `null` if it doesn't recognize the shape.
 */
export type HtmlExtractor = (value: unknown) => string | null;

/**
 * The registry lives on `globalThis` so a single atollic core, loaded under
 * any module URL, shares the same list of extractors. This mirrors the
 * pattern used by `setProductionAssets`.
 */
const EXTRACTORS_KEY = "__atollicHtmlExtractors";

function getExtractors(): HtmlExtractor[] {
	const g = globalThis as Record<string, unknown>;
	if (!Array.isArray(g[EXTRACTORS_KEY])) g[EXTRACTORS_KEY] = [];
	return g[EXTRACTORS_KEY] as HtmlExtractor[];
}

/**
 * Register a function that extracts an HTML string from a framework-specific
 * SSR output. The atollic Vite plugin wires this up automatically — every
 * `FrameworkAdapter` with an `extractHtml` source string gets registered
 * before the first request is served.
 *
 * @returns A dispose function that removes the extractor.
 */
export function registerHtmlExtractor(fn: HtmlExtractor): () => void {
	const list = getExtractors();
	list.push(fn);
	return () => {
		const i = list.indexOf(fn);
		if (i >= 0) list.splice(i, 1);
	};
}

/**
 * Convert a server response value into an HTML string by trying each
 * registered framework extractor, then falling back to a plain string.
 * Returns `null` when nothing recognizes the shape.
 */
export function extractHtml(value: unknown): string | null {
	for (const fn of getExtractors()) {
		const result = fn(value);
		if (result !== null) return result;
	}
	if (typeof value === "string") return value;
	return null;
}

/** Prepend DOCTYPE if the string looks like HTML but is missing it. */
export function ensureDoctype(html: string): string {
	const trimmed = html.trimStart();
	if (trimmed.startsWith("<html") && !trimmed.startsWith("<!DOCTYPE")) {
		return `<!DOCTYPE html>\n${html}`;
	}
	return html;
}

/** Check if a string looks like a full HTML document. */
export function isHtmlDocument(value: string): boolean {
	const trimmed = value.trimStart();
	return trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html");
}

/** Ensure DOCTYPE and inject production assets if available. */
export function processHtml(body: string, assets: string | undefined): string {
	let html = ensureDoctype(body);
	if (assets) html = injectHead(html, assets);
	return html;
}
