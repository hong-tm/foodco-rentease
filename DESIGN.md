# DESIGN — FoodCo RentEase

先看图，再读字。`docs/design/anchor/` 里的截图就是规格：新改动和它对不上、又不在本次 PR 说明的改动范围内，就是 bug。下面的文字只解释截图里的数值和规则；文字与截图冲突时以截图为准，并在同一个 PR 里修正文字。

规则分两层：**Taste rules** 全部来自 Yihong 的原话纠正（日期与原话在条目注释里，learn-taste 2026-11-12 采集）；**Inspirations** 是参照物，不是规则，违反它不算错。与 glue-system/DESIGN.md 共用的规则两边各留一份。

## Anchor

起点是版本 E（`a6c23bd` / `35ea6d8`，2026-11 他认可的那一版）：靛蓝 268 单一品牌色、冷中性 265、环形座次板、租户跟进板。之后几轮越改越差，原因是三件事叠加：分支没从 E 往下走；本文件旧版写着「橙色签名色」与 E 矛盾，两轮 agent 互相推翻；评审读 diff 不看像素，删掉了跟进板这类页面锚点。

| 截图 | 页面锚点元素 |
|---|---|
| [overview](docs/design/anchor/overview.webp) · [dark](docs/design/anchor/overview-dark.webp) · [390](docs/design/anchor/overview-mobile.webp) | 环形座次板（7/6/7，中间是占用率陈述） |
| [availability](docs/design/anchor/availability.webp) | 座次板 + Free 列表 |
| [tenants](docs/design/anchor/tenants.webp) | 跟进板 + 表格 |
| [feedback](docs/design/anchor/feedback.webp) | 评论列表 + 评分分布 + 按铺位排序 |
| [your-stalls](docs/design/anchor/your-stalls.webp) · [390](docs/design/anchor/your-stalls-mobile.webp) | 租期轨道（起止日期 + 剩余天数） |
| [utilities](docs/design/anchor/utilities.webp) | 账单矩阵（每铺位一行，租金/电/水三格） |
| [appointments](docs/design/anchor/appointments.webp) | 日期方块列表 + 行内付款按钮 |

每页只有一个锚点元素，它是这页的身份。为了满足某条规则去删或换锚点元素，先问。

### Tokens（`fc-front/src/index.css`）

改色只改这里；页面里不写颜色值。

| token | light | dark |
|---|---|---|
| `--brand`（= primary） | `oklch(0.5 0.13 268)` | `oklch(0.72 0.11 268)` |
| `--background` | `oklch(0.985 0.002 265)` | `oklch(0.15 0.004 265)` |
| `--card` | `oklch(1 0 0)` | `oklch(0.18 0.004 265)` |
| `--sidebar` | `oklch(0.975 0.002 265)` | `oklch(0.135 0.004 265)` |
| `--muted` | `oklch(0.955 0.003 265)` | `oklch(0.235 0.005 265)` |
| `--muted-foreground` | `oklch(0.49 0.012 265)` | `oklch(0.72 0.008 265)` |
| `--border` | `oklch(0.92 0.004 265)` | `oklch(0.27 0.005 265)` |
| `--brand-soft` / `--brand-ink` | `color-mix(in oklab, …)` 派生自 `--brand` | 同左 |
| `--chart-2` / `--chart-3` | `oklch(0.62 0.09 215)` / `oklch(0.74 0.11 75)` | `oklch(0.72 0.09 215)` / `oklch(0.82 0.11 80)` |
| `--radius` | `0.625rem` | 同左 |

品牌色相只有 268。品牌色只出现在：primary 按钮、选中导航、当月柱、follow-up 铺位、focus ring。中性色相固定 265，不向品牌色靠（「neutrals warmed toward the brand」就是米色站的来源）。

### Layout 数值

- 内容区 `max-w-7xl`，左右 `px-4 md:px-8`；页内间距 `gap-4 md:gap-5`；Panel 内边距 `p-4 md:p-5`。
- Overview 网格 `md:grid-cols-2 xl:grid-cols-[1fr_1fr_384px]`；Availability `xl:grid-cols-[1fr_360px]`。
- 页头 = breadcrumb → h1 → 一句数据结论（不是功能描述）→ 至多两个动作，主动作在右。
- 列表行优先于宽表：铺位方块 / 日期方块 + 两行文字 + 右侧金额或动作。

### 证据与改动预算

- UI PR 附锚点截图同页的新截图：1440 与 390、亮与暗，密集种子（`.agents/skills/verify-foodco`）。评审比像素，不比 diff 条目。
- 一个 PR 只重排一页；其他页只允许动 token。改了锚点页，同 PR 更新 `docs/design/anchor/` 里的图。
- 已知坑：图表在 Redact 下要 `isAnimationActive={false}`；SVG 属性（`textAnchor`、`fontSize` 等）靠 `fc-front/patches/@tanstack__redact@0.3.1.patch` 转成连字符，升级 Redact 时先确认上游修了再删补丁。

## 目标

- **交付线是 modern / premium / 眼前一亮；补齐式小改不算设计完成。**
  Why: 信息结构改好和页面变好看是两个验收项；补课式优化读作循规蹈矩。
  <!-- 2026-11-06: 「审美可能还是不太行，不是很modern和premium的界面」; 2026-11-01: 「页面其实并没有变得更好看」 -->

## Design system

- **组件一律用 shadcn 体系的现成件；不自搓替代品，不绕开体系直写。**
  Why: 擅自改或自搓让整套 design system 失效，页面失去协调。
  <!-- 2026-11-01: 「我用的 shadcn/ui 是有一套 design system 的，要在它的基础上来改，而不是强行去改」; 2026-11-11: 「undo button 也很差，不是shadcn吗？」 -->
- **字号用命名 type 角色；品牌色只有一个 main color（--brand）再派生；圆角、宽度走共享 token。调用处不写任意值。**
  Why: 硬写大小和颜色让全站不协调、显粗糙；缺的刻度以命名 token 扩进系统，不在单页内联任意值。
  <!-- 2026-11-03: 「应该要用 Shadcn 的定制的字来固定，而不是 hardcode 这些大小进去。Brand color 这些可以 set 一个 main color 在 CSS 里面做」; 2026-11-02: 「感覺好像是沒有遵守套 CSS…硬寫下去的…比較粗糙」 -->

## Surfaces

- **卡片、表格外壳等结构线用全不透明 `border-border`，不用 `/40`–`/80` 淡化。**
  Why: 淡化的框感弱、发虚。
  <!-- 2026-11-02: 「卡片元素的框，透明度算太高了」 -->
- **圆角沿用 app 既有 radius token，不用 `rounded-[2px]` 一类方形风局部值。**
  Why: 本 app 是圆角体系，混入方形读作硬写。
  <!-- 2026-11-02: 「有些你看你用的是正方形…應該是你硬寫下去的」 -->

## Color

- **不做全站单色：图表 series、状态色保留语义色，中性只做底。主要操作用品牌靛蓝（见 Anchor › Tokens）。**
  Why: 全灰单调；数据面需要颜色。
  <!-- 2026-11-02: 「你把 dashboard 改得太無色了，只剩 monochrome 了，這不太行」 -->
- **暗色模式单独过一遍对比度；亮色调完不算完。**
  Why: 同一组值在暗底下会不够明显。
  <!-- 2026-11-11（glue，跨仓）: 「在黑暗模式下看着不明显，对比度或者颜色不够」 -->

## Typography

- **`font-mono` 只给 ID / UUID / 参考码；标签、值、姓名、按钮用无衬线。**
  Why: mono 用散了协调性差。
  <!-- 2026-11-02: 「字體好像用得又不一樣，協調性不太夠」 -->
- **仪表盘标题保持在 24-32px 及以下。**
  <!-- 2026-11 设计决定: 仪表盘标题保持在 24-32px 及以下 -->

## Layout

- **breadcrumb、h1、正文内容、表格共用同一条左缘对齐轨（同一 x）；表内单元格逐列对齐。**
  Why: 对齐是他第一眼检查的东西，11 月三次重提。
  <!-- 2026-11-02: 「水平、跟上面的breadcrub 都是没对齐的」「表格里面的内容其实也没有对齐」; 2026-11-11: 「upcoming 的应该是align 上面的」 -->
- **表单/表格默认舒展；要压密度换「精致」先问。**
  Why: *inferred:* 压小挤窄不换可读性（他当时也不确定压法是否更好）。
  <!-- 2026-11-02: 「把 New Charge 的 table 做這麼小、輸入 table 做這麼擠進來，是有變得更好嗎？我也不太確定」 -->

## Interaction

- **破坏性操作立即执行 + 5 秒倒计时环 undo toast（Gmail 模式）；圆环走完才算真删。确认框退役。**
  Why: 业界通用逻辑；圆环走完承载「真删」的语义。
  <!-- 2026-11-11: 「点了删除，它就应该马上给删除了…像 Gmail 那样弹出一个提醒，5 秒内可以撤销这个动作」 -->
- **同一交互模式（undo、乐观更新）要铺到全站同类动作；点状示范不算完成。**
  Why: *inferred:* 半途的模式让用户建立错误预期。
  <!-- 2026-11-11（glue，跨仓）: 「除了删除的这一项，应该还有别的地方可以应用上吧？」 -->
- **高频控件贴近它影响的区域（如侧栏开关在侧栏旁），不为版式挪到远处。**
  Why: 用户不该跑很远才点得到。
  <!-- 2026-11-02: 「你怎麼把開關 sidebars 的東西移到了右邊？…用戶要到很遠很遠的地方才能點到它」 -->
- **换底层实现（如 hotkeys 替换 cmdk）时 UI 保持原样，视觉零变化。**
  Why: *inferred:* 用户对界面的记忆不该被重构打断。
  <!-- 2026-11-08: 「用的是hotkey 替换底层，但是ui 还要保持」 -->
- **渐进披露（open the full list / +N more）是已确认的正确方向，保持。**
  <!-- 2026-11-02: 「open the full list、加了 show more，這些肯定是變好了」 -->

## Inspirations

参照物，不是规则；与本项目 design system 冲突时以 shadcn token 与上面的规则为准。

产品参照（agent 提名，可换）：

- **Stripe** — 表单、数据表、状态色的用法
- **Airbnb** — 卡片与多层软阴影；同为租赁域
- **Linear** — 列表密度与克制

工艺底线数值（172 源语料提取的共识默认值，未整包盲测）：

| 维度 | 默认值 |
|---|---|
| 网格 | 4pt 间距网格 |
| 字号 | 全站最多 6 档（本项目标题档以 24-32px 约定为准） |
| 字排 | 大标题负字距 -2%~-3%；大字行高 110-120%；单字族优先 |
| 表面 | 中性表面阶梯 ≥4 层 + 1-2 层边框（暗色明度差 4-6%）；每个组件组一个 accent；语义色只给状态 |
| 状态 | 交互组件四态完整；状态变化用微动画确认 |
| 阴影 | 亮色多层软阴影（常见三层）；暗色靠表面明度与边框，不靠阴影 |
| 触控 | 小控件命中区 ≥44px |
| 对比 | 图形/图标 ≥3:1（文本按 WCAG 文本档） |

外部文章：

- How Stripe, Linear, and Vercel Ship Premium UI — https://mantlr.com/blog/stripe-linear-vercel-premium-ui
- Linear vs Vercel: two approaches to minimal motion — https://www.designmd.co/blog/linear-vs-vercel-motion
- Best Dashboard Designs in 2026 — https://www.designrush.com/agency/ui-ux-design/dashboard/trends/best-dashboard-design

他提供的 18 张参照（2026-11-12，Mobbin/Dribbble，启发不是照抄，他的原话「不是让你照抄而是要给你一些启发的 idea」）：完整逐图分析在 [`DESIGN-references.md`](DESIGN-references.md)。与本仓（表格/表单密集的业务站）最相关的手法：

- 双行复合单元格（姓名+职位、日期+年龄、绝对值+括号占比、金额+币种）压缩宽表，不做横向滚动
- 表头前置字段类型微图标；进度条与百分比同列共生；行内迷你圆环进度
- 非活跃行整行静默降权（姓名下补小字 + 整行变暗灰），不加刺眼红标签列
- 行展开 = 迷你面板（左色条指标 + 分段条 + 键值档案）替代跳页；上下双表夹移动按钮的穿梭分配器
- 状态统计卡兼作表格筛选 Tab；列表按相对时间分组（YESTERDAY / LAST WEEK）读起来像动态流
- 行尾平铺高频操作微按钮；筛选按钮内联键值标签（`Status: None v`）
