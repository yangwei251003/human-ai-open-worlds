"use client";

import { useEffect, useRef, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { publicPath } from "@/lib/public-path";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { WorldLink } from "@/components/navigation/WorldLink";
import { useExperienceStore } from "@/components/runtime/experience-store";
import { honors, projects } from "@/data/content";
import { person, worlds } from "@/data/site";
import styles from "./home.module.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const portalPositions = [
  { x: "53%", y: "9%", z: "-30px" },
  { x: "78%", y: "22%", z: "48px" },
  { x: "83%", y: "56%", z: "110px" },
  { x: "61%", y: "78%", z: "10px" },
  { x: "33%", y: "71%", z: "72px" },
  { x: "20%", y: "40%", z: "-20px" },
] as const;

type PortalPointer = {
  id: number;
  pointerType: string;
  captureTarget: HTMLElement;
  x: number;
  y: number;
};

type GestureValues = {
  x: number;
  y: number;
  rotation: number;
  scale: number;
};

type SingleGestureStart = {
  pointerId: number;
  originX: number;
  originY: number;
  values: GestureValues;
};

type PinchGestureStart = {
  distance: number;
  centerX: number;
  values: GestureValues;
};

const restingGesture: GestureValues = { x: 0, y: 0, rotation: 0, scale: 1 };

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getGestureValues(element: HTMLElement): GestureValues {
  const computed = window.getComputedStyle(element);
  const readValue = (name: string, fallback: number) => {
    const value = Number.parseFloat(computed.getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };

  return {
    x: readValue("--gesture-x", 0),
    y: readValue("--gesture-y", 0),
    rotation: readValue("--gesture-rotate", 0),
    scale: readValue("--gesture-scale", 1),
  };
}

function setGestureValues(element: HTMLElement, values: GestureValues) {
  element.style.setProperty("--gesture-x", `${values.x}px`);
  element.style.setProperty("--gesture-y", `${values.y}px`);
  element.style.setProperty("--gesture-rotate", `${values.rotation}deg`);
  element.style.setProperty("--gesture-scale", values.scale.toString());
}

function getPointerDistance(first: PortalPointer, second: PortalPointer) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

export function HeroPortal() {
  const root = useRef<HTMLElement>(null);
  const portalField = useRef<HTMLDivElement>(null);
  const activePointers = useRef(new Map<number, PortalPointer>());
  const singleGestureStart = useRef<SingleGestureStart | null>(null);
  const pinchGestureStart = useRef<PinchGestureStart | null>(null);
  const gestureEngaged = useRef(false);
  const pendingGesture = useRef<GestureValues>(restingGesture);
  const gestureFrame = useRef<number | null>(null);
  const returnTween = useRef<gsap.core.Tween | null>(null);
  const suppressNextClick = useRef(false);
  const suppressionTimer = useRef<number | null>(null);
  const reduceMotion = useExperienceStore((state) => state.reduceMotion);
  const destinations = worlds.filter((world) => world.key !== "home");

  const flushGesture = () => {
    const field = portalField.current;
    if (!field) return;
    setGestureValues(field, pendingGesture.current);
    gestureFrame.current = null;
  };

  const queueGesture = (values: GestureValues) => {
    pendingGesture.current = values;
    if (gestureFrame.current !== null) return;
    gestureFrame.current = window.requestAnimationFrame(flushGesture);
  };

  const stopReturnTween = () => {
    returnTween.current?.kill();
    returnTween.current = null;
  };

  const returnToRest = (instant = false) => {
    const field = portalField.current;
    if (!field) return;

    if (gestureFrame.current !== null) {
      window.cancelAnimationFrame(gestureFrame.current);
      gestureFrame.current = null;
      setGestureValues(field, pendingGesture.current);
    }

    stopReturnTween();
    if (instant) {
      pendingGesture.current = restingGesture;
      setGestureValues(field, restingGesture);
      return;
    }

    returnTween.current = gsap.to(field, {
      "--gesture-x": "0px",
      "--gesture-y": "0px",
      "--gesture-rotate": "0deg",
      "--gesture-scale": 1,
      duration: 0.68,
      ease: "expo.out",
      overwrite: "auto",
      onComplete: () => {
        pendingGesture.current = restingGesture;
        returnTween.current = null;
      },
    });
  };

  const captureActivePointers = () => {
    activePointers.current.forEach((pointer) => {
      if (!pointer.captureTarget.hasPointerCapture(pointer.id)) {
        try {
          pointer.captureTarget.setPointerCapture(pointer.id);
        } catch {
          // A browser may cancel a touch pointer while handing vertical motion to scrolling.
        }
      }
    });
  };

  const rebaseGesture = () => {
    const field = portalField.current;
    if (!field) return;
    if (gestureFrame.current !== null) {
      window.cancelAnimationFrame(gestureFrame.current);
      gestureFrame.current = null;
      setGestureValues(field, pendingGesture.current);
    }
    const pointers = Array.from(activePointers.current.values());
    const values = getGestureValues(field);

    if (pointers.length >= 2) {
      const [first, second] = pointers;
      singleGestureStart.current = null;
      pinchGestureStart.current = {
        distance: Math.max(getPointerDistance(first, second), 1),
        centerX: (first.x + second.x) / 2,
        values,
      };
      return;
    }

    pinchGestureStart.current = null;
    if (pointers.length === 1) {
      singleGestureStart.current = {
        pointerId: pointers[0].id,
        originX: pointers[0].x,
        originY: pointers[0].y,
        values,
      };
    } else {
      singleGestureStart.current = null;
    }
  };

  const beginGesture = (field: HTMLDivElement) => {
    if (gestureEngaged.current) return;
    gestureEngaged.current = true;
    field.dataset.dragging = "true";
    captureActivePointers();
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotion || (event.pointerType === "mouse" && event.button !== 0)) return;

    stopReturnTween();
    const pointer: PortalPointer = {
      id: event.pointerId,
      pointerType: event.pointerType,
      captureTarget: event.currentTarget,
      x: event.clientX,
      y: event.clientY,
    };
    activePointers.current.set(event.pointerId, pointer);
    rebaseGesture();
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotion) return;
    const pointer = activePointers.current.get(event.pointerId);
    const field = portalField.current;
    if (!pointer || !field) return;

    pointer.x = event.clientX;
    pointer.y = event.clientY;
    const pointers = Array.from(activePointers.current.values());

    if (pointers.length >= 2 && pinchGestureStart.current) {
      const [first, second] = pointers;
      const start = pinchGestureStart.current;
      const distance = getPointerDistance(first, second);
      const centerX = (first.x + second.x) / 2;
      const distanceDelta = distance - start.distance;
      const centerDelta = centerX - start.centerX;

      if (!gestureEngaged.current && (Math.abs(distanceDelta) > 6 || Math.abs(centerDelta) > 8)) {
        beginGesture(field);
      }
      if (!gestureEngaged.current) return;

      const distanceRatio = distance / start.distance;
      queueGesture({
        x: clamp(start.values.x + centerDelta * 0.24, -54, 54),
        y: start.values.y,
        rotation: clamp(start.values.rotation + centerDelta * 0.012, -2.8, 2.8),
        scale: clamp(start.values.scale * (1 + (distanceRatio - 1) * 0.32), 0.94, 1.08),
      });
      event.preventDefault();
      return;
    }

    const start = singleGestureStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const deltaX = pointer.x - start.originX;
    const deltaY = pointer.y - start.originY;
    const horizontalTouch = pointer.pointerType === "touch";

    if (!gestureEngaged.current) {
      const hasHorizontalIntent = Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15;
      const hasDesktopIntent = Math.hypot(deltaX, deltaY) > 6;
      if (horizontalTouch ? hasHorizontalIntent : hasDesktopIntent) {
        beginGesture(field);
      }
    }
    if (!gestureEngaged.current) return;

    queueGesture(horizontalTouch ? {
      x: clamp(start.values.x + deltaX * 0.42, -46, 46),
      y: start.values.y,
      rotation: clamp(start.values.rotation + deltaX * 0.02, -2.5, 2.5),
      scale: start.values.scale,
    } : {
      x: clamp(start.values.x + deltaX * 0.36, -62, 62),
      y: clamp(start.values.y + deltaY * 0.24, -34, 34),
      rotation: clamp(start.values.rotation + deltaX * 0.016 - deltaY * 0.009, -3.2, 3.2),
      scale: start.values.scale,
    });
    event.preventDefault();
  };

  const finishPointer = (event: ReactPointerEvent<HTMLElement>, cancelled: boolean) => {
    const field = portalField.current;
    if (!activePointers.current.has(event.pointerId) || !field) return;

    const pointer = activePointers.current.get(event.pointerId);
    if (!pointer) return;
    activePointers.current.delete(event.pointerId);
    if (pointer.captureTarget.hasPointerCapture(event.pointerId)) {
      try {
        pointer.captureTarget.releasePointerCapture(event.pointerId);
      } catch {
        // The user agent may have already released a cancelled pointer.
      }
    }

    if (activePointers.current.size > 0) {
      rebaseGesture();
      return;
    }

    if (gestureEngaged.current && !cancelled) {
      suppressNextClick.current = true;
      if (suppressionTimer.current !== null) window.clearTimeout(suppressionTimer.current);
      suppressionTimer.current = window.setTimeout(() => {
        suppressNextClick.current = false;
        suppressionTimer.current = null;
      }, 360);
    }

    gestureEngaged.current = false;
    field.dataset.dragging = "false";
    singleGestureStart.current = null;
    pinchGestureStart.current = null;
    returnToRest(reduceMotion);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLElement>) => {
    if (!suppressNextClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressNextClick.current = false;
    if (suppressionTimer.current !== null) {
      window.clearTimeout(suppressionTimer.current);
      suppressionTimer.current = null;
    }
  };

  const handleLostPointerCapture = (event: ReactPointerEvent<HTMLElement>) => {
    if (!activePointers.current.has(event.pointerId)) return;
    activePointers.current.delete(event.pointerId);
    if (activePointers.current.size > 0) {
      rebaseGesture();
      return;
    }
    gestureEngaged.current = false;
    const field = portalField.current;
    if (field) field.dataset.dragging = "false";
    returnToRest(reduceMotion);
  };

  useEffect(() => {
    const field = portalField.current;
    if (!field) return;

    if (reduceMotion) {
      activePointers.current.forEach((pointer) => {
        if (pointer.captureTarget.hasPointerCapture(pointer.id)) pointer.captureTarget.releasePointerCapture(pointer.id);
      });
      activePointers.current.clear();
      gestureEngaged.current = false;
      suppressNextClick.current = false;
      field.dataset.dragging = "false";
      if (gestureFrame.current !== null) {
        window.cancelAnimationFrame(gestureFrame.current);
        gestureFrame.current = null;
      }
      returnTween.current?.kill();
      returnTween.current = null;
      pendingGesture.current = restingGesture;
      setGestureValues(field, restingGesture);
    }

    return () => {
      if (gestureFrame.current !== null) window.cancelAnimationFrame(gestureFrame.current);
      if (suppressionTimer.current !== null) window.clearTimeout(suppressionTimer.current);
      returnTween.current?.kill();
    };
  }, [reduceMotion]);

  useGSAP(() => {
    if (reduceMotion) return;

    const mm = gsap.matchMedia();
    mm.add({
      desktop: "(min-width: 901px)",
      mobile: "(max-width: 900px)",
    }, (context) => {
      const { desktop } = context.conditions as { desktop: boolean; mobile: boolean };
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .from(
          [`.${styles.eyebrow}`, `.${styles.lede}`, `.${styles.actions}`],
          { yPercent: 72, autoAlpha: 0, duration: 0.82, stagger: 0.08 },
        )
        .fromTo(`.${styles.portalNode}`, {
          "--node-scale": "0.38",
          autoAlpha: 0,
        }, {
          "--node-scale": "1",
          autoAlpha: 1,
          duration: 0.9,
          stagger: { amount: 0.6, from: "random" },
          onComplete: () => {
            root.current?.querySelectorAll<HTMLElement>(`.${styles.portalNode}`).forEach((node) => {
              node.style.removeProperty("--node-scale");
              node.style.removeProperty("opacity");
              node.style.removeProperty("visibility");
            });
          },
        }, "-=0.48");

      gsap.to(`.${styles.portalField}`, {
        "--scroll-rotate": desktop ? "16deg" : "0deg",
        "--scroll-y": desktop ? "18%" : "-6%",
        ease: "none",
        scrollTrigger: {
          trigger: `.${styles.hero}`,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      const panels = gsap.utils.toArray<HTMLElement>(`.${styles.statement}`);
      panels.forEach((panel, index) => {
        if (index === panels.length - 1) return;
        gsap.to(panel, {
          scale: 0.9,
          autoAlpha: 0.28,
          ease: "none",
          scrollTrigger: {
            trigger: panels[index + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });

      gsap.to(`.${styles.evidenceTrack}`, {
        xPercent: desktop ? -24 : -48,
        ease: "none",
        scrollTrigger: {
          trigger: `.${styles.evidence}`,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    return () => mm.revert();
  }, { scope: root, dependencies: [reduceMotion], revertOnUpdate: true });

  return (
    <main ref={root} id="main-content" tabIndex={-1} className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>PERSONAL UNIVERSE / AI-BUILT</p>
          <h1 id="hero-title"><span>{person.name}</span><span>AI BUILDER</span></h1>
          <p className={styles.lede}>七个视觉世界，记录作品、荣誉、履历、思考与真实生活。</p>
          <div className={styles.actions}>
            <WorldLink href="/projects" world="projects" className={styles.primaryAction}>查看项目 <span>↗</span></WorldLink>
            <WorldLink href="/resume" world="resume" className={styles.secondaryAction}>打开履历</WorldLink>
          </div>
        </div>

        <div
          ref={portalField}
          className={styles.portalField}
          role="group"
          aria-label="七个世界入口，可拖动探索并直接打开链接"
          data-dragging="false"
          data-reduced-motion={reduceMotion ? "true" : "false"}
          onClickCapture={handleClickCapture}
        >
          <div
            className={styles.gesturePlane}
            aria-hidden="true"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={(event) => finishPointer(event, false)}
            onPointerCancel={(event) => finishPointer(event, true)}
            onLostPointerCapture={handleLostPointerCapture}
          />
          <div className={styles.orbitDisc} aria-hidden="true"><i /><i /><i /></div>
          <div className={styles.identityCore} aria-hidden="true"><span>{person.initials}</span></div>
          {destinations.map((world, index) => (
            <WorldLink
              key={world.key}
              href={world.href}
              world={world.key}
              className={styles.portalNode}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={(event) => finishPointer(event, false)}
              onPointerCancel={(event) => finishPointer(event, true)}
              onLostPointerCapture={handleLostPointerCapture}
              style={{
                "--portal-x": portalPositions[index].x,
                "--portal-y": portalPositions[index].y,
                "--portal-z": portalPositions[index].z,
                "--mobile-y": `${4 + index * 14}%`,
                "--mobile-right": `${2.2 + index * 0.9}rem`,
                "--mobile-z": `${(index - 3) * 18}px`,
              } as React.CSSProperties}
            >
              <span className={styles.portalOrb}><i /></span>
              <span className={styles.portalLabel}><small>{world.index}</small><strong>{world.label}</strong><em>{world.action}</em></span>
            </WorldLink>
          ))}
        </div>

        <div className={styles.heroFacts}>
          <div><b>{projects.length.toString().padStart(2, "0")}</b><span>项目结构已就位</span></div>
          <div><b>{honors.length.toString().padStart(2, "0")}</b><span>荣誉位置待替换</span></div>
          <div><b>07</b><span>独立视觉世界</span></div>
        </div>
      </section>

      <section className={styles.statements} aria-label="网站方法">
        <article className={styles.statement}>
          <span className={styles.statementIndex} aria-hidden="true">做</span>
          <p>这里不只陈列结果。</p>
          <h2>把模糊想法<br />推进到可体验。</h2>
          <span className={styles.statementNote}>每个项目都会区分本人判断、AI 协作与可验证结果。</span>
        </article>
        <article className={styles.statement}>
          <span className={styles.statementIndex} aria-hidden="true">异</span>
          <p>不同页面，不同物理。</p>
          <h2>同一个人，<br />七种观察方式。</h2>
          <span className={styles.statementNote}>工作台、展厅、排版机械、书页、影院与暗房各自拥有独立交互。</span>
        </article>
        <article className={styles.statement}>
          <span className={styles.statementIndex} aria-hidden="true">真</span>
          <p>占位不是伪装。</p>
          <h2>真实资料到来前，<br />空位也诚实。</h2>
          <span className={styles.statementNote}>头像、品牌、链接与媒体都标注替换状态，不制造虚假履历。</span>
        </article>
      </section>

      <section className={styles.evidence} aria-label="精选项目预览">
        <div className={styles.evidenceTrack}>
          {projects.filter((project) => project.featured).map((project, index) => (
            <article key={project.id} className={styles.projectSpecimen}>
              <div className={styles.specimenVisual} data-variant={index} aria-label={project.asset.alt} role="img">
                {index === 0 && project.asset.src ? (
                  <Image
                    src={publicPath(project.asset.src)}
                    alt={project.asset.alt}
                    fill
                    sizes="(max-width: 900px) 84vw, 64rem"
                    className={styles.specimenImage}
                  />
                ) : null}
                <i /><i /><i /><span>{project.id}</span><small>{project.asset.label}</small>
              </div>
              <div className={styles.specimenCopy}>
                <span>{project.category} / {project.status}</span>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.exitSection}>
        <div>
          <h2>下一步，进入作品。</h2>
          <p>{person.tagline}</p>
        </div>
        <WorldLink href="/projects" world="projects" className={styles.exitPortal}>
          <span>OPEN AI LAB</span><i>↗</i>
        </WorldLink>
      </section>
    </main>
  );
}
