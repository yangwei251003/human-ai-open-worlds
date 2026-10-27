# Content and Copy

> Blueprint version：1.1
> Last updated：2026-08-29
> Status：Approved
> Authority：结构化内容字段、占位规则、语气与 CTA。

## 内容模型

| 内容类型 | 目的 | 核心字段 | 来源/所有者 | 生命周期 | 空/错状态 |
|---|---|---|---|---|---|
| Person | 身份、履历与联系 | name/title/tagline/bio/location/education/links | 用户 | placeholder→real | 显示“待补充”，链接不激活 |
| Project | 证明 AI 开发能力 | id/type/problem/role/aiRole/features/stack/result/links/asset | 用户 | draft→featured/published | 结构化案例种子，明确非真实成果 |
| Honor | 展示外部认可 | organizer/level/rank/date/evidence/reflection | 用户 | placeholder→verified | 证书占位 + 文本说明 |
| Experience | 完整在校/实践经历 | period/title/org/owned/result/relatedIds | 用户 | placeholder→real | 只显示准备项，不伪造机构 |
| Post | 思考与成长 | title/summary/date/tags/body/relatedIds | 用户 | seed→draft→published | 标“内容种子/待撰写” |
| Video | 动态表达 | title/logline/duration/poster/transcript/chapters | 用户 | placeholder→ready | 海报 + 文字稿占位，无坏播放器 |
| Photo | 生活记录 | title/date/place/collection/alt/note/privacy | 用户 | placeholder→real/private | 抽象样片 + 具体替换提示 |
| Asset | 跨内容媒体 | kind/status/replaceKey/ratio/alt/credits/focalPoint | 用户/授权生成 | placeholder/ai-generated/real/private | private 不渲染 |

## 文案契约

- 语气：第一人称、具体、诚实、年轻但不过度营销；先讲做了什么，再讲意义。
- 禁词/模式：热爱技术、赋能未来、颠覆行业、无限可能、虚构客户/指标/奖项。
- 首页主 CTA：“查看精选项目”；次 CTA：“查看履历”；联系信息缺失时不渲染假邮箱。
- 项目固定叙事：`要解决的问题` → `我亲自完成` → `AI 如何协作` → `结果/待补证据` → `复盘`。
- AI 生成资产显示 `AI GENERATED`；普通空位显示 `待替换`；真实素材不显示状态徽标。
- 中英混排：中文正文不用压缩 Latin 字体；英文只用于编号、短标签和技术栈。
- 长度：Hero 宣言不超过 28 个中文字符；项目摘要 40–80 字；卡片标题最多两行；正文行长约 60–72 个中文字符的视觉等效宽度。
