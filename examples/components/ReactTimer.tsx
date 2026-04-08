/** @jsxImportSource react */
"use client";

import { useEffect, useState } from "react";

export default function ReactTimer(props: { label?: string }) {
	const [seconds, setSeconds] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div
			style={{
				padding: "1rem",
				border: "1px solid #ccc",
				borderRadius: "8px",
			}}
		>
			<p>
				{props.label ?? "Timer"}:{" "}
				<strong data-testid="react-timer-value">{seconds}s</strong>
			</p>
		</div>
	);
}
