// Universal component: no "use client", no @jsxImportSource.
// Compiled as Atollic HTML on the server, and as the importer's framework
// (React / Solid) on the client — see ?framework= query in vite.ts.

export default function Button(props: {
	// biome-ignore lint/suspicious/noExplicitAny: children type varies by framework
	children?: any;
	class?: string;
	onClick?: () => void;
	type?: "button" | "submit" | "reset";
	"data-testid"?: string;
	// biome-ignore lint/suspicious/noExplicitAny: return type varies by compile context
}): any {
	return (
		<button
			type={props.type ?? "button"}
			class={props.class}
			onClick={props.onClick}
			data-testid={props["data-testid"]}
			style="padding: 0.5rem 1rem; border: 1px solid #aaa; border-radius: 4px; cursor: pointer; background: #f5f5f5"
		>
			{props.children}
		</button>
	);
}
