/** @jsxImportSource solid-js */
"use client";

import { createContext, createSignal, For, useContext } from "solid-js";

type Theme = "light" | "dark";
const ThemeContext = createContext<{
	theme: () => Theme;
	toggle: () => void;
}>();

// biome-ignore lint/suspicious/noExplicitAny: Solid JSX children
function ThemeProvider(props: { children: any }) {
	const [theme, setTheme] = createSignal<Theme>("light");
	const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

	return (
		<ThemeContext.Provider value={{ theme, toggle }}>
			{props.children}
		</ThemeContext.Provider>
	);
}

function ThemeSwitch() {
	// biome-ignore lint/style/noNonNullAssertion: always rendered inside ThemeProvider
	const ctx = useContext(ThemeContext)!;
	return (
		<button
			type="button"
			onClick={ctx.toggle}
			style={{ padding: "0.25rem 0.75rem", "margin-bottom": "0.75rem" }}
		>
			Switch to {ctx.theme() === "light" ? "dark" : "light"} theme
		</button>
	);
}

function Card(props: { title: string }) {
	// biome-ignore lint/style/noNonNullAssertion: always rendered inside ThemeProvider
	const ctx = useContext(ThemeContext)!;
	return (
		<div
			style={{
				padding: "0.75rem",
				"border-radius": "8px",
				"margin-bottom": "0.5rem",
				background: ctx.theme() === "light" ? "#fff" : "#333",
				color: ctx.theme() === "light" ? "#333" : "#fff",
				border: `1px solid ${ctx.theme() === "light" ? "#ccc" : "#555"}`,
				transition: "background 0.2s, color 0.2s",
			}}
		>
			{props.title}
		</div>
	);
}

export default function ThemeCards(props: { cards: string[] }) {
	return (
		<ThemeProvider>
			<ThemeSwitch />
			<For each={props.cards}>{(title) => <Card title={title} />}</For>
		</ThemeProvider>
	);
}
