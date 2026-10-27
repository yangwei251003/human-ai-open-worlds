import type { Person, World } from "./types";

export const siteConfig = {
  name: "HUMAN × AI / OPEN WORLDS",
  shortName: "HA/07",
  description: "一个关于 AI 作品、荣誉、履历、思考与生活记录的多世界个人网站。",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-domain.example",
};

export const person: Person = {
  name: "示例创作者",
  initials: "DEMO",
  title: "AI 产品开发者 / 在校创造者",
  tagline: "把模糊想法变成能被体验、验证与持续进化的 AI 作品。",
  location: "演示不展示具体位置",
  availability: "开源作品集模板演示",
  statusLine: "正在把 AI、产品判断与前端表达连接成完整作品。",
  bio: [
    "我在探索如何借助 AI，把网站、Skill、小游戏与小程序从想法推进到可体验的作品。",
    "我的工作方式从真实问题出发，先定义体验，再让模型、代码与设计各自承担清晰角色。",
    "这里的所有案例、荣誉和媒体位置都已准备好结构，等待替换为真实资料。",
  ],
  links: {},
};

export const isSiteReadyForIndexing =
  process.env.NEXT_PUBLIC_SITE_READY === "true" &&
  !siteConfig.url.includes("your-domain.example") && person.name !== "示例创作者";

export const worlds: World[] = [
  { key: "home", index: "00", href: "/", label: "门户", englishLabel: "Portal", description: "身份与七个世界的总入口", action: "进入" },
  { key: "projects", index: "01", href: "/projects", label: "AI 项目", englishLabel: "AI Lab", description: "网站、Skill、游戏与小程序", action: "筛选" },
  { key: "honors", index: "02", href: "/honors", label: "荣誉档案", englishLabel: "Museum", description: "比赛、证书与外部认可", action: "聚光" },
  { key: "resume", index: "03", href: "/resume", label: "个人履历", englishLabel: "Swiss CV", description: "经历、教育与联系方式", action: "查阅" },
  { key: "journal", index: "04", href: "/journal", label: "数字花园", englishLabel: "Journal", description: "文章、心得与成长记录", action: "阅读" },
  { key: "cinema", index: "05", href: "/cinema", label: "个人影院", englishLabel: "Cinema", description: "视频、讲述与幕后过程", action: "放映" },
  { key: "gallery", index: "06", href: "/gallery", label: "记忆暗房", englishLabel: "Contact Sheet", description: "照片、时间与生活感悟", action: "浏览" },
];

export const worldByKey = Object.fromEntries(worlds.map((world) => [world.key, world])) as Record<World["key"], World>;
