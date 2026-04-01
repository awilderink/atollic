import { Fragment, jsx, jsxs } from "./jsx-runtime.js";

export { Fragment, jsx, jsxs };

export function jsxDEV(
	tag: string | ((props: Record<string, unknown>) => unknown),
	props: Record<string, unknown>,
	_key?: string,
	_isStaticChildren?: boolean,
	_source?: unknown,
	_self?: unknown,
): string | Promise<string> {
	return jsx(tag, props);
}
