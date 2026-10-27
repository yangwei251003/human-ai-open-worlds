# Research Evidence

> Blueprint version：1.1
> Last updated：2026-08-29
> Status：Approved
> Authority：外部案例与官方技术/无障碍证据。所有链接于 2026-08-29 核验。

| 主张/问题 | 方法 | 来源/样本 | 发现 | 置信度 | 对决定的影响 |
|---|---|---|---|---|---|
| 一个作者可承载完全不同的互动世界 | 直接访问 | [Neal.fun](https://neal.fun/)、[Nicky Case](https://ncase.me/) | 母站统一作者身份与出口，子作品可独立美术/玩法 | 高 | 支持 DEC-001 |
| 强互动入口必须有普通路径和恢复 | 直接访问 | [Bruno Simon](https://bruno-simon.com/)、[Jesse Zhou](https://www.jesse-zhou.com/) | 3D 能形成记忆；控制、复位、移动重排和 DOM 等效导航不可缺 | 高 | DEC-006/008；Hero 使用 WebGL2 但不依赖它 |
| 多年/多风格个人站仍需稳定身份与内容入口 | 直接访问 | [Rauno Freiberg](https://rauno.me/)、[Lynn Fisher 2025 refresh](https://lynnandtonic.com/thoughts/entries/case-study-2025-refresh/) | 艺术方向可变，品牌/导航/内容连续性保持；移动端需重新编排 | 高 | DEC-001、响应式契约 |
| 异质内容应按意图而非单一时间流组织 | 直接访问 | [Maggie Appleton](https://maggieappleton.com/)、[Eric Sun](https://ericsun.dev/) | Garden/Essays/Talks/Photography 等独立入口支持长期内容 | 高 | 七页 IA |
| 实验站仍要有快速简历路径 | 直接访问 | [Brittany Chiang](https://brittanychiang.com/)、[Adham Dannaway](https://www.adhamdannaway.com/) | 清晰 About/Experience/Projects/Resume 对招聘者有效 | 高 | Resume 独立路由、DEC-005 |
| 静态多路由技术可行 | 官方文档 | [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)、[Metadata](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) | 每路由输出 HTML；服务器能力有明确边界 | 高 | DEC-002 |
| 多根布局会失去共享客户端导航优势 | 官方文档 | [Next.js Layout](https://nextjs.org/docs/app/api-reference/file-conventions/layout) | 视觉隔离应用页面主题，而不是多个根布局 | 高 | DEC-002 |
| 复杂动效必须遵循用户减少动态偏好 | 官方标准/文档 | [Motion useReducedMotion](https://motion.dev/docs/react-use-reduced-motion)、[WCAG 2.2](https://www.w3.org/TR/WCAG22/) | reduced motion 与可暂停持续动画是明确质量边界 | 高 | RISK-002、体验验收 |
| 重复导航应保持相对顺序 | 官方标准 | [WCAG Consistent Navigation](https://www.w3.org/WAI/WCAG21/Understanding/consistent-navigation) | 七页虽视觉不同，导航顺序不能变化 | 高 | Brand DNA/ACT-001 |
| 游戏化入口可以既强烈又可跳过教学 | 站点 + 制作复盘 | [Martin Laxenaire](https://www.martin-laxenaire.fr/)、[Codrops case study](https://tympanus.net/codrops/2025/10/06/self-doubt-and-the-quest-for-fun-how-i-ended-up-turning-my-portfolio-into-a-game/) | WebGPU/WebGL、Canvas、SVG、GSAP/Lenis 可形成探索中枢；“解锁全部”应跳过引导而非删体验 | 高 | Hero 七门户与可跳过引导 |
| Next/R3F 可实现 DOM/WebGL 同步的门户与媒体墙 | 制作复盘 | [Roman Jean-Elie](https://tympanus.net/codrops/2025/11/27/letting-the-creative-process-shape-a-webgl-portfolio/)、[Stefan Vitasović](https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/) | Next.js + R3F + GSAP、坐标同步、Shader 和动态导入已有实战证据 | 高 | DEC-006；单门户空间与路由拆包 |
| 移动端可保留同一 3D 世界，只降低内部成本 | 制作复盘 | [Joseph Santamaria](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/)、[Olha Lazarieva](https://tympanus.net/codrops/2025/12/02/two-portfolios-one-process-where-design-motion-and-code-come-together/) | KTX2/Draco/Instancing、专属滚动容器与移动镜头让竖屏保持空间叙事 | 高 | DEC-006；移动同等级重排 |
| 重型体验仍应只有一个渲染循环/上下文 | 制作复盘 + 官方文档 | [Gabriel Contassot](https://tympanus.net/codrops/2024/04/24/case-study-gabriel-contassots-portfolio-2024/)、[Drei View](https://drei.docs.pmnd.rs/portals/view)、[R3F pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls) | 单全屏 Quad/单 Canvas、多视区和 ref 驱动可避免多上下文与每帧 React 更新 | 高 | DEC-007；持久 Canvas |
| React 19 与 R3F 9 兼容 | 官方文档/npm | [R3F installation](https://r3f.docs.pmnd.rs/getting-started/installation)、[R3F npm](https://www.npmjs.com/package/@react-three/fiber)、[Drei npm](https://www.npmjs.com/package/@react-three/drei) | R3F v9 对应 React 19；锁定 R3F 9.7/Drei 10.7/Three 0.185 | 高 | 技术版本冻结 |
| WebGPU 目前不适合作为发布主线 | 官方文档 | [Three WebGPU renderer](https://threejs.org/manual/en/webgpurenderer)、[MDN WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) | Three 实现仍实验性、材质/后处理边界不同，WebGPU 也非 Baseline | 高 | DEC-008；WebGL2 主线 |
| 平滑滚动与 ScrollTrigger 必须共用时钟 | 官方文档 | [Lenis GSAP integration](https://github.com/darkroomengineering/lenis)、[GSAP React](https://github.com/greensock/react) | Lenis 通过 GSAP ticker 驱动并通知 ScrollTrigger；context/useGSAP 负责清理 | 高 | DEC-007 |
| 移动性能应自适应实现成本而非移除体验 | 官方文档 | [Drei PerformanceMonitor](https://drei.docs.pmnd.rs/performances/performance-monitor)、[AdaptiveDpr](https://drei.docs.pmnd.rs/performances/adaptive-dpr)、[Three responsive](https://threejs.org/manual/en/responsive.html) | 基于 FPS 调 DPR/阴影/粒子/纹理并防抖，不能直接照搬设备 DPR | 高 | RISK-006；质量管理器 |
| Canvas 必须有语义化对应物和错误退路 | 标准/官方文档 | [HTML canvas](https://html.spec.whatwg.org/multipage/canvas.html)、[R3F Canvas](https://r3f.docs.pmnd.rs/api/canvas)、[Three disposal](https://threejs.org/manual/en/how-to-dispose-of-objects.html) | 位图无 DOM 语义；需要 fallback、键盘映射、context loss 处理与显式 dispose | 高 | DEC-008；Gate 1/4 |

## 证据缺口

- 未有真实用户访谈或访问数据；首版受众优先级是授权默认，真实上线后应按点击/反馈重开 `DEC-005`。
- 未有真实个人媒体，因此最终纹理/视频预算仍需在替换时复核；首版用可显影、可聚光但不会破图的本地生成占位系统。
- 性能预算来自官方建议与项目初始门槛，不是已验证事实；必须在目标 iOS/Android 真机上校准。
- 未确定部署域名；上线前必须复核 metadataBase、canonical、sitemap 与可能的 basePath。
