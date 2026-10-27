import type { Metadata } from "next";

import { honors, projects } from "@/data/content";
import { isSiteReadyForIndexing } from "@/data/site";

import { HonorsExperience } from "./HonorsExperience";

export const metadata: Metadata = {
  title: "荣誉档案 | Museum Vault",
  description: "沿着年份展厅查看比赛、证书与外部认可，每一项荣誉都保留可核验的上下文。",
  alternates: isSiteReadyForIndexing ? { canonical: "/honors" } : undefined,
};

export default function HonorsPage() {
  const projectReferences = projects.map(({ id, slug, title }) => ({ id, slug, title }));

  return <HonorsExperience honors={honors} projects={projectReferences} />;
}
