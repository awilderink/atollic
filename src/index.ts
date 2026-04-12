export type { HtmlExtractor } from "./server.js";
export {
	getProductionAssets,
	html,
	registerHtmlExtractor,
	setProductionAssets,
} from "./server.js";

/**
 * Opaque type alias for children in universal components.
 * Resolves to the correct type at compile time depending on the JSX runtime
 * (string for Atollic HTML, JSX.Element for Solid/React).
 */
// biome-ignore lint/suspicious/noExplicitAny: intentionally opaque across runtimes
export type UniversalChildren = any;

/**
 * Function-component signature for universal components (no directive, no pragma).
 * Use this instead of sprinkling `any` through your props and return type.
 *
 * @example
 * ```tsx
 * import type { UniversalFC } from "atollic";
 *
 * const Button: UniversalFC<{ variant?: "primary" | "ghost" }> = (props) => (
 *   <button class={props.variant}>{props.children}</button>
 * );
 * export default Button;
 * ```
 */
export type UniversalFC<P = Record<string, never>> = (
	props: P & { children?: UniversalChildren },
	// biome-ignore lint/suspicious/noExplicitAny: return type varies by compile context
) => any;
