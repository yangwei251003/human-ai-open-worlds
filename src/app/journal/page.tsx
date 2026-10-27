import type { Metadata } from "next";

import { posts, projects } from "../../data/content";
import { isSiteReadyForIndexing } from "@/data/site";
import JournalExperience from "./JournalExperience";

export const metadata: Metadata = {
  title: "数字花园 | Journal",
  description:
    "翻开一册会生长的数字花园，阅读关于 AI 协作、产品判断与长期创作的文章种子。",
  alternates: isSiteReadyForIndexing ? { canonical: "/journal" } : undefined,
};

export default function JournalPage() {
  const projectReferences = projects.map(({ id, slug, title }) => ({ id, slug, title }));

  return <JournalExperience posts={posts} projects={projectReferences} />;
}
