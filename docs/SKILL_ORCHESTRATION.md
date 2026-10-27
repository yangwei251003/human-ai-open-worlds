# Skill × Model × Agent 协作编排

> 更新：2026-08-29
> 适用范围：`codex/portfolio-multiverse` 独立分支
> 路由结果：`[动态技能路由器] NO_SKILL`，routeId `96129e81-25d4-4f78-bdb5-11fd6eb1f864`。本任务只路由一次。

## 选择结论

| 阶段 | 主技能 | 英文 ID | 选择理由 | 输出 |
|---|---|---|---|---|
| 产品总控 | Vibe Product Director | `vibe-product-director` | 把七个视觉世界收束为同一产品，冻结受众、内容、风险、验收和技术边界 | 产品蓝图、体验蓝图、决策与验收门 |
| 信息架构 | Personal Homepage Skill | `personal-homepage-skill` | 覆盖作品集、网页版简历、荣誉、文章、影像和联系方式的内容模型 | 七路由 IA、占位与替换契约 |
| 视觉与实现 | Design Taste Frontend、Frontend Dev | `design-taste-frontend`、`frontend-dev` | 建立反模板化页面语言，并完成 Next.js 生产实现 | 七种视觉物理、共享导航、集中数据 |
| 动效系统 | GSAP 专题 | `gsap-core`、`gsap-react`、`gsap-scrolltrigger`、`gsap-performance` | 处理可中断转场、滚动叙事、React 生命周期和性能纪律 | 统一 GSAP 时钟、Lenis、页面动效 |
| 三维系统 | Three.js 专题 | `threejs-fundamentals`、`threejs-interaction`、`threejs-shaders`、`threejs-postprocessing` | 支撑持久 Canvas、指针空间、Shader 和后处理 | WebGL2 空间背景、七世界场景、质量自适应 |
| AI 视觉 | Image Gen | `image-gen` | 只选择一个图像服务商，避免多供应商风格漂移 | 主品牌视觉、项目封面和 OG 图 |
| 设计打磨 | Impeccable | `impeccable` | 清除模板感、虚假界面装饰和不稳定交互习惯 | 排版、层级、触摸目标和 reduced motion 约束 |
| 质量验收 | Accessibility、Core Web Vitals、Playwright、Dogfood、SEO | `accessibility`、`core-web-vitals`、`playwright`、`dogfood`、`seo` | 形成语义、性能、关键路径、探索测试和可发现性闭环 | 自动化检查、浏览器截图、实验室性能与 SEO 门禁 |
| 原创性 | Audit Reference Originality | `audit-reference-originality` | 确保只学习方法，不复制第三方品牌、文案、素材或独特构图 | 参考来源登记和原创性审计 |

## Agent 协作方式

所有 Agent 共享同一任务路由结果和设计约束，不重复执行技能路由。主 Agent 负责产品蓝图、空间运行时、集中数据、最终整合与质量门；页面 Agent 按文件边界并行开发不同世界；交互 Agent 专注 Hero 手势和中断恢复；审查 Agent 只读检查语义、SEO 和跨页关系。最终变更统一通过全项目 lint、类型检查、静态构建和浏览器验收。

这种拆分让页面创意可以并行发散，同时由共享的数据模型、导航顺序、动效状态和验收标准保持一致。

## 未选择或降级的技能

- `vibe-product-director.backup-20260829-124143`、`skill_2052764137292271616`、`frontend-design-3-0.1.0` 等备份或重复注册项不重复加载。
- Three.js 十个专题不全量加载，只读取本轮实际用到的 fundamentals、interaction、shaders、postprocessing。
- 图片生成服务只使用 `image-gen`；其他图片服务保留为故障替代，不并行混用。
- React Native、小程序全栈、CloudBase 和部署技能不属于当前静态网站实现范围，等真实后端或发布目标确定后再启用。
- 浏览器探索验收优先遵循 `dogfood` 方法，但本机缺少它依赖的 `agent-browser` 可执行文件，因此由 Playwright 承担同等范围的实际操作与证据采集。

## 后续替换真实资料时的技能路由

真实头像或品牌视觉到位时启用单一图像编辑技能；真实视频到位时启用 FFmpeg；准备上线时再按目标平台选择一个部署技能，并重新执行 SEO、无障碍、性能和原创性门禁。后续若形成独立的新用户任务，应按全局协议重新路由。
