# atollic

## 0.0.5

### Patch Changes

- [`97cd69a`](https://github.com/awilderink/atollic/commit/97cd69a47ca1a7254ba1facc28bc64e05be29f5d) Thanks [@awilderink](https://github.com/awilderink)! - Add Atollic logo and capitalize brand name in README. Logo is now displayed at the top of the README and on the npm package page via an absolute raw.githubusercontent URL.

## 0.0.4

### Patch Changes

- [#4](https://github.com/awilderink/atollic/pull/4) [`784f12a`](https://github.com/awilderink/atollic/commit/784f12aea37d6b1f69d544493307642a8568c505) Thanks [@awilderink](https://github.com/awilderink)! - Fix `dev:elysia` and `dev:hono` scripts to run from inside the example
  directory. Vite's `--config` flag defaults `root` to the current working
  directory, which broke entry resolution when running from the repo root.
