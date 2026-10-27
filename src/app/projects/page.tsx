import type { Metadata } from "next";

import { projects } from "@/data/content";
import { isSiteReadyForIndexing } from "@/data/site";

import { ProjectsExperience } from "./ProjectsExperience";

export const metadata: Metadata = {
  title: "AI 项目 | Project Lab",
  description: "检查网站、Skill、小游戏、小程序与 Agent 项目中的问题、本人工作、AI 协作和结果。",
  alternates: isSiteReadyForIndexing ? { canonical: "/projects" } : undefined,
};

export default function ProjectsPage() {
  return <ProjectsExperience projects={projects} />;
}
