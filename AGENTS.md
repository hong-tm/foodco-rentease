# AGENTS.md

Rental management site: pnpm workspace with `fc-back` (Hono/TypeScript API) and `fc-front` (React + Vite + Tailwind).

---

# Agent workflow (four beats)

四拍流程（isolate → build → prove → ship）、配套技能、多 agent 规矩与公开评论的署名规则都写在
`/root/.agents/reference/repo-workflow.md`，动手前读它。本仓库自己的部分只有下面两节。

Checks for this repo:

```bash
pnpm -C fc-back build        # tsc -> dist
pnpm -C fc-front build       # vite build
pnpm -C fc-front knip        # dead-code / unused-dependency check
pnpm -C fc-back check        # prettier --write (rewrites, run before committing)
```

Hard invariants:

- There is no automated test suite yet; a UI change needs before/after screenshots as its proof.
- Formatting is prettier's call: run `pnpm -C fc-front check` / `-C fc-back check` before committing.
