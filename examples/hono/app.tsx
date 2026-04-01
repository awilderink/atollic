import { Hono } from "hono";
import { Head } from "../../src/head.js";
import type { Children } from "../../src/html/types.js";
import { html } from "../../src/server.js";
import { atollic } from "../../src/servers/hono.js";
import Card from "../components/Card.js";
import Counter from "../components/Counter.js";
import Panel from "../components/Panel.js";
import Tabs from "../components/Tabs.js";
import ThemeCards from "../components/ThemeCards.js";
import Timer from "../components/Timer.js";
import Toggle from "../components/Toggle.js";

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
			<body>{children}</body>
		</html>
	);
}

function Nav() {
	return (
		<nav style="margin-bottom: 1.5rem">
			<a href="/" style="margin-right: 1rem">
				Home
			</a>
			<a href="/nested" style="margin-right: 1rem">
				Nested Islands
			</a>
			<a href="/htmx">HTMX</a>
		</nav>
	);
}

const pageStyle = "max-width: 600px; margin: 2rem auto; font-family: system-ui";
const sectionStyle =
	"margin-top: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px";

const app = new Hono();
app.use(atollic());

// -- Home -------------------------------------------------------------------
app.get("/", () =>
	html(
		<Layout title="atollic demo">
			<main style={pageStyle}>
				<Nav />
				<h1>atollic</h1>
				<p>
					This paragraph is server-rendered by Hono. The counter below is a
					Solid island.
				</p>
				<Counter initial={0} />
			</main>
		</Layout>,
	),
);

// -- Nested Islands ---------------------------------------------------------
app.get("/nested", () =>
	html(
		<Layout title="Nested Islands">
			<main style={pageStyle}>
				<Nav />
				<h1>Nested Islands</h1>

				<div style={sectionStyle}>
					<h2>Independent islands side by side</h2>
					<p>Counter and Timer are separate islands on the same page.</p>
					<Counter initial={5} />
					<div style="margin-top: 0.5rem">
						<Timer label="Uptime" />
					</div>
				</div>

				<div style={sectionStyle}>
					<h2>Shared signals across islands</h2>
					<p>
						Toggle and Panel are separate islands sharing reactive state via a
						module-level signal. No context needed — they read the same signal.
					</p>
					<Toggle target="demo-panel" label="Details" />
					<Panel
						id="demo-panel"
						text="This panel is controlled by the Toggle island above. Both islands share a reactive signal from a common module."
					/>
				</div>

				<div style={sectionStyle}>
					<h2>Server component wrapping an island</h2>
					<p>
						A native {"<details>"} element provides interactivity without JS.
						The island inside hydrates normally.
					</p>
					<details>
						<summary style="cursor: pointer">Reveal Timer</summary>
						<div style="margin-top: 0.5rem">
							<Timer label="Hidden Timer" />
						</div>
					</details>
				</div>

				<div style={sectionStyle}>
					<h2>Composite island (Tabs)</h2>
					<p>
						A single island boundary with multiple interactive pieces inside.
					</p>
					<Tabs
						tabs={[
							{ label: "About", content: "This is the about tab." },
							{
								label: "Settings",
								content: "Configure your preferences here.",
							},
							{ label: "Stats", content: "View your usage statistics." },
						]}
					/>
				</div>

				<div style={sectionStyle}>
					<h2>Server children → island</h2>
					<p>
						The Card island receives server-rendered HTML as children. This
						tests the server→client boundary for children/slots.
					</p>
					<Card title="Server-rendered content">
						<p>
							This paragraph was <strong>rendered on the server</strong> and
							passed as children to the Card island.
						</p>
						<ul>
							<li>Server item 1</li>
							<li>Server item 2</li>
							<li>Server item 3</li>
						</ul>
					</Card>
					<Card title="Mixed content">
						<p>Server text with a nested island below:</p>
						<Counter initial={99} />
					</Card>
				</div>

				<div style={sectionStyle}>
					<h2>Context within an island</h2>
					<p>
						Solid's createContext/useContext works inside a single island
						boundary. ThemeCards uses a ThemeContext provider — the switch and
						cards all read from the same context.
					</p>
					<ThemeCards cards={["Dashboard", "Profile", "Settings"]} />
				</div>
			</main>
		</Layout>,
	),
);

// -- HTMX -------------------------------------------------------------------
app.get("/htmx", () =>
	html(
		<Layout title="HTMX Demo" htmx>
			<main style={pageStyle}>
				<Nav />
				<h1>HTMX + Islands</h1>
				<p>
					Click the button to swap in a server-rendered fragment containing a
					Solid island. The island hydrates automatically after HTMX settles the
					swap.
				</p>
				<button
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
					style="min-height: 4rem; border: 1px dashed #aaa; border-radius: 8px; padding: 1rem"
				>
					<p style="color: #888">Island will appear here...</p>
				</div>
			</main>
		</Layout>,
	),
);

// -- HTMX fragment (partial HTML, no layout) --------------------------------
app.get("/htmx/fragment", () =>
	html(
		<div>
			<p>This counter was loaded via HTMX and hydrated automatically:</p>
			<Counter initial={42} />
		</div>,
	),
);

export default app.fetch;
