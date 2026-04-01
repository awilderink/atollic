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

/**
 * Extract HTML from Solid's SSR output format.
 * Handles `{t: "<html>"}` objects and arrays of fragments.
 */
export function extractHtml(value: unknown): string | null {
	if (
		value &&
		typeof value === "object" &&
		"t" in value &&
		typeof (value as { t: unknown }).t === "string"
	) {
		return (value as { t: string }).t;
	}
	if (Array.isArray(value)) {
		const html = value
			.flat(Infinity)
			.map((item: unknown) => {
				if (typeof item === "string") return item;
				if (item && typeof item === "object" && "t" in item) {
					return (item as { t: string }).t;
				}
				return "";
			})
			.join("");
		return html || null;
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
