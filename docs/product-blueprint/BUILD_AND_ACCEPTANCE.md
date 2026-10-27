# Build and Acceptance

> Blueprint version：1.1
> Last updated：2026-08-29
> Status：Approved
> Authority：开发顺序、纵向切片、验收、发布与停止条件。

## 交付策略

- 当前目标：交付可运行、可静态导出、可替换内容的七页个人品牌网站。
- 首个纵向切片：共享数据 + WorldNav + ExperienceHost + 持久 Canvas + Hero Portal + 七条可访问路由。
- 冻结默认：招聘者/评委优先；中文主语言；七页全做；真实资料显式占位；无后端；默认高强度 WebGL2/GSAP 体验；移动端同等级专属重排。
- 不在本轮：CMS、评论、账号、搜索、分析、自定义视频播放器、在线表单、真实社交集成。

## 纵向任务

| 顺序 | 切片/任务 | 用户价值 | 涉及 ACT/DEC | 前端 | 后端/数据 | 测试 | 完成条件 |
|---|---|---|---|---|---|---|---|
| 0 | 空间运行时 | 让高强度体验可中断、可恢复、可释放 | DEC-006/007/008 | Host、单 Canvas、质量/输入/生命周期 | world registry、asset manifest | 单 context/cleanup/fallback | DOM 与 Canvas 解耦 |
| 1 | Portal | 识别身份并穿越全部世界 | ACT-001/DEC-001/006 | 轨道宇宙、门户、导航 | Person/world registry | nav/interrupt/mobile | 七页均可达且飞行可中断 |
| 2 | Projects + Honors | 验证作品与外部认可 | ACT-002/003 | 3D 工作台、检查台、荣誉建筑 | Project/Honor | keyboard/history/context loss | 证据字段完整 |
| 3 | Resume + Journal | 快速履历与思考深度 | ACT-004/005 | 排版机械、折叠归档、空间书页 | Experience/Post | print/filter/fast-scroll | 打印可用、文章可扫读 |
| 4 | Cinema + Gallery | 动态表达与生活记录 | ACT-006/007 | 影院、视频纹理、实例化暗房 | Video/Photo | media failure/texture cleanup | 无真实媒体也稳定 |
| 5 | SEO、响应式与精修 | 可发布、可发现、可访问 | 全部 | metadata、404、states、细节 | sitemap/robots | Playwright/截图/Lighthouse | 质量门全过 |

## 验收场景

| 场景 | Given | When | Then | 恢复/边界 | 自动化层级 |
|---|---|---|---|---|---|
| 全站导航 | 任一页面 | 键盘打开导航并选目标 | 到达目标且 `aria-current` 正确 | 无 JS 动效也可导航 | E2E |
| 项目筛选 | 6 个项目占位 | 选择类别 | 只显示匹配项并报告数量 | 无结果可一键清除 | E2E |
| 证书详情 | 荣誉卡可聚焦 | Enter 打开、Esc 关闭 | 文本证据可读，焦点归位 | 无图片仍完整 | E2E |
| 履历打印 | `/resume` | 点击打印/打印预览 | 导航装饰隐藏、黑白清晰 | 取消返回原页 | Manual |
| reduced motion | 系统偏好 reduce | 浏览七页并操作 | 无视差/大位移/持续动画 | 所有内容仍可用 | E2E/Manual |
| Cinema 占位 | 无真实视频 | 选择影片 | 更新海报、说明、文字稿 | 不显示坏播放器 | E2E |
| Gallery 灯箱 | 照片占位 | 打开、前后浏览、关闭 | alt/短记/编号更新 | 首尾状态明确 | E2E |
| 静态深链 | 已生成 `out/` | 直接访问内页并刷新 | 页面正常返回 | 404 有全站出口 | E2E |
| 动画中断 | 任一相机/布局动作进行中 | 滚轮、触摸、Esc、返回或导航 | 当前动作立即终止，新输入接管 | 不排队、不锁页面 | E2E/Manual |
| 移动强体验 | 390×844 触摸设备 | 浏览七页并完成主交互 | 空间隐喻和动态高潮保留 | 原生滚动/捏合不被背景 Canvas 阻断 | 真机/Playwright |
| GPU 生命周期 | 七个路由往返 20 次 | 监测 Canvas 与 renderer 资源 | 仅一个 context，资源计数不持续增长 | context loss 后 DOM 仍可用 | Manual/Instrumentation |

## 质量门与发布

- 必须运行：`npm run lint`、类型检查、`npm run build`、Playwright 关键路径。
- 检查 `out/` 包含 `/`, `/projects/`, `/honors/`, `/resume/`, `/journal/`, `/cinema/`, `/gallery/`。
- 截图视口：1440×1000、768×1024、390×844；检查灰度可分辨、无溢出、焦点/对话框/移动菜单。
- 浏览器：Chromium 必过；Firefox/WebKit 至少进行关键路径冒烟。
- 真机：iOS Safari 与 Android Chrome 验证 `dvh`、地址栏、触摸、横竖屏、后台恢复和质量调档。
- 上线前替换：`siteConfig.url`、姓名、真实联系方式；否则 SEO 状态为 Conditional。
- 回滚：静态站回滚到上一 Git commit/部署；无数据迁移。

## 三重审查

- Skeptic Review — Pass：新增失败点为 GPU 泄漏、重复时钟、触摸锁死、眩晕和首屏阻塞；均对应可量化门禁与 DOM 退路。
- Simplifier Review — Pass：保留用户授权的空间主线，删除重复 Canvas、重复 RAF、WebGPU-first、同页多主引擎和自制媒体解码器。
- Blind-Handoff Review — Pass：新 Agent 可回答谁是用户、每页唯一隐喻、运行时边界、移动重排、资源释放、中断和验收方式。

## 交接检查

- [x] 无 Blocking 未决项
- [x] 首个纵向切片无需重新做关键产品决定即可执行
- [x] Skeptic / Simplifier / Blind-Handoff 审查通过
- [x] 权限、状态、数据、错误、异步、监控和测试均有闭环
- [x] Conditional 默认及重开条件已冻结
