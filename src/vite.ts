/**
 * Vite plugin for atollic.
 *
 * - Boots a fetch-based server as dev-server middleware (via Vite's SSR loader).
 * - Discovers island components via `"use client"` directives and generates
 *   a client entry.
 * - Delegates SSR rendering and client hydration to framework adapters.
 * - Injects the client runtime + Vite HMR client into HTML responses.
 * - Sends a custom HMR event on server-side file changes so the client
 *   can refetch + morph the page without a full reload.
 */

import { readFileSync } from "node:fs";
import { glob, readFile } from "node:fs/promises";
import type { IncomingMessage } from "node:http";
import { basename, dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ConfigEnv, Plugin, ViteDevServer } from "vite";
import { transformWithOxc } from "vite";
import type { FrameworkAdapter, IslandExport } from "./adapter.js";
import {
	ensureDoctype,
	extractHtml,
	injectHead,
	isHtmlDocument,
} from "./shared.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const VIRTUAL_CLIENT_ID = "virtual:atollic/client";
const RESOLVED_VIRTUAL_CLIENT_ID = `\0${VIRTUAL_CLIENT_ID}`;
const VIRTUAL_PROD_ENTRY_ID = "virtual:atollic/prod-entry";
const RESOLVED_VIRTUAL_PROD_ENTRY_ID = `\0${VIRTUAL_PROD_ENTRY_ID}`;
const VIRTUAL_FW_PREFIX = "virtual:atollic/fw-";
const HMR_RELOAD_EVENT = "atollic:reload";
const RAW_ISLAND_QUERY = "?raw-island";

/** Matches .ts, .tsx, .js, .jsx */
const ALL_SCRIPT_RE = /\.[jt]sx?$/;
/** Matches only .tsx, .jsx (island-capable files) */
const JSX_ONLY_RE = /\.[jt]sx$/;
/** Matches CSS files */
const CSS_RE = /\.css($|\?)/;

// ---------------------------------------------------------------------------
// Directive parsing
// ---------------------------------------------------------------------------

interface UseClientDirective {
	hasDirective: boolean;
	/** The framework name from `"use client:solid"`, or undefined for plain `"use client"` */
	framework?: string;
}

function parseUseClientDirective(source: string): UseClientDirective {
	// Strip leading comments (block and line) and whitespace before checking
	const stripped = source.replace(
		/^\s*(\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*/g,
		"",
	);
	const match = stripped.match(/^["']use client(?::(\w+))?["']/);
	if (!match) return { hasDirective: false };
	return { hasDirective: true, framework: match[1] };
}

function stripUseClientDirective(source: string): string {
	return source.replace(/^["']use client(?::\w+)?["'];?\s*/m, "");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AtollicOptions {
	/** Path to the file that default-exports a fetch function: (req: Request) => Response */
	entry: string;
	/** Framework adapters. Islands use the first adapter by default. */
	frameworks?: FrameworkAdapter[];
}

interface IslandInfo {
	absPath: string;
	exportName: string; // "default" | named export
	adapter: FrameworkAdapter;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract PascalCase component exports from a "use client" source file.
 * Only PascalCase names are treated as island components.
 */
function parseComponentExports(
	source: string,
	fallbackName: string,
): IslandExport[] {
	const exports: IslandExport[] = [];
	const stripped = stripUseClientDirective(source);

	// export default function Name / export default class Name
	const defaultNamedRe = /export\s+default\s+(?:function|class)\s+([A-Z]\w*)/;
	const defaultMatch = stripped.match(defaultNamedRe);
	if (defaultMatch) {
		exports.push({ exportName: "default", islandName: defaultMatch[1] });
	} else if (/export\s+default\s/.test(stripped)) {
		// Anonymous default export — use filename
		exports.push({ exportName: "default", islandName: fallbackName });
	}

	// export function Name / export const Name / export class Name (PascalCase only)
	const namedRe =
		/export\s+(?:function|const|let|var|class)\s+([A-Z][A-Za-z0-9]*)/g;
	for (const match of stripped.matchAll(namedRe)) {
		exports.push({ exportName: match[1], islandName: match[1] });
	}

	return exports;
}

function generateClientEntry(
	islands: Record<string, IslandInfo>,
	clientScripts: Set<string>,
	cssFiles: Set<string>,
	root: string,
): string {
	const cssFileImports = [...cssFiles]
		.map((id) => `import "${id}";`)
		.join("\n");

	const scriptImports = [...clientScripts]
		.map((absPath) => `import "/${relative(root, absPath)}";`)
		.join("\n");

	// Group islands by adapter name
	const byFramework = new Map<string, [string, IslandInfo][]>();
	for (const [name, info] of Object.entries(islands)) {
		const fw = info.adapter.name;
		if (!byFramework.has(fw)) byFramework.set(fw, []);
		byFramework.get(fw)!.push([name, info]);
	}

	let code = `import { registerIsland, registerFramework, initRuntime } from "atollic/client";\n`;
	code += `${cssFileImports}\n`;
	code += `${scriptImports}\n\n`;

	// For each framework that has islands, import its client runtime
	for (const [fwName, fwIslands] of byFramework) {
		const virtualId = `${VIRTUAL_FW_PREFIX}${fwName}`;
		code += `import { hydrateIsland as __hydrate_${fwName}, renderIsland as __render_${fwName} } from "${virtualId}";\n`;
		code += `registerFramework("${fwName}", __hydrate_${fwName}, __render_${fwName});\n\n`;

		for (const [name, info] of fwIslands) {
			const rel = `/${relative(root, info.absPath)}`;
			if (info.exportName === "default") {
				code += `  registerIsland("${name}", "${fwName}", () => import("${rel}"));\n`;
			} else {
				code += `  registerIsland("${name}", "${fwName}", () => import("${rel}").then(m => ({ default: m.${info.exportName} })));\n`;
			}
		}
	}

	code += `\ninitRuntime();\n`;
	return code;
}

/** Convert a Node IncomingMessage into a Web Request. */
function toWebRequest(req: IncomingMessage): Request {
	const url = new URL(
		req.url ?? "/",
		`http://${req.headers.host || "localhost"}`,
	);

	const headers = new Headers();
	for (const [key, value] of Object.entries(req.headers)) {
		if (!value) continue;
		if (Array.isArray(value)) {
			for (const v of value) headers.append(key, v);
		} else {
			headers.set(key, value);
		}
	}

	const init: RequestInit & { duplex?: string } = {
		method: req.method,
		headers,
	};

	if (req.method !== "GET" && req.method !== "HEAD") {
		init.body = new ReadableStream({
			start(controller) {
				req.on("data", (chunk: Buffer) => controller.enqueue(chunk));
				req.on("end", () => controller.close());
				req.on("error", (err) => controller.error(err));
			},
		});
		init.duplex = "half";
	}

	return new Request(url, init);
}

/** Build the dev-mode head tags (hydration + CSS + client entry). */
function buildDevHead(
	adapters: FrameworkAdapter[],
	cssUrls?: Set<string>,
): string {
	const parts: string[] = [];
	if (cssUrls) {
		for (const url of cssUrls) {
			parts.push(`<link rel="stylesheet" href="${url}">`);
		}
	}
	for (const adapter of adapters) {
		if (adapter.hydrationScript) {
			parts.push(adapter.hydrationScript);
		}
	}
	parts.push(`<script type="module">import "${VIRTUAL_CLIENT_ID}";</script>`);
	return parts.join("\n  ");
}

/** Collect CSS modules imported during SSR by traversing the module graph. */
function collectCssUrls(server: ViteDevServer, entry: string): Set<string> {
	const css = new Set<string>();
	const visited = new Set<string>();

	function walk(id: string) {
		if (visited.has(id)) return;
		visited.add(id);

		const mod = server.moduleGraph.getModuleById(id);
		if (!mod) return;

		if (CSS_RE.test(mod.url)) {
			css.add(mod.url);
		}

		for (const dep of mod.ssrImportedModules) {
			walk(dep.id ?? dep.url);
		}
	}

	const entryMod = server.moduleGraph.getModuleById(entry);
	if (entryMod) walk(entryMod.id ?? entryMod.url);

	return css;
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

export function atollic(options: AtollicOptions): Plugin[] {
	const adapters = options.frameworks ?? [];
	const defaultAdapter = adapters[0] as FrameworkAdapter | undefined;

	let root = "";
	const islands: Record<string, IslandInfo> = {};
	const clientScripts = new Set<string>();
	const cssImports = new Set<string>();
	let resolvedEntry = "";
	let devServer: ViteDevServer | null = null;
	let prodAssets = "";
	let islandsScanned = false;
	let cachedCssUrls: Set<string> | null = null;

	/** Resolve which adapter handles a directive. */
	function resolveAdapter(
		frameworkName: string | undefined,
	): FrameworkAdapter | undefined {
		if (!frameworkName) return defaultAdapter;
		return adapters.find((a) => a.name === frameworkName);
	}

	/** Invalidate the virtual client entry so it gets regenerated. */
	function invalidateClientEntry() {
		if (!devServer) return;
		const mod = devServer.moduleGraph.getModuleById(RESOLVED_VIRTUAL_CLIENT_ID);
		if (mod) devServer.moduleGraph.invalidateModule(mod);
	}

	function registerIsland(info: IslandInfo, islandName: string) {
		if (islands[islandName]) return;
		islands[islandName] = info;
		invalidateClientEntry();
	}

	function registerFileIslands(
		absPath: string,
		content: string,
		adapter: FrameworkAdapter,
	) {
		const fallbackName = basename(absPath, extname(absPath));
		const exports = parseComponentExports(content, fallbackName);
		for (const exp of exports) {
			registerIsland(
				{ absPath, exportName: exp.exportName, adapter },
				exp.islandName,
			);
		}
	}

	const corePlugin: Plugin = {
		name: "atollic",
		enforce: "pre",
		sharedDuringBuild: true,

		// -- Vite config --------------------------------------------------------

		config(_config, env: ConfigEnv) {
			const base: Record<string, unknown> = {
				resolve: {
					alias: {
						"atollic/client": resolve(__dirname, "client.js"),
						"atollic/jsx-runtime": resolve(__dirname, "html/jsx-runtime.js"),
						"atollic/jsx-dev-runtime": resolve(
							__dirname,
							"html/jsx-dev-runtime.js",
						),
					},
				},
				ssr: {
					noExternal: true,
				},
			};

			if (env.command === "build") {
				base.builder = {};
				base.build = {
					manifest: true,
					outDir: "dist/client",
				};
				base.environments = {
					client: {
						build: {
							rollupOptions: {
								input: { client: VIRTUAL_CLIENT_ID },
							},
						},
					},
					ssr: {
						build: {
							outDir: "dist/server",
							copyPublicDir: false,
							rollupOptions: {
								input: { app: VIRTUAL_PROD_ENTRY_ID },
								// Externalize runtime-only modules that can't be bundled
								external: ["bun"],
							},
						},
					},
				};
			}

			return base;
		},

		async buildApp(builder) {
			await builder.build(builder.environments.client);

			// Read client manifest to bake production assets into the SSR entry
			const manifestPath = resolve(root, "dist/client/.vite/manifest.json");
			const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));
			const clientEntry = manifest.client ?? manifest["virtual:atollic/client"];

			const assetParts: string[] = [];

			// Collect CSS from all manifest entries
			for (const entry of Object.values(manifest) as {
				css?: string[];
				file?: string;
			}[]) {
				if (entry.css) {
					for (const css of entry.css) {
						assetParts.push(`<link rel="stylesheet" href="/${css}">`);
					}
				}
			}

			for (const adapter of adapters) {
				if (adapter.hydrationScript) {
					assetParts.push(adapter.hydrationScript);
				}
			}

			if (clientEntry) {
				assetParts.push(
					`<script type="module" src="/${clientEntry.file}"></script>`,
				);
			}

			prodAssets = assetParts.join("\n  ");

			await builder.build(builder.environments.ssr);
		},

		async configResolved(config) {
			root = config.root;
			resolvedEntry = resolve(root, options.entry);
		},

		// -- Build: eager island discovery --------------------------------------

		async buildStart() {
			if (islandsScanned) return;
			islandsScanned = true;

			const cssRe = /import\s+['"]([^'"]+\.css)['"]/g;
			const importRe = /import\s.*?from\s+['"](\.\.?\/[^'"]+)['"]/g;
			const visited = new Set<string>();

			function processFile(file: string, content: string) {
				const directive = parseUseClientDirective(content);
				if (directive.hasDirective) {
					if (JSX_ONLY_RE.test(file)) {
						const adapter = resolveAdapter(directive.framework);
						if (adapter) {
							registerFileIslands(file, content, adapter);
						} else if (directive.framework) {
							console.warn(
								`[atollic] Unknown framework "${directive.framework}" in ${file}`,
							);
						}
					} else {
						clientScripts.add(file);
					}
				}
				for (const m of content.matchAll(cssRe)) {
					cssImports.add(m[1]);
				}
			}

			// Glob scan: discover islands inside root
			for await (const entry of glob("**/*.{ts,tsx,js,jsx}", {
				cwd: root,
				exclude: ["node_modules/**", "dist/**"],
			})) {
				const absPath = resolve(root, entry);
				visited.add(absPath);
				try {
					processFile(absPath, await readFile(absPath, "utf-8"));
				} catch {
					// File read failed, skip
				}
			}

			// Follow imports from entry to discover islands outside root
			async function scanImports(file: string) {
				if (visited.has(file)) return;
				visited.add(file);
				try {
					const content = await readFile(file, "utf-8");
					processFile(file, content);

					for (const m of content.matchAll(importRe)) {
						const raw = m[1].replace(/\.js$/, "");
						const dep = resolve(dirname(file), raw);
						for (const r of [
							dep,
							`${dep}.ts`,
							`${dep}.tsx`,
							`${dep}.js`,
							`${dep}/index.ts`,
							`${dep}/index.tsx`,
						]) {
							try {
								const depContent = await readFile(r, "utf-8");
								if (!visited.has(r)) {
									visited.add(r);
									processFile(r, depContent);
									await scanImports(r);
								}
								break;
							} catch {
								/* not this path */
							}
						}
					}
				} catch {
					/* file read failed */
				}
			}

			await scanImports(resolvedEntry);
		},

		// -- Virtual module: client entry ---------------------------------------

		resolveId(id) {
			if (id === VIRTUAL_CLIENT_ID) return RESOLVED_VIRTUAL_CLIENT_ID;
			if (id === VIRTUAL_PROD_ENTRY_ID) return RESOLVED_VIRTUAL_PROD_ENTRY_ID;

			// Virtual framework runtime modules
			if (id.startsWith(VIRTUAL_FW_PREFIX)) {
				return `\0${id}`;
			}

			// ?raw-island: resolve to the real file path (distinct module ID)
			if (id.endsWith(RAW_ISLAND_QUERY)) {
				const realPath = id.slice(0, -RAW_ISLAND_QUERY.length);
				return `${realPath}${RAW_ISLAND_QUERY}`;
			}
		},

		load(id, options) {
			if (id === RESOLVED_VIRTUAL_CLIENT_ID) {
				return generateClientEntry(islands, clientScripts, cssImports, root);
			}

			if (id === RESOLVED_VIRTUAL_PROD_ENTRY_ID) {
				const indexModule = resolve(__dirname, "index.js");
				return `import { resolve, join } from "node:path";
import { setProductionAssets } from "${indexModule}";
setProductionAssets(${JSON.stringify(prodAssets)});
import handler from "${resolvedEntry}";

const clientDir = resolve(import.meta.dirname, "..", "client");
const port = process.env.PORT || 3000;

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    const filePath = join(clientDir, url.pathname);
    if (url.pathname !== "/" && !url.pathname.endsWith("/")) {
      const file = Bun.file(filePath);
      if (await file.exists()) return new Response(file);
    }
    return handler(req);
  },
});
console.log(\`Listening on http://localhost:\${port}\`);
`;
			}

			// Virtual framework runtime modules
			if (id.startsWith("\0" + VIRTUAL_FW_PREFIX)) {
				const fwName = id.slice(("\0" + VIRTUAL_FW_PREFIX).length);
				const adapter = adapters.find((a) => a.name === fwName);
				if (adapter) return adapter.clientRuntime;
			}

			// ?raw-island: return the real component with "use client" stripped
			if (id.endsWith(RAW_ISLAND_QUERY)) {
				const realPath = id.slice(0, -RAW_ISLAND_QUERY.length);
				try {
					const content = readFileSync(realPath, "utf-8");
					return stripUseClientDirective(content);
				} catch {
					// File read failed, skip
				}
				return;
			}

			if (!options?.ssr || !ALL_SCRIPT_RE.test(id)) return;

			// "use client" directive: any file, anywhere.
			// load runs before transforms, so the stub gets the framework's SSR transform.
			try {
				const content = readFileSync(id, "utf-8");
				const directive = parseUseClientDirective(content);
				if (directive.hasDirective) {
					// Non-JSX files with "use client" are client-only scripts.
					// Register for client entry and return empty module during SSR.
					if (!JSX_ONLY_RE.test(id)) {
						clientScripts.add(id);
						invalidateClientEntry();
						return "export default {};";
					}

					const adapter = resolveAdapter(directive.framework);
					if (!adapter) {
						if (directive.framework) {
							console.warn(
								`[atollic] Unknown framework "${directive.framework}" in ${id}`,
							);
						}
						return;
					}

					const fallbackName = basename(id, extname(id));
					const fileExports = parseComponentExports(content, fallbackName);
					for (const exp of fileExports) {
						registerIsland(
							{ absPath: id, exportName: exp.exportName, adapter },
							exp.islandName,
						);
					}

					const rawImportPath = `${id}${RAW_ISLAND_QUERY}`;
					return adapter.ssrStub(rawImportPath, fileExports);
				}
			} catch {
				// File read failed, skip
			}
		},

		// -- Dev server middleware -----------------------------------------------

		configureServer(server: ViteDevServer) {
			devServer = server;

			// Use pre-middleware so we run BEFORE Vite's SPA fallback.
			// Vite asset/module requests are let through via the URL check.
			server.middlewares.use(async (req, res, next) => {
				const url = req.url || "";

				// Let Vite handle its own requests (assets, modules, HMR).
				if (
					url.startsWith("/@") ||
					url.startsWith("/node_modules") ||
					url.startsWith("/__") ||
					/\.\w+($|\?)/.test(url)
				) {
					return next();
				}

				try {
					const mod = await server.ssrLoadModule(resolvedEntry);
					const handler = mod.default ?? mod.handler;

					if (typeof handler !== "function") {
						console.error(
							"[atollic] Entry must default-export a fetch function: (req: Request) => Response",
						);
						return next();
					}

					const webReq = toWebRequest(req);
					const response: Response = await handler(webReq);

					if (response.status === 404) return next();

					let body = await response.text();
					let ct = response.headers.get("content-type") || "";

					// Extract HTML from SSR object format ({t:"<html>"} or arrays)
					if (ct.includes("application/json")) {
						try {
							const parsed = JSON.parse(body);
							const extracted = extractHtml(parsed);
							if (extracted) {
								body = extracted;
								ct = "";
							}
						} catch {
							// Not valid JSON, continue as-is
						}
					}

					const isDoc = isHtmlDocument(body);
					if (!ct.includes("text/html") && isDoc) {
						ct = "text/html; charset=utf-8";
					}

					if (isDoc) {
						body = ensureDoctype(body);
					}

					if (ct.includes("text/html")) {
						if (!cachedCssUrls) {
							cachedCssUrls = collectCssUrls(server, resolvedEntry);
						}
						body = injectHead(body, buildDevHead(adapters, cachedCssUrls));
						body = await server.transformIndexHtml(url, body);
					}

					const headers: Record<string, string> = {};
					for (const [key, value] of response.headers) {
						headers[key] = value;
					}
					if (ct) headers["content-type"] = ct;
					else if (!headers["content-type"])
						headers["content-type"] = "text/html; charset=utf-8";
					res.writeHead(response.status, headers);
					res.end(body);
				} catch (err: unknown) {
					if (err instanceof Error) server.ssrFixStacktrace(err);
					console.error("[atollic]", err);
					next(err);
				}
			});
		},

		// -- HMR: notify client on server-file changes --------------------------

		handleHotUpdate({ file, server }) {
			// Invalidate CSS cache when any file changes (CSS deps may shift)
			cachedCssUrls = null;

			if (!file.endsWith(".ts") && !file.endsWith(".tsx")) return;

			// Island ("use client") files → let framework HMR handle it.
			try {
				if (parseUseClientDirective(readFileSync(file, "utf-8")).hasDirective)
					return;
			} catch {
				// File read failed, treat as server file
			}

			// Server-side file changed → tell client to refetch + morph.
			const mods = server.moduleGraph.getModulesByFile(file);
			if (mods) {
				for (const mod of mods) server.moduleGraph.invalidateModule(mod);
			}

			server.ws.send({ type: "custom", event: HMR_RELOAD_EVENT });
			return []; // Suppress default client-side HMR.
		},
	};

	// Pre-transform plugin: compile non-framework JSX before framework plugins
	// see it. This lets us skip the `include` option on framework plugins —
	// files without a framework pragma get transformed here via esbuild, so
	// framework transforms (e.g. vite-plugin-solid) find no JSX left.
	const jsxPragmaRe = /@jsxImportSource\s+(\S+)/;
	const preTransformPlugin: Plugin = {
		name: "atollic:jsx-pre-transform",
		enforce: "pre",
		async transform(code, id) {
			if (!/\.[jt]sx$/.test(id)) return;
			// If file has a framework pragma, let that framework's plugin handle it
			const match = code.match(jsxPragmaRe);
			if (match) {
				const source = match[1];
				// Check if any adapter owns this import source (e.g. "solid-js")
				for (const adapter of adapters) {
					if (source.includes(adapter.name)) return;
				}
			}
			// No framework pragma — pre-compile JSX with esbuild using our runtime
			const result = await (transformWithOxc as any)(code, id, {
				jsx: { runtime: "automatic", importSource: "atollic" },
			});
			return { code: result.code, map: result.map };
		},
	};

	// Gather all framework Vite plugins
	const frameworkPlugins: Plugin[] = [];
	for (const adapter of adapters) {
		if (adapter.plugins) {
			frameworkPlugins.push(...adapter.plugins());
		}
	}

	return [preTransformPlugin, ...frameworkPlugins, corePlugin];
}
