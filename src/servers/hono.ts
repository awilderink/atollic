import type { MiddlewareHandler } from "hono";
import { getProductionAssets } from "../server.js";
import { isHtmlDocument, processHtml } from "../shared.js";

export function atollic(): MiddlewareHandler {
	return async (c, next) => {
		await next();

		const ct = c.res.headers.get("content-type") || "";
		if (!ct.includes("text/html")) return;

		// Clone so peeking at the body doesn't consume c.res. Fragments (e.g.
		// HTMX partials) pass through untouched; only full documents get
		// rewrapped with injected assets.
		const body = await c.res.clone().text();
		if (!isHtmlDocument(body)) return;

		const headers = new Headers(c.res.headers);
		headers.delete("content-length");
		c.res = new Response(processHtml(body, getProductionAssets()), {
			status: c.res.status,
			headers,
		});
	};
}
