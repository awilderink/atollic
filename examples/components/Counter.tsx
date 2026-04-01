/** @jsxImportSource solid-js */
"use client";

import { createSignal } from "solid-js";

export default function Counter(props: { initial: number }) {
	const [count, setCount] = createSignal(props.initial);

	return (
		<div
			style={{
				padding: "1rem",
				border: "1px solid #ccc",
				"border-radius": "8px",
			}}
		>
			<p>
				Count: <strong>{count()}</strong>
			</p>
			<button
				class="count"
				type="button"
				onClick={() => setCount((c) => c + 1)}
				style={{ "margin-right": "0.5rem", padding: "0.25rem 0.75rem" }}
			>
				+
			</button>
			<button
				type="button"
				onClick={() => setCount((c) => c - 1)}
				style={{ padding: "0.25rem 0.75rem" }}
			>
				-
			</button>
		</div>
	);
}
