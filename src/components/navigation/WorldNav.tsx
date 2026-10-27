"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { person, siteConfig, worlds } from "@/data/site";
import { useExperienceStore } from "@/components/runtime/experience-store";
import { worldFromPath } from "@/components/runtime/world-utils";
import { WorldLink } from "./WorldLink";
import { cancelPendingWorldNavigation } from "./navigation-controller";

const focusableSelector = "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])";

export function WorldNav() {
  const pathname = usePathname();
  const [openAtPath, setOpenAtPath] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const open = openAtPath === pathname;
  const current = worldFromPath(pathname);
  const reduceMotion = useExperienceStore((state) => state.reduceMotion);
  const setReduceMotion = useExperienceStore((state) => state.setReduceMotion);
  const quality = useExperienceStore((state) => state.quality);
  const setQuality = useExperienceStore((state) => state.setQuality);

  const closeMenu = useCallback((restoreFocus = true) => {
    setOpenAtPath(null);
    if (restoreFocus) window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelPendingWorldNavigation();
        if (open) closeMenu();
        return;
      }

      if (event.key === "Tab" && open && menuRef.current) {
        const focusable = Array.from(menuRef.current.querySelectorAll<HTMLElement>(focusableSelector));
        const first = focusable.at(0);
        const last = focusable.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMenu, open]);

  useEffect(() => {
    window.addEventListener("popstate", cancelPendingWorldNavigation);
    return () => window.removeEventListener("popstate", cancelPendingWorldNavigation);
  }, []);

  useEffect(() => {
    const main = document.querySelector("main");
    const previousOverflow = document.documentElement.style.overflow;
    if (main instanceof HTMLElement) main.inert = open;
    if (open) {
      document.documentElement.style.overflow = "hidden";
      requestAnimationFrame(() => menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus());
    }
    return () => {
      if (main instanceof HTMLElement) main.inert = false;
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [open]);

  const toggleMotion = () => {
    const next = !reduceMotion;
    setReduceMotion(next);
    window.localStorage.setItem("portfolio-motion", next ? "reduce" : "full");
  };

  return (
    <>
      <header className="world-nav" data-open={open ? "true" : "false"}>
        <WorldLink href="/" world="home" className="brand-lockup" aria-label={`${siteConfig.name} 首页`} onClick={() => closeMenu()}>
          <span className="brand-glyph">{person.initials}</span>
          <span className="brand-copy"><strong>{siteConfig.shortName}</strong><small>PORTFOLIO / 2026</small></span>
        </WorldLink>

        <div className="nav-coordinate" aria-hidden="true">
          <span>WORLD</span>
          <b>{worlds.find((item) => item.key === current)?.index}</b>
        </div>

        <button ref={triggerRef} className="world-menu-trigger" type="button" onClick={() => {
          if (open) {
            closeMenu();
          } else {
            cancelPendingWorldNavigation();
            setOpenAtPath(pathname);
          }
        }} aria-expanded={open} aria-controls="world-index">
          <span>{open ? "CLOSE" : "WORLD INDEX"}</span>
          <i aria-hidden="true"><b /><b /></i>
        </button>
      </header>

      <div ref={menuRef} id="world-index" className="world-index" data-open={open ? "true" : "false"} aria-hidden={!open} inert={!open} role="dialog" aria-modal="true" aria-label="世界索引">
        <div className="world-index-grid">
          <div className="world-index-intro">
            <p>ONE IDENTITY / SEVEN WORLDS</p>
            <h2>选择下一段<br />空间坐标</h2>
            <span>所有页面拥有不同的视觉物理，但共享同一份真实资料与导航。</span>
          </div>
          <nav aria-label="全站世界导航">
            {worlds.map((world) => (
              <WorldLink
                key={world.key}
                href={world.href}
                world={world.key}
                className="world-index-link"
                aria-current={world.key === current ? "page" : undefined}
                tabIndex={open ? 0 : -1}
                onClick={() => closeMenu()}
              >
                <span>{world.index}</span>
                <strong>{world.label}</strong>
                <small>{world.englishLabel}</small>
                <i>↗</i>
              </WorldLink>
            ))}
          </nav>
          <div className="runtime-controls">
            <p>EXPERIENCE CONTROL</p>
            <button type="button" onClick={toggleMotion}>
              动效 <b>{reduceMotion ? "REDUCED" : "FULL"}</b>
            </button>
            <button type="button" onClick={() => setQuality(quality === "cinematic" ? "adaptive" : "cinematic")}>
              画质 <b>{quality === "cinematic" ? "CINEMATIC" : "ADAPTIVE"}</b>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
