"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useExperienceStore } from "./experience-store";
import { worldFromPath } from "./world-utils";

const CanvasRuntime = dynamic(() => import("./CanvasRuntime"), {
  ssr: false,
  loading: () => <div className="spatial-poster" aria-hidden="true" />,
});

gsap.registerPlugin(ScrollTrigger);

export function ExperienceHost({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [spatialReady, setSpatialReady] = useState(false);
  const setWorld = useExperienceStore((state) => state.setWorld);
  const setReduceMotion = useExperienceStore((state) => state.setReduceMotion);
  const reduceMotion = useExperienceStore((state) => state.reduceMotion);
  const transitionTarget = useExperienceStore((state) => state.transitionTarget);
  const endTransition = useExperienceStore((state) => state.endTransition);

  useEffect(() => {
    const world = worldFromPath(pathname);
    const pathChanged = previousPath.current !== pathname;
    previousPath.current = pathname;
    setWorld(world);
    document.documentElement.dataset.world = world;
    const focusFrame = pathChanged
      ? window.requestAnimationFrame(() => document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true }))
      : null;
    const finish = window.setTimeout(endTransition, 520);
    return () => {
      if (focusFrame !== null) window.cancelAnimationFrame(focusFrame);
      window.clearTimeout(finish);
    };
  }, [pathname, setWorld, endTransition]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const saved = window.localStorage.getItem("portfolio-motion");
      setReduceMotion(saved === "reduce" || (saved !== "full" && media.matches));
    };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      media.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [setReduceMotion]);

  useEffect(() => {
    if (spatialReady) return;

    const activateSpatialRuntime = () => setSpatialReady(true);
    const passiveOnce: AddEventListenerOptions = { passive: true, once: true };
    const once: AddEventListenerOptions = { once: true };

    window.addEventListener("pointermove", activateSpatialRuntime, passiveOnce);
    window.addEventListener("pointerdown", activateSpatialRuntime, passiveOnce);
    window.addEventListener("touchstart", activateSpatialRuntime, passiveOnce);
    window.addEventListener("wheel", activateSpatialRuntime, passiveOnce);
    window.addEventListener("keydown", activateSpatialRuntime, once);

    return () => {
      window.removeEventListener("pointermove", activateSpatialRuntime);
      window.removeEventListener("pointerdown", activateSpatialRuntime);
      window.removeEventListener("touchstart", activateSpatialRuntime);
      window.removeEventListener("wheel", activateSpatialRuntime);
      window.removeEventListener("keydown", activateSpatialRuntime);
    };
  }, [spatialReady]);

  useEffect(() => {
    document.documentElement.dataset.motion = reduceMotion ? "reduced" : "full";
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;

    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.82,
    });
    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);

    const onVisibility = () => (document.hidden ? lenis.stop() : lenis.start());
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, [reduceMotion]);

  useEffect(() => {
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(refreshFrame);
  }, [pathname]);

  return (
    <>
      {spatialReady ? <CanvasRuntime /> : <div className="spatial-poster" aria-hidden="true" />}
      <div className="route-veil" data-active={transitionTarget ? "true" : "false"} aria-hidden="true">
        <span>{transitionTarget ? `ENTER / ${transitionTarget.toUpperCase()}` : ""}</span>
      </div>
      {children}
    </>
  );
}
