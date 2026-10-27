export type AssetStatus = "placeholder" | "ai-generated" | "real" | "private";

export type WorldKey = "home" | "projects" | "honors" | "resume" | "journal" | "cinema" | "gallery";

export type World = {
  key: WorldKey;
  index: string;
  href: string;
  label: string;
  englishLabel: string;
  description: string;
  action: string;
};

export type Asset = {
  id: string;
  kind: "portrait" | "project" | "certificate" | "poster" | "photo" | "brand";
  status: AssetStatus;
  replaceKey: string;
  label: string;
  alt: string;
  ratio: string;
  src?: string;
  credit?: string;
};

export type Person = {
  name: string;
  initials: string;
  title: string;
  tagline: string;
  location: string;
  availability: string;
  statusLine: string;
  bio: string[];
  email?: string;
  links: {
    github?: string;
    bilibili?: string;
    xiaohongshu?: string;
    linkedin?: string;
  };
};

export type ProjectCategory = "网站" | "Skill" | "小游戏" | "小程序" | "Agent" | "视觉实验";

export type Project = {
  id: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  year: string;
  status: "构思中" | "开发中" | "待补充" | "已发布";
  summary: string;
  problem: string;
  role: string;
  aiRole: string;
  features: string[];
  stack: string[];
  result: string;
  reflection: string;
  featured?: boolean;
  demoUrl?: string;
  sourceUrl?: string;
  asset: Asset;
};

export type Honor = {
  id: string;
  title: string;
  year: string;
  organizer: string;
  level: string;
  rank: string;
  team: string;
  role: string;
  context: string;
  reflection: string;
  relatedProjectId?: string;
  evidenceUrl?: string;
  asset: Asset;
};

export type Experience = {
  id: string;
  period: string;
  title: string;
  organization: string;
  context: string;
  owned: string;
  result: string;
  relatedProjectIds: string[];
};

export type Capability = {
  id: string;
  category: string;
  title: string;
  description: string;
  output: string;
  tools: string[];
  relatedProjectIds: string[];
};

export type Post = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  date: string;
  readTime: string;
  tags: string[];
  status: "内容种子" | "草稿" | "已发布";
  note: string;
  sections: { heading: string; body: string }[];
  relatedProjectIds: string[];
  asset: Asset;
};

export type Video = {
  id: string;
  title: string;
  logline: string;
  year: string;
  duration: string;
  genre: string;
  role: string;
  tools: string[];
  transcript: string;
  chapters: { time: string; label: string }[];
  relatedProjectIds: string[];
  videoUrl?: string;
  captionsUrl?: string;
  captionsLanguage?: string;
  captionsLabel?: string;
  asset: Asset;
};

export type Photo = {
  id: string;
  title: string;
  date: string;
  place: string;
  collection: string;
  note: string;
  alt: string;
  ratio: "portrait" | "landscape" | "square";
  color: string;
  asset: Asset;
};
