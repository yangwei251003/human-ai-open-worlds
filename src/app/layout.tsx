import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./fonts/fonts.css";
import { publicPath } from "@/lib/public-path";
import { ExperienceHost } from "@/components/runtime/ExperienceHost";
import { WorldNav } from "@/components/navigation/WorldNav";
import { isSiteReadyForIndexing, siteConfig } from "@/data/site";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · 个人作品集`,
    template: `%s · ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: ["AI 项目", "个人作品集", "网页版简历", "前端开发", "人工智能"],
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    locale: "zh_CN",
    images: [{
      url: publicPath("/media/ai-multiverse-og.jpg"),
      width: 1200,
      height: 630,
      alt: "围绕珊瑚色核心展开的七种材质世界，AI 生成品牌视觉",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [publicPath("/media/ai-multiverse-og.jpg")],
  },
  robots: { index: isSiteReadyForIndexing, follow: isSiteReadyForIndexing },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080908",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="bundled-fonts">
        <a className="skip-link" href="#main-content">跳到主要内容</a>
        <ExperienceHost>
          <WorldNav />
          {children}
        </ExperienceHost>
      </body>
    </html>
  );
}
