# AGENTS.md

Rental management site: pnpm workspace with `fc-back` (Hono/TypeScript API) and `fc-front` (React + Vite + Tailwind).

写或改 `fc-front` 的 HTML/CSS/客户端 JS 前，先用 `modern-web-guidance` 技能检索对应的现代 web 平台做法（模态/表单/动画/无障碍/性能等），再动手写代码；用了就在交付说明里提一句。技能在 `.agents/skills/modern-web-guidance`（软链自 `/root/.agents/skills-shared/modern-web-guidance`）；更新走共享仓 `git pull`，别跑 `npx skills add`（会把软链换回实体拷贝）。写或改 UI 前另读根目录 `DESIGN.md`——你的 taste 规则与参照都在里面。

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
node scripts/check-design.mjs # taste-rule lint（报告模式，不改代码）
```

Hard invariants:

- There is no automated test suite yet; a UI change needs before/after screenshots as its proof.
- Formatting is prettier's call: run `pnpm -C fc-front check` / `-C fc-back check` before committing.
- UI 改动的验收在真实渲染面上做：先有种子数据，agent 自己截图并看过；只审代码不算验收。<!-- 2026-11-12: 「用 seed db 注入一点虚拟数据吧，我没看出两个版本有什么一样的」「你要自己截图看看」 -->
