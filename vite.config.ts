import { resolve } from "node:path";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

/**
 * Vite replaces `import.meta.hot` with `undefined` in production builds,
 * which tree-shakes the entire HMR block from client.ts.
 * Since the client runtime runs inside the consumer's Vite dev server
 * (where `import.meta.hot` IS available), we need to preserve it.
 */
function preserveImportMetaHot(): Plugin {
	const PLACEHOLDER = "__CAYE_IMPORT_META_HOT__";
	return {
		name: "preserve-import-meta-hot",
		enforce: "pre",
		transform(code, id) {
			if (!id.includes("client")) return;
			return code.replaceAll("import.meta.hot", PLACEHOLDER);
		},
		renderChunk(code) {
			return code.replaceAll(PLACEHOLDER, "import.meta.hot");
		},
	};
}

export default defineConfig({
	plugins: [preserveImportMetaHot()],
	esbuild: {
		jsx: "automatic",
		jsxImportSource: "atollic",
	},
	resolve: {
		alias: {
			"atollic/jsx-runtime": resolve(__dirname, "src/html/jsx-runtime.ts"),
			"atollic/jsx-dev-runtime": resolve(
				__dirname,
				"src/html/jsx-dev-runtime.ts",
			),
		},
	},
	build: {
		lib: {
			entry: {
				index: "src/index.ts",
				vite: "src/vite.ts",
				client: "src/client.ts",
				head: "src/head.tsx",
				adapter: "src/adapter.ts",
				"adapters/solid": "src/adapters/solid.ts",
				"servers/elysia": "src/servers/elysia.ts",
				"servers/hono": "src/servers/hono.ts",
				"html/jsx-runtime": "src/html/jsx-runtime.ts",
				"html/jsx-dev-runtime": "src/html/jsx-dev-runtime.ts",
				"html/types": "src/html/types.ts",
				"html/index": "src/html/index.ts",
			},
			formats: ["es"],
		},
		rollupOptions: {
			external: [
				"idiomorph",
				"elysia",
				"solid-js",
				"solid-js/web",
				"preact",
				"preact/hooks",
				"preact-render-to-string",
				"react",
				"react-dom",
				"react-dom/server",
				"react-dom/client",
				"vite",
				"vite-plugin-solid",
				"hono",
				"@preact/preset-vite",
				"@vitejs/plugin-react",
				/^node:/,
			],
		},
		outDir: "dist",
		emptyOutDir: true,
	},
});
