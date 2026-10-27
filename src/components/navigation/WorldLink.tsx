"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type AnchorHTMLAttributes, type MouseEvent } from "react";
import type { WorldKey } from "@/data/types";
import { useExperienceStore } from "@/components/runtime/experience-store";
import { scheduleWorldNavigation } from "./navigation-controller";

type WorldLinkProps = LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
  world: WorldKey;
};

export function WorldLink({ href, world, onClick, children, prefetch = false, ...props }: WorldLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useExperienceStore((state) => state.reduceMotion);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const nextHref = typeof href === "string" ? href : href.pathname ?? "/";
    if (pathname === nextHref) return;
    event.preventDefault();
    scheduleWorldNavigation(world, reduceMotion ? 30 : 390, () => router.push(nextHref));
  };

  return <Link href={href} prefetch={prefetch} onClick={handleClick} {...props}>{children}</Link>;
}
