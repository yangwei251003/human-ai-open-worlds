# HUMAN × AI / OPEN WORLDS · Blueprint Index

> Blueprint version：1.1
> Last updated：2026-08-29
> Status：Implemented / QA complete
> Authority：本文件只负责蓝图导航、门禁与开发入口。
> Current frontier：替换真实内容与媒体，配置生产域名，并完成部署前终验。

## 权威来源

| 主题 | 唯一权威文档 | 状态 | 依赖/备注 |
|---|---|---|---|
| 项目事实、决定、未决项 | `PROJECT_STATE.md` | Approved | 先读 |
| 产品范围与旅程 | `PRODUCT_BLUEPRINT.md` | Approved | `DEC-001`、`DEC-002` |
| 体验与视觉契约 | `EXPERIENCE_BLUEPRINT.md` | Approved | 七个视觉世界 |
| 系统、数据与集成 | `SYSTEM_BLUEPRINT.md` | Approved | 纯静态首版 |
| 构建切片与验收 | `BUILD_AND_ACCEPTANCE.md` | Implemented | 实现基线 |
| 最终 QA 证据 | `../QA_REPORT.md` | Verified | 功能、视口、无障碍、SEO 门禁与性能结果入口 |

## 条件模块

| 模块 | 触发原因 | 状态 | 权威范围 |
|---|---|---|---|
| `DECISIONS.md` | 存在跨产品、视觉与工程的高影响决定 | Approved | 决定与重开条件 |
| `RESEARCH_EVIDENCE.md` | 外部案例和官方规范改变方案 | Approved | 调研证据 |
| `VISUAL_EXPLORATION.md` | 需要比较全站视觉组织方式 | Approved | 被否方向与选定理由 |
| `CONTENT_AND_COPY.md` | 七类结构化内容与大量占位文案 | Approved | 内容字段、占位与语气 |

## Delivery 摘要

- Blocking：无。
- Conditional：姓名、头像、真实项目/荣誉/文章/视频/照片、联系方式、生产域名均使用显式占位；真实资料到位后通过集中数据文件替换。
- Later：CMS、账号、评论、收藏、后台、搜索、WebGPU 主线、真实媒体接入、分析平台。
- 已交付：共享数据 → 可访问导航 → 持久 Canvas → Hero Portal → 七条视觉与交互完全差异化的可达路由。
- 当前体验默认：高强度空间动效；移动端同等级专属重排；只按实测降低 DPR、纹理、粒子、阴影和后处理成本。
- 运行时边界：全站一个 WebGL2 Canvas；DOM 保留全部身份、内容、导航和键盘路径；任何长动画可中断。
- 三重审查：Skeptic Pass / Simplifier Pass / Blind-Handoff Pass。
- QA 结果：七路由三档视口无横向溢出，14 组桌面/手机 Axe A/AA 违规为 0，核心交互与恢复路径通过；移动端 Lighthouse 三次实验中位数为 Performance 92、Accessibility 100、Best Practices 100，完整数字见 `../QA_REPORT.md`。
- 交接阅读顺序：本索引 → `PROJECT_STATE.md` → `../QA_REPORT.md` → `CONTENT_AND_COPY.md` → `SYSTEM_BLUEPRINT.md`。
