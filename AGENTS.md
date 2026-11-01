# AGENTS.md

Rental management site with two separately installed packages: `fc-back` (Hono/TypeScript API) and `fc-front` (React + Vite + Tailwind). Each package is its own install root with its own `pnpm-lock.yaml`, and there is no root `package.json`; run installs and scripts per package with `pnpm -C fc-back …` / `pnpm -C fc-front …`.

---

# Agent workflow (four beats)

Adapted from the michaelshimeles/skills AGENTS.md (commit 4b72f46).

1. **Isolate.** Start every change from a new branch off `origin/main` (or keep the worktree already assigned to the task). Never build on `main`, and never reuse or modify another agent's worktree, branch, or uncommitted work.
2. **Build.** Follow the existing architecture of the package you change; make the smallest change that meets the goal.
3. **Prove.** Run the checks below. For changed runtime behavior, record the failure before fixing it and the success after. For documentation, inspect the changed text and verify runnable examples and links where applicable.
4. **Ship.** Open a PR with evidence appropriate to the change: before/after screenshots for UI changes, command output pairs for CLI changes. A request for a plan, review, or local experiment does not imply publishing.

Checks for this repo:

```bash
pnpm -C fc-back build        # tsc -> dist
pnpm -C fc-front build       # vite build
pnpm -C fc-front knip        # dead-code / unused-dependency check
pnpm -C fc-back check        # prettier --write (rewrites, run before committing)
pnpm -C fc-front check       # prettier --write (rewrites, run before committing)
```

Hard invariants:

- There is no automated test suite yet; a UI change needs before/after screenshots as its proof.
- Formatting is prettier's call: run `pnpm -C fc-front check` / `-C fc-back check` before committing.
