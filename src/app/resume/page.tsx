import type { Metadata } from "next";

import { capabilities, experiences, projects } from "@/data/content";
import { isSiteReadyForIndexing, person } from "@/data/site";

import { ResumeExperience } from "./ResumeExperience";

export const metadata: Metadata = {
  title: "个人履历 | Resume",
  description: "查阅教育、实践、能力与项目证据，并打印为清晰的网页版简历。",
  alternates: isSiteReadyForIndexing ? { canonical: "/resume" } : undefined,
};

export default function ResumePage() {
  return (
    <ResumeExperience
      person={person}
      experiences={experiences}
      capabilities={capabilities}
      projects={projects}
    />
  );
}
