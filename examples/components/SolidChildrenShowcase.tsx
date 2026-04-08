/** @jsxImportSource solid-js */
"use client";

import { createSignal } from "solid-js";

// biome-ignore lint/suspicious/noExplicitAny: island boundary — children cross the SSR/hydration boundary as serialized HTML
export default function SolidChildrenShowcase(props: { title: string; children?: any }) {
	const [visible, setVisible] = createSignal(true);

	return (
		<div
			data-testid="solid-children-showcase"
			style={{ padding: "1rem", border: "1px solid #ccc", "border-radius": "8px" }}
		>
			<div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
				<strong>{props.title}</strong>
				<button
					data-testid="solid-children-toggle"
					type="button"
					onClick={() => setVisible((v) => !v)}
					style={{ padding: "0.25rem 0.75rem" }}
				>
					{visible() ? "Hide" : "Show"}
				</button>
			</div>
			{visible() && (
				<div data-testid="solid-children-content" style={{ "margin-top": "0.5rem" }}>
					{props.children}
				</div>
			)}
		</div>
	);
}
