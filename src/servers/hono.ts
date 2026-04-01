import type { MiddlewareHandler } from "hono";
import { getProductionAssets } from "../server.js";
import { isHtmlDocument, processHtml } from "../shared.js";

export function atollic(): MiddlewareHandler {
	return async (c, next) => {
		await next();

		const ct = c.res.headers.get("content-type") || "";
		if (!ct.includes("text/html")) return;

		const body = await c.res.text();
		if (!isHtmlDocument(body)) return;

		c.res = new Response(processHtml(body, getProductionAssets()), {
			status: c.res.status,
			headers: c.res.headers,
		});
	};
}
