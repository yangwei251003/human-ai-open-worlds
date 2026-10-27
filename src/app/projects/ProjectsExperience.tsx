"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CirclePause,
  CirclePlay,
  Layers3,
  Rotate3D,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { Project, ProjectCategory } from "@/data/types";
import { useExperienceStore } from "@/components/runtime/experience-store";

import styles from "./projects.module.css";

type ProjectsExperienceProps = {
  projects: Project[];
};

type FilterKey = "全部" | ProjectCategory;
type SpatialStyle = CSSProperties & Record<`--${string}`, string | number>;

const PROJECT_HASH_PREFIX = "#project-";

function wrappedOffset(index: number, focusIndex: number, length: number) {
  if (length < 2) return 0;
  let offset = index - focusIndex;
  const boundary = Math.ceil(length / 2);
  if (offset > boundary) offset -= length;
  if (offset < -boundary) offset += length;
  return offset;
}

export function ProjectsExperience({ projects }: ProjectsExperienceProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const previousSelectionRef = useRef<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const suppressClickRef = useRef(false);

  const prefersReducedMotion = useExperienceStore((state) => state.reduceMotion);
  const [filter, setFilter] = useState<FilterKey>("全部");
  const [focusIndex, setFocusIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [motionPaused, setMotionPaused] = useState(false);

  const filters = useMemo<FilterKey[]>(
    () => ["全部", ...Array.from(new Set(projects.map((project) => project.category)))],
    [projects],
  );

  const visibleProjects = useMemo(
    () => projects.filter((project) => filter === "全部" || project.category === filter),
    [filter, projects],
  );

  const focusedProject = visibleProjects[focusIndex] ?? null;
  const selectedProject = projects.find((project) => project.id === selectedId) ?? null;

  useLayoutEffect(() => {
    if (prefersReducedMotion || !rootRef.current) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void import("gsap").then(({ gsap }) => {
      if (disposed || !rootRef.current) return;
      const context = gsap.context(() => {
        gsap.fromTo(
          "[data-project-shell]",
          { y: 36 },
          { y: 0, duration: 0.9, stagger: 0.11, ease: "power3.out", clearProps: "transform" },
        );
        gsap.fromTo(
          "[data-card-surface]",
          { y: 72, rotateX: -18 },
          {
            y: 0,
            rotateX: 0,
            duration: 0.95,
            stagger: 0.08,
            delay: 0.18,
            ease: "power3.out",
            clearProps: "transform",
          },
        );
      }, rootRef);
      cleanup = () => context.revert();
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const syncSelectionFromUrl = () => {
      const hash = window.location.hash;
      if (!hash.startsWith(PROJECT_HASH_PREFIX)) {
        setSelectedId(null);
        return;
      }
      const slug = decodeURIComponent(hash.slice(PROJECT_HASH_PREFIX.length));
      const project = projects.find((item) => item.slug === slug);
      setSelectedId(project?.id ?? null);
    };

    syncSelectionFromUrl();
    window.addEventListener("popstate", syncSelectionFromUrl);
    window.addEventListener("hashchange", syncSelectionFromUrl);
    return () => {
      window.removeEventListener("popstate", syncSelectionFromUrl);
      window.removeEventListener("hashchange", syncSelectionFromUrl);
    };
  }, [projects]);

  const closeInspector = useCallback(() => {
    if (typeof window !== "undefined" && window.location.hash.startsWith(PROJECT_HASH_PREFIX)) {
      if (window.history.state?.projectOverlay) {
        window.history.back();
        return;
      }
      const url = new URL(window.location.href);
      url.hash = "";
      window.history.replaceState(window.history.state, "", url);
    }
    setSelectedId(null);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      requestAnimationFrame(() => closeRef.current?.focus());
    } else if (previousSelectionRef.current) {
      requestAnimationFrame(() => returnFocusRef.current?.focus());
    }
    previousSelectionRef.current = selectedId;
  }, [selectedId, selectedProject]);

  const openInspector = useCallback((project: Project, trigger: HTMLElement) => {
    returnFocusRef.current = trigger;
    setSelectedId(project.id);

    const url = new URL(window.location.href);
    url.hash = `project-${encodeURIComponent(project.slug)}`;
    if (window.location.hash !== url.hash) {
      window.history.pushState(
        { ...(window.history.state ?? {}), projectOverlay: true, projectId: project.id },
        "",
        url,
      );
    }
  }, []);

  const moveFocus = useCallback(
    (direction: number, moveDomFocus = true) => {
      if (!visibleProjects.length) return;
      const nextIndex = (focusIndex + direction + visibleProjects.length) % visibleProjects.length;
      setFocusIndex(nextIndex);
      if (moveDomFocus) requestAnimationFrame(() => cardRefs.current[nextIndex]?.focus());
    },
    [focusIndex, visibleProjects.length],
  );

  const handleCardKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(-1);
    }
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveFocus(1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      setFocusIndex(0);
      requestAnimationFrame(() => cardRefs.current[0]?.focus());
    }
    if (event.key === "End") {
      event.preventDefault();
      const last = visibleProjects.length - 1;
      setFocusIndex(last);
      requestAnimationFrame(() => cardRefs.current[last]?.focus());
    }
    if ((event.key === "Enter" || event.key === " ") && index !== focusIndex) {
      event.preventDefault();
      setFocusIndex(index);
    }
  };

  const handleStagePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    suppressClickRef.current = false;
    dragStartRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  };

  const handleStagePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start || start.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) > 44 && Math.abs(deltaX) > Math.abs(deltaY)) {
      suppressClickRef.current = true;
      moveFocus(deltaX < 0 ? 1 : -1, false);
      requestAnimationFrame(() => {
        suppressClickRef.current = false;
      });
    }
  };

  const handleInspectorKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeInspector();
      return;
    }
    if (event.key !== "Tab" || !inspectorRef.current) return;

    const focusable = Array.from(
      inspectorRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const selectFilter = (nextFilter: FilterKey) => {
    setFilter(nextFilter);
    setFocusIndex(0);
    requestAnimationFrame(() => cardRefs.current[0]?.focus());
  };

  return (
    <main
      ref={rootRef}
      id="main-content"
      tabIndex={-1}
      className={`${styles.page} ${motionPaused ? styles.motionPaused : ""} ${prefersReducedMotion ? styles.reduceMotion : ""}`}
      data-page-theme="projects"
    >
      <div className={styles.blueprintGrid} aria-hidden="true" />
      <section className={styles.intro} data-project-shell aria-labelledby="projects-title">
        <div className={styles.introIndex}>
          <span>WORLD 01</span>
          <span>AI LAB / ACTIVE INVENTORY</span>
        </div>
        <div className={styles.introCopy}>
          <p className={styles.eyebrow}>把作品当作可以拆解、检查与复盘的实验样本</p>
          <h1 id="projects-title">
            把项目拖进
            <span>检查台。</span>
          </h1>
          <p className={styles.lede}>
            不只看成品。逐层检查真实问题、我的工作、AI 的协作边界，以及结果是否经得起验证。
          </p>
        </div>
        <dl className={styles.projectReadout} aria-label="项目概览">
          <div>
            <dt>样本</dt>
            <dd>{String(projects.length).padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>类别</dt>
            <dd>{String(filters.length - 1).padStart(2, "0")}</dd>
          </div>
          <div>
            <dt>主导原则</dt>
            <dd>证据优先</dd>
          </div>
        </dl>
      </section>

      <section className={styles.workbench} data-project-shell aria-labelledby="workbench-title">
        <div className={styles.toolbar}>
          <div>
            <h2 id="workbench-title">项目工作台</h2>
          </div>
          <div className={styles.filters} role="group" aria-label="按项目类别筛选">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                className={styles.filterButton}
                data-active={filter === item}
                aria-pressed={filter === item}
                onClick={() => selectFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.motionToggle}
            aria-pressed={motionPaused}
            onClick={() => setMotionPaused((paused) => !paused)}
          >
            {motionPaused ? <CirclePlay aria-hidden="true" /> : <CirclePause aria-hidden="true" />}
            {motionPaused ? "继续环境动态" : "暂停环境动态"}
          </button>
        </div>

        <p className={styles.resultStatus} aria-live="polite">
          当前显示 {visibleProjects.length} 个项目；使用左右方向键或横向甩动切换，按 Enter 送入检查台。
        </p>

        {visibleProjects.length ? (
          <div
            ref={stageRef}
            className={styles.stage}
            role="group"
            aria-label="可旋转项目样本台"
            onPointerDown={handleStagePointerDown}
            onPointerUp={handleStagePointerUp}
            onPointerCancel={() => {
              dragStartRef.current = null;
            }}
            onWheel={(event) => {
              if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 18) {
                moveFocus(event.deltaX > 0 ? 1 : -1, false);
              }
            }}
          >
            <div className={styles.stageCoordinates} aria-hidden="true">
              <span>Y 34° 16&apos; 08&apos;&apos;</span>
              <span>X 118° 04&apos; 22&apos;&apos;</span>
            </div>
            <div className={styles.stageFloor} aria-hidden="true" />

            {visibleProjects.map((project, index) => {
              const offset = wrappedOffset(index, focusIndex, visibleProjects.length);
              const distance = Math.abs(offset);
              const spatialStyle: SpatialStyle = {
                "--offset": offset,
                "--distance": Math.min(distance, 3),
                "--project-order": index,
              };
              const isFocused = index === focusIndex;

              return (
                <button
                  key={project.id}
                  id={`project-${project.slug}`}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  type="button"
                  className={styles.projectCard}
                  style={spatialStyle}
                  data-project-card
                  data-active={isFocused}
                  data-distant={distance > 2}
                  tabIndex={isFocused ? 0 : -1}
                  aria-current={isFocused ? "true" : undefined}
                  aria-haspopup="dialog"
                  aria-label={`${project.title}，${project.category}，${isFocused ? "按 Enter 打开检查台" : "按方向键移动到此项目"}`}
                  onFocus={() => setFocusIndex(index)}
                  onKeyDown={(event) => handleCardKeyDown(event, index)}
                  onClick={(event) => {
                    if (suppressClickRef.current) {
                      suppressClickRef.current = false;
                      return;
                    }
                    if (!isFocused) {
                      setFocusIndex(index);
                      return;
                    }
                    openInspector(project, event.currentTarget);
                  }}
                >
                  <span className={styles.cardSurface} data-card-surface>
                    <span className={styles.cardRail} aria-hidden="true">MODULE / {project.id}</span>
                    <span className={styles.cardMeta}>
                      <b>{project.id}</b>
                      <span>{project.category}</span>
                      <span>{project.year}</span>
                    </span>
                    <span className={styles.assetStage} aria-hidden="true">
                      <span className={styles.assetGlyph}>{project.title.slice(0, 2).toUpperCase()}</span>
                      <span className={styles.assetGrid} />
                      <small>{project.asset.label}<em>{project.asset.replaceKey}</em></small>
                    </span>
                    <span className={styles.cardTitle}>{project.title}</span>
                    <span className={styles.cardSummary}>{project.summary}</span>
                    <span className={styles.cardFooter}>
                      <span>{project.status}</span>
                      <span className={styles.inspectCall}>
                        {isFocused ? "送入检查台" : "移动至中央"}
                        <ArrowUpRight aria-hidden="true" />
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}

            <button
              type="button"
              className={`${styles.stageControl} ${styles.stageControlPrevious}`}
              onClick={() => moveFocus(-1)}
              aria-label="上一个项目"
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`${styles.stageControl} ${styles.stageControlNext}`}
              onClick={() => moveFocus(1)}
              aria-label="下一个项目"
            >
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className={styles.emptyState} role="status">
            <Layers3 aria-hidden="true" />
            <h3>这组坐标还没有项目</h3>
            <p>清除筛选，重新查看全部实验样本。</p>
            <button type="button" onClick={() => selectFilter("全部")}>
              清除筛选
            </button>
          </div>
        )}

        {focusedProject ? (
          <div className={styles.focusReadout} aria-hidden="true">
            <span>FOCUS</span>
            <strong>{focusedProject.id}</strong>
            <span>{String(focusIndex + 1).padStart(2, "0")} / {String(visibleProjects.length).padStart(2, "0")}</span>
          </div>
        ) : null}
      </section>

      <section className={styles.protocol} data-project-shell aria-labelledby="protocol-title">
        <div>
          <h2 id="protocol-title">每个项目，都用四层证据说话。</h2>
        </div>
        <ol>
          <li><span>01</span><strong>真实问题</strong><p>为什么值得做，以及谁会因此发生变化。</p></li>
          <li><span>02</span><strong>本人工作</strong><p>由我承担的产品、设计、代码与判断。</p></li>
          <li><span>03</span><strong>AI 协作</strong><p>模型做了什么，以及人保留了哪些责任。</p></li>
          <li><span>04</span><strong>结果复盘</strong><p>已验证的结果，或诚实标注的下一步。</p></li>
        </ol>
      </section>

      {selectedProject ? (
        <div
          className={styles.inspectorBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeInspector();
          }}
        >
          <div
            ref={inspectorRef}
            className={styles.inspector}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-inspector-title"
            onKeyDown={handleInspectorKeyDown}
          >
            <div className={styles.inspectorTopline}>
              <span>INSPECTION ACTIVE / {selectedProject.id}</span>
              <button ref={closeRef} type="button" onClick={closeInspector} aria-label="关闭项目检查台">
                <X aria-hidden="true" />
              </button>
            </div>

            <div className={styles.inspectorHero}>
              <div className={styles.inspectorAsset} role="img" aria-label={selectedProject.asset.alt}>
                <span>{selectedProject.asset.label}</span>
                <strong>{selectedProject.title.slice(0, 2).toUpperCase()}</strong>
                <small>{selectedProject.asset.replaceKey} · {selectedProject.asset.ratio}</small>
              </div>
              <div>
                <p>{selectedProject.category} / {selectedProject.year} / {selectedProject.status}</p>
                <h2 id="project-inspector-title">{selectedProject.title}</h2>
                <p>{selectedProject.summary}</p>
                <div className={styles.inspectorLinks}>
                  {selectedProject.demoUrl ? (
                    <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer">
                      打开演示 <ArrowUpRight aria-hidden="true" />
                    </a>
                  ) : (
                    <span>演示链接待补充</span>
                  )}
                  {selectedProject.sourceUrl ? (
                    <a href={selectedProject.sourceUrl} target="_blank" rel="noopener noreferrer">
                      查看源码 <ArrowUpRight aria-hidden="true" />
                    </a>
                  ) : (
                    <span>源码链接待补充</span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.evidenceGrid}>
              <article>
                <span><Sparkles aria-hidden="true" /> 01 / PROBLEM</span>
                <h3>真实问题</h3>
                <p>{selectedProject.problem}</p>
              </article>
              <article>
                <span><UserRound aria-hidden="true" /> 02 / HUMAN</span>
                <h3>本人工作</h3>
                <p>{selectedProject.role}</p>
              </article>
              <article>
                <span><Bot aria-hidden="true" /> 03 / AI</span>
                <h3>AI 协作</h3>
                <p>{selectedProject.aiRole}</p>
              </article>
              <article>
                <span><Rotate3D aria-hidden="true" /> 04 / OUTCOME</span>
                <h3>结果与复盘</h3>
                <p>{selectedProject.result}</p>
                <blockquote>{selectedProject.reflection}</blockquote>
              </article>
            </div>

            <div className={styles.inspectorFooter}>
              <div>
                <span>FEATURES</span>
                <ul>{selectedProject.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              </div>
              <div>
                <span>STACK</span>
                <ul>{selectedProject.stack.map((technology) => <li key={technology}>{technology}</li>)}</ul>
              </div>
              <button type="button" onClick={closeInspector}>完成检查</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
