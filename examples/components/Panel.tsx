/** @jsxImportSource solid-js */
"use client";

import { usePanelOpen } from "./shared";

export default function Panel(props: { id: string; text: string }) {
	const open = usePanelOpen(props.id);

	return (
		<div
			style={{
				overflow: "hidden",
				"max-height": open() ? "200px" : "0",
				opacity: open() ? "1" : "0",
				transition: "max-height 0.3s, opacity 0.3s",
			}}
		>
			<div
				style={{
					padding: "1rem",
					border: "1px solid #ccc",
					"border-radius": "8px",
					"margin-top": "0.5rem",
				}}
			>
				{props.text}
			</div>
		</div>
	);
}
