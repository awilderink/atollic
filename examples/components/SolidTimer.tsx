/** @jsxImportSource solid-js */
"use client";

import { createSignal, onCleanup } from "solid-js";

export default function Timer(props: { label?: string }) {
	const [seconds, setSeconds] = createSignal(0);

	const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
	onCleanup(() => clearInterval(interval));

	return (
		<div
			style={{
				padding: "1rem",
				border: "1px solid #ccc",
				"border-radius": "8px",
			}}
		>
			<p>
				{props.label ?? "Timer"}: <strong data-testid="solid-timer-value">{seconds()}s</strong>
			</p>
		</div>
	);
}
