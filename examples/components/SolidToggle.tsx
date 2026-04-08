/** @jsxImportSource solid-js */
"use client";

import { togglePanel, usePanelOpen } from "./shared";

export default function Toggle(props: { target: string; label: string }) {
	const open = usePanelOpen(props.target);

	return (
		<button
			type="button"
			onClick={() => togglePanel(props.target)}
			style={{ padding: "0.25rem 0.75rem" }}
		>
			{open() ? "Hide" : "Show"} {props.label}
		</button>
	);
}
