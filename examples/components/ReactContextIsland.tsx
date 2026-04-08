/** @jsxImportSource react */
"use client";

import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
	theme: "light",
	toggle: () => {},
});

function ThemeSwitch() {
	const { theme, toggle } = useContext(ThemeContext);
	return (
		<button
			data-testid="react-context-toggle"
			type="button"
			onClick={toggle}
			style={{ padding: "0.25rem 0.75rem", marginBottom: "0.75rem" }}
		>
			Switch to {theme === "light" ? "dark" : "light"} theme
		</button>
	);
}

function ThemeCard(props: { title: string; index: number }) {
	const { theme } = useContext(ThemeContext);
	return (
		<div
			data-testid={`react-context-card-${props.index}`}
			data-theme={theme}
			style={{
				padding: "0.75rem",
				borderRadius: "8px",
				marginBottom: "0.5rem",
				background: theme === "light" ? "#fff" : "#333",
				color: theme === "light" ? "#333" : "#fff",
				border: `1px solid ${theme === "light" ? "#ccc" : "#555"}`,
				transition: "background 0.2s, color 0.2s",
			}}
		>
			{props.title}
		</div>
	);
}

export default function ReactContextIsland(props: { cards: string[] }) {
	const [theme, setTheme] = useState<Theme>("light");
	const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

	return (
		<ThemeContext.Provider value={{ theme, toggle }}>
			<div
				style={{
					padding: "1rem",
					border: "1px solid #ccc",
					borderRadius: "8px",
				}}
			>
				<ThemeSwitch />
				{props.cards.map((title, i) => (
					<ThemeCard key={title} title={title} index={i} />
				))}
			</div>
		</ThemeContext.Provider>
	);
}
