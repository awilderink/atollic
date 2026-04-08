/** @jsxImportSource react */
"use client";

import { useState } from "react";

const btnStyle = { padding: "0.25rem 0.75rem" };
const wrapStyle = {
	padding: "0.75rem",
	border: "1px solid #ccc",
	borderRadius: "8px",
	marginBottom: "0.5rem",
};

export default function ReactIslandA() {
	const [count, setCount] = useState(0);
	return (
		<div style={wrapStyle}>
			<p>
				A: <strong data-testid="react-island-a-count">{count}</strong>
			</p>
			<button
				data-testid="react-island-a-inc"
				type="button"
				onClick={() => setCount((c) => c + 1)}
				style={btnStyle}
			>
				+
			</button>
		</div>
	);
}

export function ReactIslandB() {
	const [count, setCount] = useState(0);
	return (
		<div style={wrapStyle}>
			<p>
				B: <strong data-testid="react-island-b-count">{count}</strong>
			</p>
			<button
				data-testid="react-island-b-inc"
				type="button"
				onClick={() => setCount((c) => c + 1)}
				style={btnStyle}
			>
				+
			</button>
		</div>
	);
}

export function ReactIslandC() {
	const [count, setCount] = useState(0);
	return (
		<div style={wrapStyle}>
			<p>
				C: <strong data-testid="react-island-c-count">{count}</strong>
			</p>
			<button
				data-testid="react-island-c-inc"
				type="button"
				onClick={() => setCount((c) => c + 1)}
				style={btnStyle}
			>
				+
			</button>
		</div>
	);
}
