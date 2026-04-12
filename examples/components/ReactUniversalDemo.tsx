/** @jsxImportSource react */
"use client";

import { useState } from "react";
import Button from "./Button.js";

export default function ReactUniversalDemo() {
	const [count, setCount] = useState(0);
	return (
		<div data-testid="react-universal-showcase">
			<p>
				React count:{" "}
				<strong data-testid="react-universal-count">{count}</strong>
			</p>
			<Button
				data-testid="react-universal-btn"
				onClick={() => setCount((c) => c + 1)}
			>
				React +1
			</Button>
		</div>
	);
}
