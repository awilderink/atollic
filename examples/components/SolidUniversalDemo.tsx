/** @jsxImportSource solid-js */
"use client:solid";

import { createSignal } from "solid-js";
import Button from "./Button.js";

export default function SolidUniversalDemo() {
	const [count, setCount] = createSignal(0);
	return (
		<div data-testid="solid-universal-showcase">
			<p>
				Solid count:{" "}
				<strong data-testid="solid-universal-count">{count()}</strong>
			</p>
			<Button
				data-testid="solid-universal-btn"
				onClick={() => setCount((c) => c + 1)}
			>
				Solid +1
			</Button>
		</div>
	);
}
