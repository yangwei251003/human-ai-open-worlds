# System Blueprint

> Blueprint version：1.1
> Last updated：2026-08-29
> Status：Approved
> Authority：技术边界、领域模型、状态、静态导出约束与非功能要求。

## 系统边界

- 客户端/平台：现代桌面与移动浏览器；静态托管。
- 服务与存储：首版无后端、数据库、认证、Cookie 或请求期状态；内容来自 TypeScript 数据文件。
- 第三方：首版运行时不依赖第三方媒体或 API；未来真实链接由用户提供。
- 信任边界：仓库内容在构建期进入静态文件；任何未来外链均为离站边界并需 `rel` 安全属性。

## 技术决策

- Next.js 16 App Router + React 19 + TypeScript。
- `output: "export"`、`trailingSlash: true`、图片静态导出兼容配置。
- Tailwind CSS v4 负责基础与响应式；页面级 CSS Module/CSS 变量负责七套艺术语言。
- R3F 9 + Three.js WebGL2 + Drei 构成持久单 Canvas；场景按路由动态导入，WebGPU 只留隔离实验开关。
- GSAP/ScrollTrigger 负责滚动、长时间线和 3D；Lenis 接入 GSAP ticker 形成单滚动权威；Motion 只进入局部组件。
- 单一根布局；页面包装层切换主题，避免多个根布局导致整页加载。
- 页面独立 metadata；`sitemap.ts`、`robots.ts` 静态生成。
- 不启用实验性 Next/React ViewTransition；导航不依赖浏览器 View Transition API。

## 运行时拓扑

`app/layout.tsx`（Server：SEO、导航、DOM 内容）→ `ExperienceHost.client.tsx`（路由/输入/质量/生命周期）→ 动态加载 `CanvasRuntime.client.tsx`（`ssr:false`）→ 单一 Canvas 内的 `RouteSceneBoundary`。

- `usePathname`、`window`、`document`、GPU 能力检测只存在于 Client 边界/effect。
- DOM 与 WebGL 共享标准化路由/选中状态，不共享具体渲染对象；Canvas 从不成为信息事实源。
- Lenis 向 ScrollTrigger 发布滚动；GSAP ticker 驱动 Lenis；R3F `useFrame` 读取 ref/store，循环内不 setState 或分配对象。
- 场景遵守 `mount/preload/enter/pause/resume/exit/dispose`；geometry、material、texture、renderTarget、video 与监听器显式释放。
- 画质管理只调整 DPR、纹理、粒子、阴影、LOD 和后处理；桌面/触摸用独立镜头构图与节奏。

## 领域模型与状态机

| 实体 | 关键字段 | 状态 | 允许迁移 | 不变量 | 保留/删除策略 |
|---|---|---|---|---|---|
| Person | name/title/tagline/bio/contact/education | placeholder/real | placeholder→real | 不伪造姓名、学校、联系方式 | Git 管理 |
| Asset | id/kind/src/alt/ratio/replaceKey/credits | placeholder/ai-generated/real/private | placeholder→ai-generated→real；任意→private | 状态与 alt 必填；private 不渲染 | Git 管理，用户替换 |
| Project | id/type/problem/role/aiRole/features/stack/result/links | draft/featured/published | draft→published；published↔featured | 本人贡献与 AI 贡献分开 | Git 管理 |
| Honor | id/organizer/level/rank/date/evidence/reflection | placeholder/verified | placeholder→verified | 无证据时不得写 verified | Git 管理 |
| Experience | period/title/organization/owned/result/relatedIds | placeholder/real | placeholder→real | 时间顺序稳定 | Git 管理 |
| Post | id/date/tags/summary/body/relatedIds | seed/draft/published | seed→draft→published | 未完成内容显式标草稿 | Git 管理 |
| Video | id/duration/poster/transcript/chapters/relatedIds | placeholder/ready | placeholder→ready | 不自动播放有声；文字稿字段存在 | Git 管理 |
| Photo | id/date/place/collection/alt/note/privacy | placeholder/real/private | placeholder→real；任意→private | private 不进入导出 | Git 管理 |

## 动作闭环

| ID | 权限 | 状态变化 | 数据 | API/事件 | 错误恢复 | 异步/第三方 | 监控 | 测试 |
|---|---|---|---|---|---|---|---|---|
| ACT-001 | public | 路由变化 | world registry | local-only | 404 返回入口 | 无 | 客户端错误 | E2E |
| ACT-002/005/007 | public | 客户端筛选状态 | 对应数组 | local-only | 空结果 + 清除 | 无 | 无 | unit/E2E |
| ACT-003/006/007 | public | 选中项/对话框状态 | 对应实体 | local-only | Esc/关闭/焦点恢复 | 无 | console error | E2E |
| ACT-004 | public | 浏览器打印流程 | Person/Experience | `window.print()` | 浏览器取消即返回 | 系统打印 | 无 | manual |
| ACT-008 | public | 离站/邮件客户端 | Person.links | `mailto:`/external | 占位时不激活 | 外部应用 | 无 | manual |

## 静态导出约束

- 禁止 Server Actions、Cookies、Headers、ISR、Middleware、请求期重写/重定向和未枚举动态路由。
- 若加入博客动态 slug，必须 `generateStaticParams()` 且 `dynamicParams = false`。
- 所有运行时媒体引用必须为本地相对路径或用户确认的真实 URL；首版占位使用 CSS/SVG 组件。
- 生产域名未知时集中在 `siteConfig.url`；上线前是 release blocker，但不阻塞本地开发。

## 非功能约束

- 构建：lint、TypeScript、生产构建通过并产生七页静态 HTML。
- 性能：DOM 不等待 Canvas；场景路由拆包；全站一个 WebGL context；移动初始 DPR 1–1.25、自适应上限约 1.5；首个 3D 资源目标约 ≤2MB，活动场景约 ≤300k 可见三角/≤100 draw calls，均以真机校准。
- 性能目标：Core Web Vitals 目标 LCP≤2.5s、INP≤200ms、CLS≤0.1；桌面 50–60fps，中端移动至少约 30fps 可操作，低于约 45fps 时逐项调低不可感知成本。
- 可访问性：WCAG 2.2 AA 作为目标；键盘、焦点、对比、reduced motion、字幕/文字稿、alt。
- 可靠性：无后端依赖；所有空内容有设计态；直接刷新深层 URL 可由静态服务器正确解析。
- 安全/隐私：不提交真实秘密；个人照片可标记 private；外链使用 `noopener noreferrer`。
- 兼容性：主测 Chromium；补充 Firefox/WebKit/iOS Safari/Android Chrome；WebGL2 关闭或 context loss 时 DOM 功能完整；WebGPU 不进入发布关键路径。
