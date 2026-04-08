/** @jsxImportSource solid-js */
"use client";

import { createSignal, For } from "solid-js";

export default function Tabs(props: {
	tabs: { label: string; content: string }[];
}) {
	const [active, setActive] = createSignal(0);

	return (
		<div
			style={{
				border: "1px solid #ccc",
				"border-radius": "8px",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					display: "flex",
					"border-bottom": "1px solid #ccc",
					background: "#f5f5f5",
				}}
			>
				<For each={props.tabs}>
					{(tab, i) => (
						<button
							type="button"
							onClick={() => setActive(i())}
							style={{
								padding: "0.5rem 1rem",
								border: "none",
								background: active() === i() ? "#fff" : "transparent",
								"border-bottom":
									active() === i() ? "2px solid #333" : "2px solid transparent",
								cursor: "pointer",
								"font-weight": active() === i() ? "bold" : "normal",
							}}
						>
							{tab.label}
						</button>
					)}
				</For>
			</div>
			<div style={{ padding: "1rem" }}>
				<p>{props.tabs[active()]?.content}</p>
			</div>
		</div>
	);
}
