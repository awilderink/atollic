import { defineConfig } from "vite";
import { react } from "../../src/adapters/react.js";
import { solid } from "../../src/adapters/solid.js";
import { atollic } from "../../src/vite.js";

export default defineConfig({
	plugins: [
		atollic({
			entry: "./app.tsx",
			frameworks: [solid(), react()],
		}),
	],
});
