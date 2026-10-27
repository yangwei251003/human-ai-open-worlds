"use client";

import { publicPath } from "@/lib/public-path";

import {
  type CSSProperties,
  type KeyboardEvent,
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useState,
} from "react";

import type { Honor, Project } from "@/data/types";

import styles from "./honors.module.css";

type HonorsExperienceProps = {
  honors: Honor[];
  projects: Pick<Project, "id" | "slug" | "title">[];
};

type ExhibitStyle = CSSProperties & {
  "--exhibit-x": string;
  "--exhibit-y": string;
  "--exhibit-z": string;
  "--exhibit-turn": string;
  "--exhibit-tilt": string;
  "--exhibit-scale": string;
  "--exhibit-opacity": string;
};

const HONOR_QUERY_KEY = "honor";

export function HonorsExperience({ honors, projects }: HonorsExperienceProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [motionPaused, setMotionPaused] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const returnFocusId = useRef<string | null>(null);
  const pushedDetailState = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const suppressClickTimer = useRef<number | null>(null);

  const selectedHonor = honors.find((honor) => honor.id === selectedId) ?? null;
  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const syncFromLocation = useCallback(() => {
    const id = new URL(window.location.href).searchParams.get(HONOR_QUERY_KEY);
    const index = honors.findIndex((honor) => honor.id === id);

    if (index >= 0) {
      setActiveIndex(index);
      setSelectedId(honors[index].id);
      returnFocusId.current = honors[index].id;
    } else {
      setSelectedId(null);
      pushedDetailState.current = false;
    }
  }, [honors]);

  useEffect(() => {
    const initialSyncFrame = window.requestAnimationFrame(syncFromLocation);
    window.addEventListener("popstate", syncFromLocation);
    return () => {
      window.cancelAnimationFrame(initialSyncFrame);
      window.removeEventListener("popstate", syncFromLocation);
      if (suppressClickTimer.current !== null) window.clearTimeout(suppressClickTimer.current);
    };
  }, [syncFromLocation]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selectedHonor && !dialog.open) {
      dialog.showModal();
      window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    }

    if (!selectedHonor && dialog.open) {
      dialog.close();
    }

    if (!selectedHonor && returnFocusId.current) {
      const trigger = triggerRefs.current.get(returnFocusId.current);
      window.requestAnimationFrame(() => trigger?.focus());
    }
  }, [selectedHonor]);

  const writeSelectionToHistory = (id: string, replace = false) => {
    const url = new URL(window.location.href);
    url.searchParams.set(HONOR_QUERY_KEY, id);
    const state = { ...window.history.state, honorId: id };

    if (replace) {
      window.history.replaceState(state, "", url);
    } else {
      window.history.pushState(state, "", url);
      pushedDetailState.current = true;
    }
  };

  const openHonor = (id: string) => {
    if (suppressClick.current) return;

    const index = honors.findIndex((honor) => honor.id === id);
    if (index < 0) return;

    returnFocusId.current = id;
    setActiveIndex(index);
    setSelectedId(id);
    writeSelectionToHistory(id, selectedId !== null);
  };

  const closeHonor = () => {
    if (pushedDetailState.current) {
      pushedDetailState.current = false;
      window.history.back();
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete(HONOR_QUERY_KEY);
    window.history.replaceState({ ...window.history.state, honorId: null }, "", url);
    setSelectedId(null);
  };

  const focusExhibit = (index: number) => {
    const safeIndex = (index + honors.length) % honors.length;
    const honor = honors[safeIndex];
    setActiveIndex(safeIndex);
    window.requestAnimationFrame(() => triggerRefs.current.get(honor.id)?.focus());
  };

  const moveDetail = (direction: -1 | 1) => {
    if (!selectedHonor) return;
    const currentIndex = honors.findIndex((honor) => honor.id === selectedHonor.id);
    const nextIndex = (currentIndex + direction + honors.length) % honors.length;
    const nextHonor = honors[nextIndex];
    returnFocusId.current = nextHonor.id;
    setActiveIndex(nextIndex);
    setSelectedId(nextHonor.id);
    writeSelectionToHistory(nextHonor.id, true);
  };

  const handleExhibitKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusExhibit(index + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusExhibit(index - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusExhibit(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      focusExhibit(honors.length - 1);
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const distance = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(distance) < 48) return;
    suppressClick.current = true;
    if (suppressClickTimer.current !== null) window.clearTimeout(suppressClickTimer.current);
    suppressClickTimer.current = window.setTimeout(() => {
      suppressClick.current = false;
      suppressClickTimer.current = null;
    }, 400);
    focusExhibit(activeIndex + (distance < 0 ? 1 : -1));
  };

  if (honors.length === 0) {
    return (
      <main id="main-content" tabIndex={-1} className={styles.emptyVault}>
        <p className={styles.eyebrow}>MUSEUM VAULT / HONOR ARCHIVE</p>
        <h1>展厅正在等待第一份真实荣誉。</h1>
        <p>补充荣誉数据后，年份、证据与反思会在这里组成可穿行的档案。</p>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`${styles.vault} ${motionPaused ? styles.motionPaused : ""}`}
    >
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.ceilingLines} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <header className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>MUSEUM VAULT / HONOR ARCHIVE</p>
          <h1>
            让荣誉离开墙面，
            <span>成为一段可核验的路径。</span>
          </h1>
        </div>
        <div className={styles.introNote}>
          <p>沿年份穿过展厅。每一束光只照亮事实、本人承担的工作，以及仍待补充的证据。</p>
          <button
            type="button"
            className={styles.motionToggle}
            aria-pressed={motionPaused}
            onClick={() => setMotionPaused((paused) => !paused)}
          >
            {motionPaused ? "继续空间动态" : "暂停空间动态"}
          </button>
        </div>
      </header>

      <section className={styles.museum} aria-labelledby="museum-heading">
        <div className={styles.sectionHeading}>
          <p id="museum-heading">年份展厅</p>
          <output aria-live="polite">
            FLOOR {String(activeIndex + 1).padStart(2, "0")} / {String(honors.length).padStart(2, "0")}
          </output>
        </div>

        <nav className={styles.elevator} aria-label="选择荣誉楼层">
          <span className={styles.elevatorTrack} aria-hidden="true" />
          {honors.map((honor, index) => (
            <button
              key={honor.id}
              type="button"
              className={index === activeIndex ? styles.floorActive : ""}
              aria-label={`前往 ${honor.id}，${honor.title}`}
              aria-current={index === activeIndex ? "step" : undefined}
              onClick={() => focusExhibit(index)}
            >
              <span>{honor.year}</span>
              <strong>{honor.id}</strong>
            </button>
          ))}
        </nav>

        <div
          className={styles.hallway}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.vaultDoor} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={styles.spotlight} aria-hidden="true" />
          <ol className={styles.exhibits} aria-label="荣誉展品，使用方向键移动">
            {honors.map((honor, index) => {
              const offset = index - activeIndex;
              const distance = Math.abs(offset);
              const exhibitStyle = {
                "--exhibit-x": `${offset * 34}vw`,
                "--exhibit-y": `${offset * 58}dvh`,
                "--exhibit-z": `${-distance * 210}px`,
                "--exhibit-turn": `${offset * -12}deg`,
                "--exhibit-tilt": `${offset * 5}deg`,
                "--exhibit-scale": String(Math.max(0.72, 1 - distance * 0.12)),
                "--exhibit-opacity": String(Math.max(0.16, 1 - distance * 0.34)),
                zIndex: honors.length - distance,
              } as ExhibitStyle;

              return (
                <li
                  key={honor.id}
                  className={`${styles.exhibit} ${index === activeIndex ? styles.exhibitActive : ""}`}
                  style={exhibitStyle}
                >
                  <button
                    ref={(node) => {
                      if (node) triggerRefs.current.set(honor.id, node);
                      else triggerRefs.current.delete(honor.id);
                    }}
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={`聚光查看 ${honor.title}`}
                    onFocus={() => setActiveIndex(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openHonor(honor.id)}
                    onKeyDown={(event) => handleExhibitKeyDown(event, index)}
                  >
                    <span className={styles.frameCorners} aria-hidden="true" />
                    <span className={styles.certificate} role="img" aria-label={honor.asset.alt}>
                      <span className={styles.certificateSeal}>{honor.id}</span>
                      <span className={styles.certificateRule} />
                      <b>{honor.rank}</b>
                      <small>{honor.asset.label}</small>
                      <i>REPLACE KEY / {honor.asset.replaceKey}</i>
                    </span>
                    <span className={styles.exhibitLabel}>
                      <span>{honor.year} · {honor.level}</span>
                      <strong>{honor.title}</strong>
                      <small>{honor.organizer}</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className={styles.hallControls} role="group" aria-label="展厅控制">
            <button type="button" onClick={() => focusExhibit(activeIndex - 1)}>
              上一展厅
            </button>
            <span aria-hidden="true" />
            <button type="button" onClick={() => focusExhibit(activeIndex + 1)}>
              下一展厅
            </button>
          </div>
        </div>
      </section>

      <section className={styles.archiveStrip} aria-label="档案说明">
        <p>证据状态</p>
        <strong>目前均为待替换占位</strong>
        <p>替换原则</p>
        <strong>不伪造级别、名次与核验链接</strong>
      </section>

      <dialog
        ref={dialogRef}
        className={styles.detailDialog}
        aria-labelledby={selectedHonor ? `${selectedHonor.id}-title` : undefined}
        onCancel={(event) => {
          event.preventDefault();
          closeHonor();
        }}
        onKeyDown={(event) => {
          const target = event.target;
          if (
            target instanceof HTMLElement
            && target.closest("a, input, textarea, select")
          ) return;

          if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            moveDetail(-1);
          }
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            moveDetail(1);
          }
        }}
      >
        {selectedHonor ? (
          <article className={styles.detailPanel}>
            <header className={styles.detailHeader}>
              <p>SPOTLIGHT RECORD / {selectedHonor.id}</p>
              <button ref={closeButtonRef} type="button" onClick={closeHonor}>
                关闭详情
              </button>
            </header>

            <div className={styles.detailGrid}>
              <div className={styles.detailCertificate} role="img" aria-label={selectedHonor.asset.alt}>
                <span>{selectedHonor.year}</span>
                <strong>{selectedHonor.rank}</strong>
                <p>{selectedHonor.asset.label}</p>
                <small>{selectedHonor.asset.ratio} · {selectedHonor.asset.replaceKey}</small>
              </div>

              <div className={styles.detailCopy}>
                <p className={styles.detailKicker}>{selectedHonor.level}</p>
                <h2 id={`${selectedHonor.id}-title`}>{selectedHonor.title}</h2>
                <dl>
                  <div><dt>主办方</dt><dd>{selectedHonor.organizer}</dd></div>
                  <div><dt>参与方式</dt><dd>{selectedHonor.team}</dd></div>
                  <div><dt>本人工作</dt><dd>{selectedHonor.role}</dd></div>
                </dl>
                <section>
                  <h3>发生了什么</h3>
                  <p>{selectedHonor.context}</p>
                </section>
                <section>
                  <h3>留下的判断</h3>
                  <p>{selectedHonor.reflection}</p>
                </section>
                <footer>
                  {selectedHonor.evidenceUrl ? (
                    <a href={selectedHonor.evidenceUrl} target="_blank" rel="noopener noreferrer">
                      打开核验证据
                    </a>
                  ) : (
                    <span>核验证据链接待补充</span>
                  )}
                  {selectedHonor.relatedProjectId && projectById.has(selectedHonor.relatedProjectId) ? (
                    <a href={publicPath(`/projects/#project-${projectById.get(selectedHonor.relatedProjectId)!.slug}`)}>
                      关联项目 {projectById.get(selectedHonor.relatedProjectId)!.title}
                    </a>
                  ) : null}
                </footer>
              </div>
            </div>

            <div className={styles.detailNavigation}>
              <button type="button" onClick={() => moveDetail(-1)}>上一份档案</button>
              <span>{selectedHonor.id} / {honors.length}</span>
              <button type="button" onClick={() => moveDetail(1)}>下一份档案</button>
            </div>
          </article>
        ) : null}
      </dialog>
    </main>
  );
}
