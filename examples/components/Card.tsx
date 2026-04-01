/** @jsxImportSource solid-js */
"use client";

import { createSignal } from "solid-js";

/** Island that accepts children from the server — tests the server→client children boundary. */
// biome-ignore lint/suspicious/noExplicitAny: island boundary — children cross the SSR/hydration boundary as serialized HTML
export const Card = (props: { title: string; children?: any }) => {
	const [liked, setLiked] = createSignal(false);

	return (
		<div
			style={{
				border: "1px solid #ccc",
				"border-radius": "8px",
				padding: "1rem",
				"margin-top": "0.5rem",
			}}
		>
			<div
				style={{
					display: "flex",
					"justify-content": "space-between",
					"align-items": "center",
				}}
			>
				<strong>{props.title}</strong>
				<button
					type="button"
					onClick={() => setLiked((v) => !v)}
					style={{ cursor: "pointer", "font-size": "1.2rem" }}
				>
					{liked() ? "❤️" : "🤍"}
				</button>
			</div>
			<div style={{ "margin-top": "0.5rem", color: "#555" }}>
				{props.children}
			</div>
		</div>
	);
};

export default Card;
