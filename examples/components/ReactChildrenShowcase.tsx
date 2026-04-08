/** @jsxImportSource react */
"use client";

import { useState } from "react";

export default function ReactChildrenShowcase(props: { title: string; children?: React.ReactNode }) {
	const [visible, setVisible] = useState(true);

	return (
		<div
			data-testid="react-children-showcase"
			style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}
		>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<strong>{props.title}</strong>
				<button
					data-testid="react-children-toggle"
					type="button"
					onClick={() => setVisible((v) => !v)}
					style={{ padding: "0.25rem 0.75rem" }}
				>
					{visible ? "Hide" : "Show"}
				</button>
			</div>
			{visible && (
				<div data-testid="react-children-content" style={{ marginTop: "0.5rem" }}>
					{props.children}
				</div>
			)}
		</div>
	);
}
