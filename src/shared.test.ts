import { afterEach, describe, expect, test } from "bun:test";
import {
	ensureDoctype,
	extractHtml,
	type HtmlExtractor,
	injectHead,
	isHtmlDocument,
	processHtml,
	registerHtmlExtractor,
} from "./shared.js";

// The extractor registry lives on globalThis — reset between tests so one
// test's registrations don't leak into the next.
function clearExtractors(): void {
	(globalThis as Record<string, unknown>).__atollicHtmlExtractors = [];
}

describe("ensureDoctype", () => {
	test("prepends DOCTYPE when missing", () => {
		expect(ensureDoctype("<html><body></body></html>")).toBe(
			"<!DOCTYPE html>\n<html><body></body></html>",
		);
	});

	test("no-op when DOCTYPE already present", () => {
		const input = "<!DOCTYPE html>\n<html></html>";
		expect(ensureDoctype(input)).toBe(input);
	});

	test("no-op for partial HTML fragments", () => {
		expect(ensureDoctype("<div>hi</div>")).toBe("<div>hi</div>");
	});

	test("handles leading whitespace before <html>", () => {
		expect(ensureDoctype("  \n<html></html>")).toBe(
			"<!DOCTYPE html>\n  \n<html></html>",
		);
	});
});

describe("isHtmlDocument", () => {
	test("true for DOCTYPE", () => {
		expect(isHtmlDocument("<!DOCTYPE html><html></html>")).toBe(true);
	});

	test("true for <html> root", () => {
		expect(isHtmlDocument("<html lang='en'></html>")).toBe(true);
	});

	test("false for fragments", () => {
		expect(isHtmlDocument("<div>partial</div>")).toBe(false);
		expect(isHtmlDocument("plain text")).toBe(false);
	});
});

describe("injectHead", () => {
	test("replaces <Head /> marker with tags", () => {
		const html = '<html><head><meta name="atollic-head"/></head></html>';
		const result = injectHead(html, "<link rel='stylesheet' href='x.css'>");
		expect(result).toContain("<link rel='stylesheet' href='x.css'>");
		expect(result).not.toContain("atollic-head");
	});

	test("falls back to </head> injection when marker is absent", () => {
		const html = "<html><head><title>t</title></head></html>";
		const result = injectHead(html, "<script src='x.js'></script>");
		expect(result).toContain("<script src='x.js'></script>");
		expect(result.indexOf("<script")).toBeLessThan(result.indexOf("</head>"));
	});

	test("no-op when neither marker nor </head> present", () => {
		const html = "<div>hi</div>";
		expect(injectHead(html, "<x>")).toBe(html);
	});
});

describe("HTML extractor registry", () => {
	afterEach(() => {
		clearExtractors();
	});

	test("falls back to plain strings with no extractors registered", () => {
		expect(extractHtml("<p>hi</p>")).toBe("<p>hi</p>");
	});

	test("returns null for unknown shapes with no extractors", () => {
		expect(extractHtml({ foo: 1 })).toBeNull();
		expect(extractHtml(42)).toBeNull();
	});

	test("registered extractor handles its own shape", () => {
		const solidLike: HtmlExtractor = (value) => {
			if (value && typeof value === "object" && "t" in value) {
				return (value as { t: string }).t;
			}
			return null;
		};
		registerHtmlExtractor(solidLike);

		expect(extractHtml({ t: "<h1>hello</h1>" })).toBe("<h1>hello</h1>");
		expect(extractHtml("plain")).toBe("plain"); // still falls back
		expect(extractHtml({ other: 1 })).toBeNull();
	});

	test("dispose function removes the extractor", () => {
		const ext: HtmlExtractor = (v) =>
			typeof v === "number" ? `<n>${v}</n>` : null;
		const dispose = registerHtmlExtractor(ext);

		expect(extractHtml(7)).toBe("<n>7</n>");
		dispose();
		expect(extractHtml(7)).toBeNull();
	});

	test("extractors are tried in registration order, first non-null wins", () => {
		const a: HtmlExtractor = (v) => (v === "a" ? "A" : null);
		const b: HtmlExtractor = (v) => (v === "a" ? "B" : null);
		registerHtmlExtractor(a);
		registerHtmlExtractor(b);

		expect(extractHtml("a")).toBe("A");
	});
});

describe("processHtml", () => {
	afterEach(() => {
		clearExtractors();
	});

	test("ensures DOCTYPE when assets are undefined", () => {
		expect(processHtml("<html></html>", undefined)).toBe(
			"<!DOCTYPE html>\n<html></html>",
		);
	});

	test("injects assets at the <Head /> marker", () => {
		const body = '<html><head><meta name="atollic-head"/></head></html>';
		const result = processHtml(body, "<link rel='stylesheet' href='a.css'>");
		expect(result.startsWith("<!DOCTYPE html>")).toBe(true);
		expect(result).toContain("<link rel='stylesheet' href='a.css'>");
		expect(result).not.toContain("atollic-head");
	});
});
