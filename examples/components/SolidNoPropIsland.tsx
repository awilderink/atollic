/** @jsxImportSource solid-js */
"use client";

export default function SolidNoPropIsland() {
	return (
		<div
			data-testid="solid-noprop"
			style={{
				padding: "1rem",
				border: "1px solid #ccc",
				"border-radius": "8px",
			}}
		>
			Solid island — no props
		</div>
	);
}
