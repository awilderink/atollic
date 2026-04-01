const VOID_ELEMENTS = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
]);

function escapeAttr(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

function renderAttrs(props: Record<string, unknown>): string {
	let result = "";
	for (const key in props) {
		if (
			key === "children" ||
			key === "innerHTML" ||
			key === "dangerouslySetInnerHTML"
		)
			continue;
		const value = props[key];
		if (value === true) {
			result += ` ${key}`;
			continue;
		}
		if (value === false || value == null) continue;
		result += ` ${key}="${escapeAttr(String(value))}"`;
	}
	return result;
}

function unwrap(value: unknown): string | Promise<string> {
	if (value == null || value === false || value === true) return "";
	if (typeof value === "string") return value;
	if (typeof value === "number") return String(value);
	if (value instanceof Promise) {
		return value.then(unwrap);
	}
	if (Array.isArray(value)) {
		let hasPromise = false;
		const mapped = value.map((v) => {
			const r = unwrap(v);
			if (r instanceof Promise) hasPromise = true;
			return r;
		});
		if (hasPromise) return Promise.all(mapped).then((parts) => parts.join(""));
		return (mapped as string[]).join("");
	}
	// Handle Solid SSR format: { t: "<html>..." }
	if (typeof value === "object" && "t" in (value as object)) {
		return (value as { t: string }).t;
	}
	return String(value);
}

const renderChildren = unwrap;

export function jsx(
	tag: string | ((props: Record<string, unknown>) => unknown),
	props: Record<string, unknown>,
): string | Promise<string> {
	if (typeof tag === "function") {
		const result = tag(props);
		return unwrap(result);
	}

	const attrs = renderAttrs(props);

	if (VOID_ELEMENTS.has(tag)) {
		return `<${tag}${attrs} />`;
	}

	let content: string | Promise<string> = "";
	if (props.innerHTML != null) {
		content = String(props.innerHTML);
	} else if (
		props.dangerouslySetInnerHTML &&
		typeof props.dangerouslySetInnerHTML === "object" &&
		"__html" in props.dangerouslySetInnerHTML
	) {
		content = String(
			(props.dangerouslySetInnerHTML as { __html: unknown }).__html,
		);
	} else if (props.children != null) {
		content = renderChildren(props.children);
	}

	if (content instanceof Promise) {
		return content.then((c) => `<${tag}${attrs}>${c}</${tag}>`);
	}

	return `<${tag}${attrs}>${content}</${tag}>`;
}

export const jsxs = jsx;

export function Fragment(props: {
	children?: unknown;
}): string | Promise<string> {
	return renderChildren(props.children);
}

// Ensure global JSX declarations from types.ts are loaded
import type {} from "./types.js";
