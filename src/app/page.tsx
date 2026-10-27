import type { Metadata } from "next";
import { isSiteReadyForIndexing } from "@/data/site";
import { HeroPortal } from "./HeroPortal";

export const metadata: Metadata = {
  title: "门户 | Portal",
  description: "进入你的名字的七个个人世界：AI 项目、荣誉、履历、文章、视频与照片。",
  alternates: isSiteReadyForIndexing ? { canonical: "/" } : undefined,
};

export default function HomePage() {
  return <HeroPortal />;
}
