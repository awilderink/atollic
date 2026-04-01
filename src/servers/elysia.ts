import { Elysia } from "elysia";
import { getProductionAssets } from "../server.js";
import { extractHtml, isHtmlDocument, processHtml } from "../shared.js";

export function atollic() {
	return new Elysia({ name: "atollic" }).mapResponse(
		{ as: "global" },
		(ctx) => {
			const value = ctx.response ?? ctx.responseValue;
			const body = extractHtml(value);

			if (body && (isHtmlDocument(body) || Array.isArray(value))) {
				return new Response(processHtml(body, getProductionAssets()), {
					headers: { "content-type": "text/html; charset=utf-8" },
				});
			}
		},
	);
}
