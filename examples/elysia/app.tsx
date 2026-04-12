import { Elysia } from "elysia";
import { Head } from "../../src/head.js";
import type { Children } from "../../src/html/types.js";
import { atollic } from "../../src/servers/elysia.js";
// Universal components (no "use client", no @jsxImportSource)
import Button from "../components/Button.js";
import ReactChildrenShowcase from "../components/ReactChildrenShowcase.js";
import ReactContextIsland from "../components/ReactContextIsland.js";
// React islands
import ReactCounter from "../components/ReactCounter.js";
import ReactIslandA, {
	ReactIslandB,
	ReactIslandC,
} from "../components/ReactNamedExports.js";
import ReactNoPropIsland from "../components/ReactNoPropIsland.js";
import ReactPropsShowcase from "../components/ReactPropsShowcase.js";
import ReactTimer from "../components/ReactTimer.js";
import ReactUniversalDemo from "../components/ReactUniversalDemo.js";
// Solid islands
import SolidCard from "../components/SolidCard.js";
import SolidChildrenShowcase from "../components/SolidChildrenShowcase.js";
import SolidCounter from "../components/SolidCounter.js";
import SolidIslandA, {
	SolidIslandB,
	SolidIslandC,
} from "../components/SolidNamedExports.js";
import SolidNoPropIsland from "../components/SolidNoPropIsland.js";
import SolidPanel from "../components/SolidPanel.js";
import SolidPropsShowcase from "../components/SolidPropsShowcase.js";
import SolidThemeCards from "../components/SolidThemeCards.js";
import SolidTimer from "../components/SolidTimer.js";
import SolidToggle from "../components/SolidToggle.js";
import SolidUniversalDemo from "../components/SolidUniversalDemo.js";

// Client script (discovered by Vite plugin, runs only in browser)
import "../components/ClientScript.js";

// ---------------------------------------------------------------------------
// Layout + Nav
// ---------------------------------------------------------------------------

function Layout({
	title,
	htmx,
	children,
}: {
	title: string;
	htmx?: boolean;
	children?: Children;
}) {
	return (
		<html lang="en">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>{title}</title>
				{htmx && (
					<script
						src="https://unpkg.com/htmx.org@2.0.4"
						crossorigin="anonymous"
					/>
				)}
				<Head />
			</head>
			<body style="font-family: system-ui; max-width: 720px; margin: 2rem auto; padding: 0 1rem">
				{children}
			</body>
		</html>
	);
}

function Nav() {
	const links: [string, string][] = [
		["/basics", "Basics"],
		["/zero-js", "Zero JS"],
		["/props", "Props"],
		["/frameworks", "Frameworks"],
		["/children", "Children"],
		["/named-exports", "Named Exports"],
		["/state", "State"],
		["/context", "Context"],
		["/lifecycle", "Lifecycle"],
		["/htmx", "HTMX"],
		["/dynamic", "Dynamic"],
		["/scripts", "Scripts"],
		["/async", "Async"],
		["/universal", "Universal"],
	];
	return (
		<nav style="margin-bottom: 2rem; display: flex; flex-wrap: wrap; gap: 0.5rem">
			{links.map(([href, label]) => (
				<a
					href={href}
					style="padding: 0.25rem 0.5rem; border: 1px solid #ddd; border-radius: 4px; text-decoration: none; color: inherit; font-size: 0.875rem"
				>
					{label}
				</a>
			))}
		</nav>
	);
}

const section =
	"margin-top: 1.5rem; padding: 1rem; border: 1px solid #eee; border-radius: 8px";

// ---------------------------------------------------------------------------
// Async server component (used by /async and /children)
// ---------------------------------------------------------------------------

async function AsyncContent() {
	await new Promise<void>((r) => setTimeout(r, 0));
	return (
		<p data-testid="async-content" style="color: #555; margin: 0">
			Async server content resolved
		</p>
	);
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

const routes: [string, string, string][] = [
	[
		"/basics",
		"Basics",
		"Island hydration, counters, no-prop islands, independence",
	],
	[
		"/zero-js",
		"Zero JS",
		"Page with no islands — verifies no hydration JS is loaded",
	],
	[
		"/props",
		"Props",
		"12 prop types: strings, numbers, booleans, null, arrays, objects",
	],
	[
		"/frameworks",
		"Frameworks",
		"Solid and React islands coexisting on the same page",
	],
	[
		"/children",
		"Children",
		"Server-rendered children passed into islands, cross-framework nesting",
	],
	[
		"/named-exports",
		"Named Exports",
		"Multiple island exports from a single file",
	],
	["/state", "State", "Cross-island shared signal (module-level state)"],
	[
		"/context",
		"Context",
		"Solid createContext and React createContext inside islands",
	],
	[
		"/lifecycle",
		"Lifecycle",
		"Timer islands — onCleanup (Solid) and useEffect cleanup (React)",
	],
	[
		"/htmx",
		"HTMX",
		"Island inserted via HTMX swap, hydrated by MutationObserver",
	],
	["/dynamic", "Dynamic", "Islands inserted programmatically after load"],
	["/scripts", "Scripts", "Plain 'use client' .ts file — no JSX framework"],
	[
		"/async",
		"Async",
		"Async server components as standalone elements and island children",
	],
	[
		"/universal",
		"Universal",
		"Shared component used on server, in React islands, and in Solid islands",
	],
];

const app = new Elysia()
	.use(atollic())

	// / -----------------------------------------------------------------------
	.get("/", () => (
		<Layout title="atollic examples">
			<h1 style="margin-bottom: 0.25rem">atollic</h1>
			<p style="color: #666; margin-top: 0; margin-bottom: 2rem">
				Island architecture for WinterCG runtimes — example routes
			</p>
			<ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.75rem">
				{routes.map(([href, label, desc]) => (
					<li>
						<a
							href={href}
							style="font-weight: 600; text-decoration: none; color: #0070f3"
						>
							{label}
						</a>
						<span style="color: #555; margin-left: 0.5rem; font-size: 0.9rem">
							{desc}
						</span>
					</li>
				))}
			</ul>
		</Layout>
	))

	// /basics ------------------------------------------------------------------
	.get("/basics", () => (
		<Layout title="Basics">
			<Nav />
			<h1>Basics</h1>

			<div data-testid="solid-counter-section" style={section}>
				<h2>Solid Counter</h2>
				<SolidCounter initial={0} />
			</div>

			<div data-testid="solid-noprop-section" style={section}>
				<h2>Solid — No Props</h2>
				<SolidNoPropIsland />
			</div>

			<div data-testid="react-counter-section" style={section}>
				<h2>React Counter</h2>
				<ReactCounter initial={0} />
			</div>

			<div data-testid="react-noprop-section" style={section}>
				<h2>React — No Props</h2>
				<ReactNoPropIsland />
			</div>

			<div data-testid="independence-section" style={section}>
				<h2>Independence</h2>
				<p>Two Solid counters — each has its own state.</p>
				<div data-testid="counter-a">
					<SolidCounter initial={0} />
				</div>
				<div data-testid="counter-b" style="margin-top: 0.5rem">
					<SolidCounter initial={0} />
				</div>
			</div>
		</Layout>
	))

	// /zero-js -----------------------------------------------------------------
	.get("/zero-js", () => (
		<Layout title="Zero JS">
			<Nav />
			<h1 data-testid="zero-js-heading">Zero JS</h1>
			<p>No islands on this page. No hydration JavaScript is loaded.</p>
		</Layout>
	))

	// /props -------------------------------------------------------------------
	.get("/props", () => {
		const allProps = {
			plainString: "hello world",
			htmlString: '<b>bold</b> & "quotes"',
			xssString: "<script>window.__xss=1</script>",
			int: 42,
			float: 3.14,
			negative: -7,
			zero: 0,
			boolTrue: true as const,
			boolFalse: false as const,
			nullVal: null,
			strArray: ["a", "b", "c"],
			nestedObj: { outer: { inner: "deep" } },
		};
		return (
			<Layout title="Props">
				<Nav />
				<h1>Props</h1>

				<div data-testid="solid-props-section" style={section}>
					<h2>Solid</h2>
					<SolidPropsShowcase {...allProps} />
				</div>

				<div data-testid="react-props-section" style={section}>
					<h2>React</h2>
					<ReactPropsShowcase {...allProps} />
				</div>
			</Layout>
		);
	})

	// /frameworks --------------------------------------------------------------
	.get("/frameworks", () => (
		<Layout title="Frameworks">
			<Nav />
			<h1>Frameworks</h1>
			<p>Solid and React islands coexist on the same page.</p>

			<div data-testid="solid-framework-section" style={section}>
				<h2>Solid (initial=10)</h2>
				<SolidCounter initial={10} />
			</div>

			<div data-testid="react-framework-section" style={section}>
				<h2>React (initial=20)</h2>
				<ReactCounter initial={20} />
			</div>
		</Layout>
	))

	// /children ----------------------------------------------------------------
	.get("/children", () => (
		<Layout title="Children">
			<Nav />
			<h1>Children</h1>

			<div data-testid="solid-text-children" style={section}>
				<h2>Solid — plain text children</h2>
				<SolidCard title="Plain text">
					Just a string passed as children.
				</SolidCard>
			</div>

			<div data-testid="solid-jsx-children" style={section}>
				<h2>Solid — server JSX children</h2>
				<SolidCard title="Server JSX">
					<p>
						Paragraph rendered <strong>on the server</strong>.
					</p>
					<ul>
						<li>Item one</li>
						<li>Item two</li>
					</ul>
				</SolidCard>
			</div>

			<div data-testid="solid-toggle-children" style={section}>
				<h2>Solid — conditional children</h2>
				<SolidChildrenShowcase title="Toggle me">
					<p data-testid="toggleable-content">This content can be hidden.</p>
				</SolidChildrenShowcase>
			</div>

			<div data-testid="solid-async-children" style={section}>
				<h2>Solid — async server children</h2>
				<SolidCard title="Async">
					<AsyncContent />
				</SolidCard>
			</div>

			<div data-testid="solid-nested-island-children" style={section}>
				<h2>Solid — nested island in children</h2>
				<SolidCard title="Outer card">
					<SolidCounter initial={0} />
				</SolidCard>
			</div>

			<div data-testid="react-jsx-children" style={section}>
				<h2>React — server JSX children</h2>
				<ReactChildrenShowcase title="React + server JSX">
					<p>
						Paragraph rendered <strong>on the server</strong>.
					</p>
				</ReactChildrenShowcase>
			</div>

			<div data-testid="cross-react-solid-children" style={section}>
				<h2>Cross-framework — React outer, Solid inner</h2>
				<ReactChildrenShowcase title="React outer">
					<SolidCounter initial={5} />
				</ReactChildrenShowcase>
			</div>

			<div data-testid="cross-solid-react-children" style={section}>
				<h2>Cross-framework — Solid outer, React inner</h2>
				<SolidChildrenShowcase title="Solid outer">
					<ReactCounter initial={5} />
				</SolidChildrenShowcase>
			</div>

			<div data-testid="three-level-children" style={section}>
				<h2>Three-level nesting</h2>
				<ReactChildrenShowcase title="React L1">
					<SolidChildrenShowcase title="Solid L2">
						<p data-testid="three-level-leaf">Leaf server content</p>
					</SolidChildrenShowcase>
				</ReactChildrenShowcase>
			</div>
		</Layout>
	))

	// /named-exports -----------------------------------------------------------
	.get("/named-exports", () => (
		<Layout title="Named Exports">
			<Nav />
			<h1>Named Exports</h1>
			<p>
				One file, multiple island exports — each is independently hydratable.
			</p>

			<div data-testid="solid-named-section" style={section}>
				<h2>Solid</h2>
				<SolidIslandA />
				<SolidIslandB />
				<SolidIslandC />
			</div>

			<div data-testid="react-named-section" style={section}>
				<h2>React</h2>
				<ReactIslandA />
				<ReactIslandB />
				<ReactIslandC />
			</div>
		</Layout>
	))

	// /state -------------------------------------------------------------------
	.get("/state", () => (
		<Layout title="State">
			<Nav />
			<h1>Cross-island State</h1>
			<p>
				Toggle and Panel share a module-level signal — separate island roots, no
				context provider.
			</p>

			<div data-testid="state-section" style={section}>
				<SolidToggle target="demo-panel" label="panel" />
				<SolidPanel
					id="demo-panel"
					text="This panel is driven by a shared signal."
				/>
			</div>

			<div data-testid="state-second-section" style={section}>
				<p>A second panel on the same signal:</p>
				<SolidPanel
					id="demo-panel-2"
					text="Second panel — same signal source."
				/>
			</div>
		</Layout>
	))

	// /context -----------------------------------------------------------------
	.get("/context", () => (
		<Layout title="Context">
			<Nav />
			<h1>Context</h1>

			<div data-testid="solid-context-section" style={section}>
				<h2>Solid createContext</h2>
				<SolidThemeCards cards={["Dashboard", "Profile", "Settings"]} />
			</div>

			<div data-testid="react-context-section" style={section}>
				<h2>React createContext</h2>
				<ReactContextIsland cards={["Home", "Reports", "Admin"]} />
			</div>

			<div data-testid="context-no-leak-section" style={section}>
				<h2>No context leak across island boundaries</h2>
				<p>Toggling one does not affect the other.</p>
				<div data-testid="context-island-1">
					<SolidThemeCards cards={["Island 1"]} />
				</div>
				<div data-testid="context-island-2" style="margin-top: 0.5rem">
					<SolidThemeCards cards={["Island 2"]} />
				</div>
			</div>
		</Layout>
	))

	// /lifecycle ---------------------------------------------------------------
	.get("/lifecycle", () => (
		<Layout title="Lifecycle">
			<Nav />
			<h1>Lifecycle</h1>

			<div data-testid="solid-timer-section" style={section}>
				<h2>Solid — onCleanup</h2>
				<SolidTimer label="Solid" />
			</div>

			<div data-testid="react-timer-section" style={section}>
				<h2>React — useEffect cleanup</h2>
				<ReactTimer label="React" />
			</div>
		</Layout>
	))

	// /htmx --------------------------------------------------------------------
	.get("/htmx", () => (
		<Layout title="HTMX" htmx>
			<Nav />
			<h1>HTMX + Islands</h1>
			<p>
				Islands inserted by HTMX swaps hydrate automatically via the
				MutationObserver.
			</p>
			<button
				data-testid="htmx-load-btn"
				type="button"
				hx-get="/htmx/fragment"
				hx-target="#htmx-target"
				hx-swap="innerHTML"
				style="padding: 0.5rem 1rem; margin-bottom: 1rem"
			>
				Load island via HTMX
			</button>
			<div
				id="htmx-target"
				data-testid="htmx-target"
				style="min-height: 4rem; border: 1px dashed #aaa; border-radius: 8px; padding: 1rem"
			>
				<p style="color: #888">Island will appear here...</p>
			</div>
		</Layout>
	))

	.get("/htmx/fragment", () => <SolidCounter initial={0} />)

	// /dynamic -----------------------------------------------------------------
	.get("/dynamic", () => (
		<Layout title="Dynamic">
			<Nav />
			<h1>Dynamic Island Insertion</h1>
			<p>
				Islands added to the DOM after initial load are picked up automatically
				by the MutationObserver.
			</p>

			<template id="solid-counter-tpl">
				<SolidCounter initial={0} />
			</template>
			<template id="react-counter-tpl">
				<ReactCounter initial={0} />
			</template>

			<div style={section}>
				<button
					data-testid="insert-solid-btn"
					type="button"
					onclick="document.getElementById('dynamic-target').appendChild(document.getElementById('solid-counter-tpl').content.cloneNode(true))"
					style="padding: 0.5rem 1rem; margin-right: 0.5rem"
				>
					Insert Solid
				</button>
				<button
					data-testid="insert-react-btn"
					type="button"
					onclick="document.getElementById('dynamic-target').appendChild(document.getElementById('react-counter-tpl').content.cloneNode(true))"
					style="padding: 0.5rem 1rem; margin-right: 0.5rem"
				>
					Insert React
				</button>
				<button
					data-testid="clear-btn"
					type="button"
					onclick="document.getElementById('dynamic-target').innerHTML = ''"
					style="padding: 0.5rem 1rem"
				>
					Clear
				</button>
			</div>

			<div
				id="dynamic-target"
				data-testid="dynamic-target"
				style="min-height: 4rem; border: 1px dashed #aaa; border-radius: 8px; padding: 1rem; margin-top: 1rem"
			>
				<p style="color: #888">Islands will appear here...</p>
			</div>
		</Layout>
	))

	// /scripts -----------------------------------------------------------------
	.get("/scripts", () => (
		<Layout title="Scripts">
			<Nav />
			<h1>Client Scripts</h1>
			<p>
				A plain <code>"use client"</code> <code>.ts</code> file — no JSX
				framework. Runs only in the browser.
			</p>
			<div
				id="script-target"
				data-testid="script-target"
				style="padding: 1rem; border: 1px solid #ccc; border-radius: 8px; margin-top: 1rem"
			>
				Waiting for script...
			</div>
		</Layout>
	))

	// /async -------------------------------------------------------------------
	.get("/async", () => (
		<Layout title="Async">
			<Nav />
			<h1>Async Server Components</h1>

			<div data-testid="async-standalone-section" style={section}>
				<h2>Standalone async component</h2>
				<AsyncContent />
			</div>

			<div data-testid="async-as-children-section" style={section}>
				<h2>Async component as island children</h2>
				<SolidCard title="Async children">
					<AsyncContent />
				</SolidCard>
			</div>

			<div data-testid="async-multiple-section" style={section}>
				<h2>Multiple async components</h2>
				<AsyncContent />
				<AsyncContent />
				<AsyncContent />
			</div>
		</Layout>
	))

	// /universal ---------------------------------------------------------------
	.get("/universal", () => (
		<Layout title="Universal">
			<Nav />
			<h1>Universal Components</h1>
			<p>
				A single Button component (no directive, no pragma) used across server
				HTML, a React island, and a Solid island.
			</p>

			<div data-testid="server-universal-section" style={section}>
				<h2>Server-rendered Button</h2>
				<p>
					The Button renders as plain HTML on the server. The{" "}
					<code>onClick</code> prop is dropped (functions are not valid HTML
					attributes).
				</p>
				<Button data-testid="server-universal-btn" class="server-btn">
					Server Button
				</Button>
			</div>

			<div data-testid="react-universal-section" style={section}>
				<h2>React island with shared Button</h2>
				<ReactUniversalDemo />
			</div>

			<div data-testid="solid-universal-section" style={section}>
				<h2>Solid island with shared Button</h2>
				<SolidUniversalDemo />
			</div>
		</Layout>
	));

export default app.handle;
