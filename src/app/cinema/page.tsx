import type { Metadata } from "next";

import { projects, videos } from "@/data/content";
import { isSiteReadyForIndexing } from "@/data/site";

import { CinemaExperience } from "./CinemaExperience";

export const metadata: Metadata = {
  title: "个人影院 | Cinema",
  description: "在弧形海报墙中选择项目幕后、作品演示与阶段复盘；没有真实视频时仍可完整阅读结构与文字稿。",
  alternates: isSiteReadyForIndexing ? { canonical: "/cinema" } : undefined,
};

export default function CinemaPage() {
  const projectReferences = projects.map(({ id, slug, title }) => ({ id, slug, title }));

  return <CinemaExperience videos={videos} projects={projectReferences} />;
}
