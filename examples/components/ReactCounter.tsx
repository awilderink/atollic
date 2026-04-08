/** @jsxImportSource react */
"use client";

import { useState } from "react";

export default function ReactCounter(props: { initial: number }) {
	const [count, setCount] = useState(props.initial);

	return (
		<div
			style={{
				padding: "1rem",
				border: "1px solid #ccc",
				borderRadius: "8px",
			}}
		>
			<p>
				Count: <strong>{count}</strong>
			</p>
			<button
				type="button"
				onClick={() => setCount((c) => c + 1)}
				style={{ marginRight: "0.5rem", padding: "0.25rem 0.75rem" }}
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
