"use client";

import { publicPath } from "@/lib/public-path";

import {
  ArrowUpRight,
  ChevronDown,
  FileText,
  Mail,
  MapPin,
  Printer,
  ScanLine,
  Sparkles,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import type { Capability, Experience, Person, Project } from "@/data/types";
import { useExperienceStore } from "@/components/runtime/experience-store";

import styles from "./resume.module.css";

type ResumeExperienceProps = {
  person: Person;
  experiences: Experience[];
  capabilities: Capability[];
  projects: Project[];
};

type CapabilityFilter = "all" | string;

const socialLabels: Record<keyof Person["links"], string> = {
  github: "GitHub",
  bilibili: "哔哩哔哩",
  xiaohongshu: "小红书",
  linkedin: "LinkedIn",
};

export function ResumeExperience({ person, experiences, capabilities, projects }: ResumeExperienceProps) {
  const rootRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const capabilityRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const printTimerRef = useRef<number | null>(null);

  const prefersReducedMotion = useExperienceStore((state) => state.reduceMotion);
  const [selectedCapabilityId, setSelectedCapabilityId] = useState<CapabilityFilter>("all");
  const [expandedExperienceId, setExpandedExperienceId] = useState<string | null>(experiences[0]?.id ?? null);
  const [isFolding, setIsFolding] = useState(false);
  const [printStatus, setPrintStatus] = useState("");

  const selectedCapability = capabilities.find((capability) => capability.id === selectedCapabilityId) ?? null;
  const selectedProjectIds = useMemo(
    () => new Set(selectedCapability?.relatedProjectIds ?? []),
    [selectedCapability],
  );

  const relatedProjects = useMemo(
    () => projects.filter((project) => selectedProjectIds.has(project.id)),
    [projects, selectedProjectIds],
  );

  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const socialLinks = useMemo(
    () =>
      (Object.entries(person.links) as Array<[keyof Person["links"], string | undefined]>).filter(
        (entry): entry is [keyof Person["links"], string] => Boolean(entry[1]),
      ),
    [person.links],
  );

  useLayoutEffect(() => {
    if (prefersReducedMotion || !rootRef.current || !timelineRef.current) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (disposed || !rootRef.current || !timelineRef.current) return;
        gsap.registerPlugin(ScrollTrigger);
        const context = gsap.context(() => {
          if (pathRef.current) {
            gsap.fromTo(
              pathRef.current,
              { strokeDashoffset: 1 },
              {
                strokeDashoffset: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: timelineRef.current,
                  start: "top 72%",
                  end: "bottom 76%",
                  scrub: 0.35,
                },
              },
            );
          }

          const items = gsap.utils.toArray<HTMLElement>("[data-resume-panel]");
          items.forEach((item, index) => {
            gsap.fromTo(
              item,
              {
                x: index % 2 === 0 ? -54 : 54,
                rotateY: index % 2 === 0 ? 5 : -5,
              },
              {
                x: 0,
                rotateY: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: item,
                  start: "top 84%",
                  toggleActions: "play none none reverse",
                },
              },
            );
          });
        }, rootRef);
        cleanup = () => context.revert();
      },
    );

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [prefersReducedMotion]);

  const clearPrintTimer = useCallback(() => {
    if (printTimerRef.current !== null) {
      window.clearTimeout(printTimerRef.current);
      printTimerRef.current = null;
    }
  }, []);

  const printNow = useCallback(() => {
    clearPrintTimer();
    setIsFolding(false);
    setPrintStatus("系统打印窗口已打开。取消打印后可继续浏览当前履历位置。");
    window.print();
  }, [clearPrintTimer]);

  const startPrint = useCallback(() => {
    if (prefersReducedMotion || isFolding) {
      printNow();
      return;
    }

    setIsFolding(true);
    setPrintStatus("正在把动态档案折叠为可打印简历。再次按下按钮可跳过动画。");
    printTimerRef.current = window.setTimeout(printNow, 780);
  }, [isFolding, prefersReducedMotion, printNow]);

  useEffect(() => {
    const cancelFold = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !printTimerRef.current) return;
      clearPrintTimer();
      setIsFolding(false);
      setPrintStatus("已取消折叠，履历保持原状态。");
    };
    const resetAfterPrint = () => {
      clearPrintTimer();
      setIsFolding(false);
    };

    window.addEventListener("keydown", cancelFold);
    window.addEventListener("afterprint", resetAfterPrint);
    return () => {
      window.removeEventListener("keydown", cancelFold);
      window.removeEventListener("afterprint", resetAfterPrint);
      clearPrintTimer();
    };
  }, [clearPrintTimer]);

  const selectCapability = (id: CapabilityFilter) => {
    setSelectedCapabilityId(id);
  };

  const handleCapabilityKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = capabilities.length + 1;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + count) % count;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % count;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = count - 1;

    const nextId = nextIndex === 0 ? "all" : capabilities[nextIndex - 1]?.id ?? "all";
    selectCapability(nextId);
    requestAnimationFrame(() => capabilityRefs.current[nextIndex]?.focus());
  };

  const experienceMatches = (experience: Experience) =>
    !selectedCapability || experience.relatedProjectIds.some((id) => selectedProjectIds.has(id));

  return (
    <main
      ref={rootRef}
      id="main-content"
      tabIndex={-1}
      className={`${styles.page} ${isFolding ? styles.isFolding : ""} ${prefersReducedMotion ? styles.reduceMotion : ""}`}
      data-page-theme="resume"
      data-resume-print-root
    >
      <div className={styles.registrationGrid} aria-hidden="true" />
      <div className={styles.printControls} data-no-print>
        <span>WORLD 03 / SWISS CV</span>
        <button type="button" onClick={startPrint} aria-describedby="print-status">
          {isFolding ? <ScanLine aria-hidden="true" /> : <Printer aria-hidden="true" />}
          {isFolding ? "跳过动画并打印" : "折叠为打印简历"}
        </button>
      </div>
      <p id="print-status" className={styles.srStatus} aria-live="polite">
        {printStatus}
      </p>

      <div className={styles.document}>
        <section className={styles.resumeHero} aria-labelledby="resume-title">
          <div className={styles.heroCode} aria-hidden="true">
            <span>FILE / CV-03</span>
            <span>STATUS / OPEN TO UPDATE</span>
          </div>
          <div className={styles.identityBlock}>
            <p className={styles.eyebrow}>AI 产品开发者 / 在校创造者</p>
            <h1 id="resume-title">{person.name}</h1>
            <p className={styles.titleLine}>{person.title}</p>
            <p className={styles.tagline}>{person.tagline}</p>
          </div>
          <div className={styles.monogram} role="img" aria-label="个人头像占位，等待替换为真实头像">
            <span>{person.initials}</span>
            <small>头像待替换</small>
          </div>
          <aside className={styles.contactSheet} aria-label="联系与状态">
            <div>
              <MapPin aria-hidden="true" />
              <span>{person.location}</span>
            </div>
            <div>
              <Sparkles aria-hidden="true" />
              <span>{person.availability}</span>
            </div>
            {person.email ? (
              <a href={`mailto:${person.email}`}>
                <Mail aria-hidden="true" /> {person.email}
              </a>
            ) : (
              <div>
                <Mail aria-hidden="true" />
                <span>电子邮箱待补充</span>
              </div>
            )}
            {socialLinks.length ? (
              socialLinks.map(([key, url]) => (
                <a key={key} href={url} target="_blank" rel="noopener noreferrer">
                  {socialLabels[key]} <ArrowUpRight aria-hidden="true" />
                </a>
              ))
            ) : (
              <div><FileText aria-hidden="true" /><span>公开主页链接待补充</span></div>
            )}
          </aside>
        </section>

        <section className={styles.profileStrip} aria-labelledby="profile-title">
          <div>
            <p className={styles.sectionCode}>00 / PROFILE</p>
            <h2 id="profile-title">把模糊想法，推进成能被体验和验证的作品。</h2>
          </div>
          <div className={styles.bioColumns}>
            {person.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <p className={styles.statusLine}>{person.statusLine}</p>
        </section>

        <section className={styles.capabilityMachine} aria-labelledby="capability-title">
          <div className={styles.machineHeader}>
            <div>
              <h2 id="capability-title">能力不是标签，是可追溯的项目证据。</h2>
            </div>
            <p>选择能力，履历路径会重新强调与之相关的经历和作品。</p>
          </div>

          <div className={styles.capabilityRail} role="tablist" aria-label="按能力查看履历证据">
            <button
              ref={(node) => { capabilityRefs.current[0] = node; }}
              type="button"
              role="tab"
              id="capability-tab-all"
              aria-controls="capability-panel"
              aria-selected={selectedCapabilityId === "all"}
              tabIndex={selectedCapabilityId === "all" ? 0 : -1}
              onClick={() => selectCapability("all")}
              onKeyDown={(event) => handleCapabilityKeyDown(event, 0)}
            >
              <span>00</span>
              <strong>全部能力</strong>
              <small>完整履历</small>
            </button>
            {capabilities.map((capability, index) => (
              <button
                key={capability.id}
                ref={(node) => { capabilityRefs.current[index + 1] = node; }}
                type="button"
                role="tab"
                id={`capability-tab-${capability.id}`}
                aria-controls="capability-panel"
                aria-selected={selectedCapabilityId === capability.id}
                tabIndex={selectedCapabilityId === capability.id ? 0 : -1}
                onClick={() => selectCapability(capability.id)}
                onKeyDown={(event) => handleCapabilityKeyDown(event, index + 1)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{capability.title}</strong>
                <small>{capability.category}</small>
              </button>
            ))}
          </div>

          <div
            id="capability-panel"
            className={styles.capabilityReadout}
            role="tabpanel"
            aria-labelledby={`capability-tab-${selectedCapabilityId}`}
            aria-live="polite"
          >
            {selectedCapability ? (
              <>
                <div>
                  <span>{selectedCapability.id} / {selectedCapability.category}</span>
                  <h3>{selectedCapability.title}</h3>
                  <p>{selectedCapability.description}</p>
                </div>
                <dl>
                  <div><dt>输出</dt><dd>{selectedCapability.output}</dd></div>
                  <div><dt>工具</dt><dd>{selectedCapability.tools.join(" / ")}</dd></div>
                </dl>
                <div className={styles.projectEvidence}>
                  <span>PROJECT EVIDENCE</span>
                  {relatedProjects.length ? relatedProjects.map((project) => (
                    <a key={project.id} href={publicPath(`/projects/#project-${project.slug}`)}>
                      {project.id} · {project.title} <ArrowUpRight aria-hidden="true" />
                    </a>
                  )) : <p>关联项目待补充。</p>}
                </div>
              </>
            ) : (
              <>
                <div>
                  <span>ALL / EVIDENCE MAP</span>
                  <h3>完整能力图谱</h3>
                  <p>从产品判断、AI 工作流、前端实现到视觉表达，所有能力都回到具体作品。</p>
                </div>
                <dl>
                  <div><dt>能力组</dt><dd>{String(capabilities.length).padStart(2, "0")}</dd></div>
                  <div><dt>项目证据</dt><dd>{String(projects.length).padStart(2, "0")}</dd></div>
                </dl>
                <div className={styles.projectEvidence}>
                  <span>METHOD</span>
                  <p>问题 → 本人工作 → AI 协作 → 结果复盘</p>
                </div>
              </>
            )}
          </div>
        </section>

        <section ref={timelineRef} className={styles.timeline} aria-labelledby="timeline-title">
          <div className={styles.timelineHeading}>
            <p className={styles.sectionCode}>02 / EXPERIENCE PATH</p>
            <h2 id="timeline-title">经历沿着一条仍在生长的路径展开。</h2>
            <p>滚动推进年份；选择能力时，相关经历保持前景，其余内容退为结构背景，但不会被隐藏。</p>
          </div>

          {experiences.length ? (
            <div className={styles.timelineStage}>
              <svg className={styles.timelinePath} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path className={styles.pathTrack} d="M50 0 C24 13 74 22 50 36 C28 49 73 61 50 73 C29 84 60 91 50 100" />
                <path ref={pathRef} className={styles.pathProgress} pathLength="1" d="M50 0 C24 13 74 22 50 36 C28 49 73 61 50 73 C29 84 60 91 50 100" />
              </svg>

              <ol className={styles.timelineList}>
                {experiences.map((experience, index) => {
                  const matches = experienceMatches(experience);
                  const related = experience.relatedProjectIds
                    .map((id) => projectById.get(id))
                    .filter((project): project is Project => Boolean(project));
                  const expanded = expandedExperienceId === experience.id;

                  return (
                    <li
                      key={experience.id}
                      className={styles.timelineItem}
                      data-resume-experience
                      data-match={matches}
                    >
                      <span className={styles.timelineMarker} aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <article data-resume-panel>
                        <div className={styles.experienceMeta}>
                          <span>{experience.id}</span>
                          <time>{experience.period}</time>
                          <span>{experience.context}</span>
                        </div>
                        <h3>{experience.title}</h3>
                        <p className={styles.organization}>{experience.organization}</p>
                        <dl>
                          <div><dt>负责</dt><dd>{experience.owned}</dd></div>
                          <div><dt>结果</dt><dd>{experience.result}</dd></div>
                        </dl>
                        <button
                          type="button"
                          className={styles.evidenceToggle}
                          aria-expanded={expanded}
                          aria-controls={`experience-evidence-${experience.id}`}
                          onClick={() => setExpandedExperienceId(expanded ? null : experience.id)}
                        >
                          {expanded ? "收起项目证据" : "展开项目证据"}
                          <ChevronDown aria-hidden="true" />
                        </button>
                        {expanded ? (
                          <div id={`experience-evidence-${experience.id}`} className={styles.experienceEvidence}>
                            {related.length ? related.map((project) => (
                              <a key={project.id} href={publicPath(`/projects/#project-${project.slug}`)}>
                                <span>{project.id}</span>
                                <strong>{project.title}</strong>
                                <ArrowUpRight aria-hidden="true" />
                              </a>
                            )) : <p>这段经历的关联项目仍待补充。</p>}
                          </div>
                        ) : null}
                      </article>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : (
            <div className={styles.emptyTimeline} role="status">
              <FileText aria-hidden="true" />
              <h3>履历内容待补充</h3>
              <p>加入第一段真实经历后，时间路径会从这里开始生长。</p>
            </div>
          )}
        </section>

        <section className={styles.archiveFooter} aria-labelledby="archive-title">
          <div>
            <h2 id="archive-title">屏幕上保持空间，纸张上回到秩序。</h2>
          </div>
          <p>打印模式会隐藏导航、装饰与控件，保留黑白清晰的个人信息、能力和完整经历。</p>
          <button type="button" onClick={startPrint} data-no-print>
            <Printer aria-hidden="true" />
            {isFolding ? "立即进入打印" : "折叠并打印"}
          </button>
        </section>
      </div>
    </main>
  );
}
