# AGENTS.md

Rental management site with two separately installed packages: `fc-back` (Hono/TypeScript API) and `fc-front` (React + Vite + Tailwind). Each package is its own install root with its own `pnpm-lock.yaml`, and there is no root `package.json`; run installs and scripts per package with `pnpm -C fc-back …` / `pnpm -C fc-front …`.

写或改 `fc-front` 的 HTML/CSS/客户端 JS 前，先用 `modern-web-guidance` 技能检索对应的现代 web 平台做法（模态/表单/动画/无障碍/性能等），再动手写代码；用了就在交付说明里提一句。技能在 `.agents/skills/modern-web-guidance`（软链自 `/root/.agents/skills-shared/modern-web-guidance`）；更新走共享仓 `git pull`，别跑 `npx skills add`（会把软链换回实体拷贝）。写或改 UI 前另读根目录 `DESIGN.md`——你的 taste 规则与参照都在里面。

---

# Agent workflow (four beats)

Adapted from the michaelshimeles/skills AGENTS.md (commit 4b72f46).

1. **Isolate.** Start every change from a new branch off `origin/main` (or keep the worktree already assigned to the task). Never build on `main`, and never reuse or modify another agent's worktree, branch, or uncommitted work.
2. **Build.** Follow the existing architecture of the package you change; make the smallest change that meets the goal.
3. **Prove.** Run the checks below. For changed runtime behavior, record the failure before fixing it and the success after. For documentation, inspect the changed text and verify runnable examples and links where applicable.
4. **Ship.** Open a PR with evidence appropriate to the change: before/after screenshots for UI changes, command output pairs for CLI changes. A request for a plan, review, or local experiment does not imply publishing.

Checks for this repo (all wired in CI; run the full set before a PR):

```bash
pnpm -C fc-back build               # tsc -> dist
pnpm -C fc-back check               # prettier --write (rewrites, run before committing)
node scripts/check-design.mjs        # taste-rule lint (report-only, never rewrites code)
pnpm -C fc-front typecheck          # tsc --noEmit (vite build does NOT typecheck)
pnpm -C fc-front lint               # oxlint
pnpm -C fc-front build              # vite build -> ../fc-back/webpage
pnpm -C fc-front check:keyframes    # every used --animate-* token keeps its keyframes
pnpm -C fc-front knip               # dead files / unused deps (symbol rules are off; scoped via fc-front/knip.json)
pnpm -C fc-front check              # prettier --write (rewrites, run before committing)
```

Fresh worktree gotcha: fc-front's tsc reads types from ../fc-back, so install BOTH packages
(`pnpm -C fc-back install && pnpm -C fc-front install`) before typechecking, or tsc fails on
every fc-back import.

Hard invariants:

- There is no automated test suite yet; a UI change needs before/after screenshots as its proof.
- Behavior changes are proven on the running app with `.agents/skills/verify-foodco` (own Postgres + seed, Playwright journeys that check the API call and the DB row). A toast or a passing typecheck is not proof.
- Formatting is prettier's call: run `pnpm -C fc-front check` / `-C fc-back check` before committing.
- UI 改动的验收在真实渲染面上做：先有种子数据，agent 自己截图并看过；只审代码不算验收。
