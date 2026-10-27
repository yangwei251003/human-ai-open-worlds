# Decisions

> Blueprint version：1.1
> Last updated：2026-08-29
> Status：Approved
> Authority：跨产品、视觉与技术的高影响决定及重开条件。

| ID | 状态 | 决定 | 选择理由 | 被否方案 | 影响范围 | 重开条件 | 日期 |
|---|---|---|---|---|---|---|---|
| DEC-001 | Approved | 采用“同一身份，七个世界” | 满足用户的差异化要求，同时用共享导航与数据控制认知/维护风险 | 单一主题长页；七个完全孤立微站 | Product/Experience/ACT-001 | 用户要求统一主题或减少页面 | 2026-08-29 |
| DEC-002 | Approved | Next.js App Router 纯静态导出，单一根布局 | 多路由 SEO、静态托管、渐进增强、后续可升级 | SPA-only；多根布局；需要服务器的首版 | System/Build | 需要登录、评论、CMS 或请求期个性化 | 2026-08-29 |
| DEC-003 | Superseded | 首版不用 WebGL、自定义播放器和实验 ViewTransition | 该保守默认被用户后续明确授权放大空间感、3D 与高强度交互所取代 | Three.js 世界；自制播放器；实验 API | Experience/RISK-002 | 已由 DEC-006 取代 | 2026-08-29 |
| DEC-004 | Approved | 所有个人内容集中管理，并带资产状态/替换键 | 后续真实内容可一次替换、跨页同步，杜绝假数据 | 文案散落组件；远程假占位图 | System/Content | 引入真实 CMS 时迁移为同构 schema | 2026-08-29 |
| DEC-005 | Approved | 招聘者/比赛评委优先，首页主行动“查看精选项目”，次行动“查看履历” | 与网页版简历和成就证明目标最吻合 | 社交内容优先；联系表单优先 | Product/Hero copy | 用户明确指定其他第一受众 | 2026-08-29 |
| DEC-006 | Approved | 首发采用“静态 DOM 外壳 + 持久单 Canvas WebGL2 运行时 + 七个空间世界”；默认高强度，移动端做同等级专属重排 | 用户明确要求不因移动端轻量化，并授权重型 3D 与强化动效；案例与官方技术核验证明可在单上下文、按路由拆包、质量自适应下落地 | 全站纯 DOM；每页独立 Canvas；WebGPU-first；桌面 3D/移动静态列表 | Product/Experience/System/Build/RISK-002/006 | 真机验证无法达到可操作帧率，或用户改为内容优先型站点 | 2026-08-29 |
| DEC-007 | Approved | GSAP 管滚动/长时间线/3D，Motion 管组件级布局与微交互；Lenis 与 GSAP 共用单一时钟 | 避免重复 RAF、双滚动权威和多个库争写同一属性 | 多个滚动容器；ScrollSmoother + Lenis；Motion 与 GSAP 同时写 transform | System/Experience/RISK-006 | 技术栈替换或发现兼容阻断 | 2026-08-29 |
| DEC-008 | Approved | WebGL2 为首发主线，WebGPU 只做隔离实验；Canvas 绝不承载唯一内容/导航 | R3F 生态和后处理在 WebGL2 更成熟；WebGPU 仍非 Baseline 且 Three 实现为实验性 | WebGPU-only；Canvas-only 信息架构 | System/Accessibility | WebGPU 与生态达到稳定、跨浏览器覆盖满足发布门槛 | 2026-08-29 |

## 变更记录

- `DEC-003` 被 `DEC-006` 取代：用户在首轮蓝图后明确扩大动效、交互与 3D 授权。
