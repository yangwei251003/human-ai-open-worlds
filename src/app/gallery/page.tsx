import type { Metadata } from "next";

import { photos } from "../../data/content";
import { isSiteReadyForIndexing } from "@/data/site";
import GalleryExperience from "./GalleryExperience";

export const metadata: Metadata = {
  title: "记忆暗房 | Gallery",
  description:
    "穿过一条会显影的 3D 底片螺旋，在照片、时间与短记之间浏览个人生活档案。",
  alternates: isSiteReadyForIndexing ? { canonical: "/gallery" } : undefined,
};

export default function GalleryPage() {
  return <GalleryExperience photos={photos} />;
}
