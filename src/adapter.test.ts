import { describe, expect, test } from "bun:test";
import { buildSsrStub, type IslandExport } from "./adapter.js";
import { jsx } from "./html/jsx-runtime.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract and eval __ix_unwrap from a generated stub string. */
function extractUnwrap(code: string): (v: unknown) => Promise<string> {
	const start = code.indexOf("async function __ix_unwrap(v)");
	// Slice from function start to just before the first export declaration
	const exportPos = code.indexOf("\nexport ", start);
	const block = code.slice(start, exportPos > -1 ? exportPos : code.length);
	return new Function(`${block}; return __ix_unwrap;`)() as (
		v: unknown,
	) => Promise<string>;
}

const mockExports: IslandExport[] = [
	{ exportName: "default", islandName: "TestIsland" },
];

const namedExports: IslandExport[] = [
	{ exportName: "default", islandName: "IslandA" },
	{ exportName: "IslandB", islandName: "IslandB" },
];

function minimalStub(exports: IslandExport[] = mockExports): string {
	return buildSsrStub("./fake-component.js", exports, {
		framework: "test",
		imports: "",
		renderExpr: (_raw, _id, _props) => '""',
	});
}

// ---------------------------------------------------------------------------
// buildSsrStub — output shape
// ---------------------------------------------------------------------------

describe("buildSsrStub output shape", () => {
	test("contains __ix_idx declaration", () => {
		expect(minimalStub()).toContain("let __ix_idx = 0;");
	});

	test("contains __ix_unwrap function", () => {
		expect(minimalStub()).toContain("function __ix_unwrap(v)");
	});

	test("contains data-island attribute with island name", () => {
		expect(minimalStub()).toContain('data-island="TestIsland"');
	});

	test("contains data-framework attribute with framework name", () => {
		expect(minimalStub()).toContain('data-framework="test"');
	});

	test("contains script type application/json", () => {
		expect(minimalStub()).toContain('<script type="application/json">');
	});

	test("default export uses correct declaration", () => {
		expect(minimalStub()).toContain("export default async function(props)");
	});

	test("named export uses correct declaration", () => {
		const code = minimalStub(namedExports);
		expect(code).toContain("export default async function(props)");
		expect(code).toContain("export async function IslandB(props)");
	});

	test("imports the raw component with the provided path", () => {
		const code = minimalStub();
		expect(code).toContain('"./fake-component.js"');
	});

	test("imports default as __raw_default", () => {
		expect(minimalStub()).toContain("__raw_default");
	});

	test("named export imported with alias", () => {
		const code = minimalStub(namedExports);
		expect(code).toContain("IslandB as __raw_IslandB");
	});
});

// ---------------------------------------------------------------------------
// __ix_unwrap — behavior
// ---------------------------------------------------------------------------

describe("__ix_unwrap behavior", () => {
	const unwrap = extractUnwrap(minimalStub());

	test("null → empty string", async () => expect(await unwrap(null)).toBe(""));
	test("undefined → empty string", async () =>
		expect(await unwrap(undefined)).toBe(""));
	test("false → empty string", async () =>
		expect(await unwrap(false)).toBe(""));
	test("true → empty string", async () => expect(await unwrap(true)).toBe(""));
	test("string passthrough", async () =>
		expect(await unwrap("hello")).toBe("hello"));
	test("number → string", async () => expect(await unwrap(42)).toBe("42"));
	test("zero → string", async () => expect(await unwrap(0)).toBe("0"));
	test("flat array joined", async () =>
		expect(await unwrap(["a", "b", "c"])).toBe("abc"));
	test("nested array flattened", async () =>
		expect(await unwrap(["a", ["b", "c"]])).toBe("abc"));
	test("array with nulls skips them", async () =>
		expect(await unwrap([null, "x", false, "y"])).toBe("xy"));
	test("array with numbers", async () =>
		expect(await unwrap([1, 2, 3])).toBe("123"));
	test("resolved promise passthrough", async () =>
		expect(await unwrap(Promise.resolve("async"))).toBe("async"));
});

// ---------------------------------------------------------------------------
// __ix_solidHtml — behavior (Solid adapter SSR output shapes)
// ---------------------------------------------------------------------------

describe("__ix_solidHtml behavior", () => {
	// Build using Solid-style imports block directly
	const solidImports = `function __ix_solidHtml(v) {
  return typeof v === "string" ? v : v && typeof v.t === "string" ? v.t : "";
}`;
	const solidHtml = new Function(
		`${solidImports}; return __ix_solidHtml;`,
	)() as (v: unknown) => string;

	test("{ t: '<p>...' } extracts .t", () =>
		expect(solidHtml({ t: "<p>hello</p>" })).toBe("<p>hello</p>"));

	test("plain string passthrough", () =>
		expect(solidHtml("<span>x</span>")).toBe("<span>x</span>"));

	test("null → empty string", () => expect(solidHtml(null)).toBe(""));
	test("undefined → empty string", () => expect(solidHtml(undefined)).toBe(""));
	test("{ t: '' } → empty string", () => expect(solidHtml({ t: "" })).toBe(""));
	test("object without .t → empty string", () =>
		expect(solidHtml({ other: "x" })).toBe(""));
});

// ---------------------------------------------------------------------------
// jsx() — attribute escaping / XSS
// ---------------------------------------------------------------------------

describe("jsx attribute escaping", () => {
	test("escapes & in attribute value", async () => {
		const out = await jsx("div", { "data-x": "a&b" });
		expect(out).toContain("&amp;");
		expect(out).not.toContain("a&b");
	});

	test('escapes " in attribute value', async () => {
		const out = await jsx("div", { "data-x": 'say "hi"' });
		expect(out).toContain("&quot;");
	});

	test("escapes < in attribute value", async () => {
		const out = await jsx("div", { "data-x": "<tag>" });
		expect(out).toContain("&lt;");
	});

	test("escapes > in attribute value", async () => {
		const out = await jsx("div", { "data-x": "a>b" });
		expect(out).toContain("&gt;");
	});

	test("XSS probe: script tag in attribute does not execute", async () => {
		const out = await jsx("div", {
			"data-x": "<script>window.__xss=1</script>",
		});
		expect(out).not.toContain("<script>");
		expect(out).toContain("&lt;script&gt;");
	});

	test("boolean true attribute rendered without value", async () => {
		const out = await jsx("input", { disabled: true });
		expect(out).toContain(" disabled");
		expect(out).not.toContain("disabled=");
	});

	test("boolean false attribute omitted", async () => {
		const out = await jsx("input", { disabled: false });
		expect(out).not.toContain("disabled");
	});
});

// ---------------------------------------------------------------------------
// Props JSON round-trip via generated stub
// ---------------------------------------------------------------------------

describe("props JSON round-trip in generated stub", () => {
	// Build a stub whose renderExpr returns "" — we only care about the
	// propsJson embedded in the <script> tag.
	const code = buildSsrStub(
		"./fake.js",
		[{ exportName: "default", islandName: "RoundTrip" }],
		{
			framework: "test",
			imports: "",
			renderExpr: () => '""',
		},
	);

	// Strip import lines so the code is self-contained, then eval it
	const runnable = code
		.replace(/^import .+;\n/gm, "")
		.replace(/^export default async function/m, "async function __stub_default")
		.replace(/^export async function (\w+)/gm, "async function $1");

	const fn = new Function(`${runnable}; return __stub_default;`)() as (
		props: Record<string, unknown>,
	) => string;

	test("string prop round-trips", async () => {
		const html = await fn({ message: "hello world" });
		expect(html).toContain('"message":"hello world"');
	});

	test("number prop round-trips", async () => {
		const html = await fn({ count: 42 });
		expect(html).toContain('"count":42');
	});

	test("boolean prop round-trips", async () => {
		const html = await fn({ flag: true });
		expect(html).toContain('"flag":true');
	});

	test("null prop round-trips", async () => {
		const html = await fn({ val: null });
		expect(html).toContain('"val":null');
	});

	test("array prop round-trips", async () => {
		const html = await fn({ items: ["a", "b"] });
		expect(html).toContain('"items":["a","b"]');
	});

	test("nested object prop round-trips", async () => {
		const html = await fn({ obj: { x: 1 } });
		expect(html).toContain('"obj":{"x":1}');
	});

	test("children are excluded from propsJson", async () => {
		const html = await fn({ label: "test", children: "<p>server html</p>" });
		expect(html).not.toContain('"children"');
		expect(html).toContain('"label":"test"');
	});

	test("island wrapper uses correct island name in data-island", async () => {
		const html = await fn({});
		expect(html).toContain('data-island="RoundTrip"');
	});

	test("each call produces a unique incrementing id", async () => {
		const h1 = await fn({});
		const h2 = await fn({});
		const id1 = h1.match(/id="(ix-RoundTrip-\d+)"/)?.[1];
		const id2 = h2.match(/id="(ix-RoundTrip-\d+)"/)?.[1];
		expect(id1).toBeTruthy();
		expect(id2).toBeTruthy();
		expect(id1).not.toBe(id2);
		const n1 = Number((id1 as string).split("-").at(-1));
		const n2 = Number((id2 as string).split("-").at(-1));
		expect(n2).toBe(n1 + 1);
	});
});
