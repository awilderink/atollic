// Universal component: no "use client", no @jsxImportSource.
// Compiled as Atollic HTML on the server, and as the importer's framework
// (React / Solid) on the client — see ?framework= query in vite.ts.

import type { UniversalFC } from "atollic";

const Button: UniversalFC<JSX.HtmlButtonTag> = (props) => {
	return (
		<button
			type={props.type ?? "button"}
			style="padding: 0.5rem 1rem; border: 1px solid #aaa; border-radius: 4px; cursor: pointer; background: #f5f5f5"
			{...props}
		>
			{props.children}
		</button>
	);
};

export default Button;
