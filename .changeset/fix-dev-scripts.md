---
"atollic": patch
---

Fix `dev:elysia` and `dev:hono` scripts to run from inside the example
directory. Vite's `--config` flag defaults `root` to the current working
directory, which broke entry resolution when running from the repo root.
