/** @jsxImportSource solid-js */
"use client";

import { createSignal } from "solid-js";

const btnStyle = { padding: "0.25rem 0.75rem" };
const wrapStyle = { padding: "0.75rem", border: "1px solid #ccc", "border-radius": "8px", "margin-bottom": "0.5rem" };

export default function SolidIslandA() {
	const [count, setCount] = createSignal(0);
	return (
		<div style={wrapStyle}>
			<p>A: <strong data-testid="solid-island-a-count">{count()}</strong></p>
			<button data-testid="solid-island-a-inc" type="button" onClick={() => setCount((c) => c + 1)} style={btnStyle}>+</button>
		</div>
	);
}

export function SolidIslandB() {
	const [count, setCount] = createSignal(0);
	return (
		<div style={wrapStyle}>
			<p>B: <strong data-testid="solid-island-b-count">{count()}</strong></p>
			<button data-testid="solid-island-b-inc" type="button" onClick={() => setCount((c) => c + 1)} style={btnStyle}>+</button>
		</div>
	);
}

export function SolidIslandC() {
	const [count, setCount] = createSignal(0);
	return (
		<div style={wrapStyle}>
			<p>C: <strong data-testid="solid-island-c-count">{count()}</strong></p>
			<button data-testid="solid-island-c-inc" type="button" onClick={() => setCount((c) => c + 1)} style={btnStyle}>+</button>
		</div>
	);
}
