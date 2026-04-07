# atollic

## 0.0.4

### Patch Changes

- [#4](https://github.com/awilderink/atollic/pull/4) [`784f12a`](https://github.com/awilderink/atollic/commit/784f12aea37d6b1f69d544493307642a8568c505) Thanks [@awilderink](https://github.com/awilderink)! - Fix `dev:elysia` and `dev:hono` scripts to run from inside the example
  directory. Vite's `--config` flag defaults `root` to the current working
  directory, which broke entry resolution when running from the repo root.
