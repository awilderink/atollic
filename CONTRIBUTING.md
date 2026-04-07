# Contributing to atollic

Thanks for your interest in contributing! atollic is pre-1.0 and the API is still
evolving, so small fixes and focused PRs are especially welcome.

## Development setup

Requirements: [Bun](https://bun.sh) (used for the dev server and install).

```bash
git clone https://github.com/awilderink/atollic.git
cd atollic
bun install
```

### Running the examples

Two reference servers live under `examples/`:

```bash
bun run dev:elysia   # http://localhost:5173 — Elysia server
bun run dev:hono     # http://localhost:5173 — Hono server
```

Edit files in `src/` and the example — both should hot-reload.

## Checks before opening a PR

```bash
bun run typecheck    # TS across lib + both examples
bun run lint         # Biome lint
bun run check        # Biome lint + format with auto-fix
bun run build        # Vite library build + tsc declarations
```

CI runs typecheck, lint, and build on every PR.

## Releases and Changesets

atollic uses [Changesets](https://github.com/changesets/changesets) to manage
versions and changelogs.

If your change should be released to users (bug fix, new feature, breaking
change), add a changeset **in the same PR**:

```bash
bun run changeset
```

- Pick the bump type: `patch` for fixes, `minor` for new features, `major` for
  breaking changes.
- Write a short, user-facing summary (what changed and why — not the diff).
- Commit the generated file under `.changeset/`.

If your change is internal only (docs, CI, refactor without API impact), no
changeset is needed — just tick the "internal-only" box in the PR template.

### How the release actually happens

1. You merge a PR with a changeset.
2. The `Release` workflow opens (or updates) a `chore: version packages` PR
   that bumps the version, regenerates `CHANGELOG.md`, and deletes the
   changeset file.
3. A maintainer reviews and merges that PR.
4. The same workflow then publishes the new version to npm with provenance
   and creates a GitHub release.

Maintainers don't run `npm publish` by hand.

## Code style

- **Biome** — tabs, double quotes, organize imports (config in `biome.json`).
- **TypeScript** — strict. No `any` in new code unless strictly necessary.
- **JSX** — the repo uses atollic's own HTML JSX runtime for the lib, and
  `solid-js` for the Solid adapter. Don't mix runtimes in a single file.
- **Commits** — conventional-commits style preferred (`feat:`, `fix:`,
  `chore:`, `docs:`, `refactor:`) but not enforced.

## Reporting bugs

Open an issue using the "Bug report" template. Bugs without a minimal
reproduction are hard to act on and may be closed.

## Asking questions

Use [GitHub Discussions](https://github.com/awilderink/atollic/discussions)
for questions, ideas, and show-and-tell. The issue tracker is for actionable
bugs and feature requests.
