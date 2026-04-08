import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./e2e",
	timeout: 30_000,
	fullyParallel: true,
	retries: 0,
	reporter: "list",
	use: {
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "elysia",
			use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5173" },
		},
		{
			name: "hono",
			use: { ...devices["Desktop Chrome"], baseURL: "http://localhost:5174" },
		},
	],
	webServer: [
		{
			command: "bunx --bun vite --port 5173",
			cwd: "examples/elysia",
			port: 5173,
			reuseExistingServer: true,
		},
		{
			command: "bunx --bun vite --port 5174",
			cwd: "examples/hono",
			port: 5174,
			reuseExistingServer: true,
		},
	],
});
