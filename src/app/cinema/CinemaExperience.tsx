"use client";

import { publicPath } from "@/lib/public-path";

import {
  type CSSProperties,
  type KeyboardEvent,
  type TouchEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Project, Video } from "@/data/types";
import { useExperienceStore } from "@/components/runtime/experience-store";

import styles from "./cinema.module.css";

type CinemaExperienceProps = {
  videos: Video[];
  projects: Pick<Project, "id" | "slug" | "title">[];
};

type PosterStyle = CSSProperties & {
  "--poster-turn": string;
  "--poster-depth": string;
  "--poster-lift": string;
  "--poster-tone": string;
};

type MediaStatus = "idle" | "loading" | "ready" | "error";

const VIDEO_QUERY_KEY = "video";
const POSTER_TONES = ["#a84637", "#a18452", "#526673", "#74414a"];

export function CinemaExperience({ videos, projects }: CinemaExperienceProps) {
  const reduceMotion = useExperienceStore((state) => state.reduceMotion);
  const [entered, setEntered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [motionPaused, setMotionPaused] = useState(false);
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>("idle");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRefs = useRef(new Map<string, HTMLButtonElement>());
  const returnFocusId = useRef<string | null>(null);
  const pushedScreenState = useRef(false);
  const touchStartX = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const suppressClickTimer = useRef<number | null>(null);

  const activeVideo = videos[activeIndex] ?? null;
  const selectedVideo = videos.find((video) => video.id === selectedId) ?? null;
  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const syncFromLocation = useCallback(() => {
    const id = new URL(window.location.href).searchParams.get(VIDEO_QUERY_KEY);
    const index = videos.findIndex((video) => video.id === id);

    if (index >= 0) {
      setEntered(true);
      setActiveIndex(index);
      setSelectedId(videos[index].id);
      setMediaStatus(videos[index].videoUrl ? "loading" : "idle");
      returnFocusId.current = videos[index].id;
    } else {
      setSelectedId(null);
      setMediaStatus("idle");
      pushedScreenState.current = false;
    }
  }, [videos]);

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

    if (selectedVideo && !dialog.open) {
      dialog.showModal();
      window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    }

    if (!selectedVideo && dialog.open) {
      videoRef.current?.pause();
      dialog.close();
    }

    if (!selectedVideo && returnFocusId.current) {
      const trigger = posterRefs.current.get(returnFocusId.current);
      window.requestAnimationFrame(() => trigger?.focus());
    }
  }, [selectedVideo]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) videoRef.current?.pause();
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  const writeSelectionToHistory = (id: string, replace = false) => {
    const url = new URL(window.location.href);
    url.searchParams.set(VIDEO_QUERY_KEY, id);
    const state = { ...window.history.state, videoId: id };

    if (replace) {
      window.history.replaceState(state, "", url);
    } else {
      window.history.pushState(state, "", url);
      pushedScreenState.current = true;
    }
  };

  const enterTheater = () => {
    setEntered(true);
    window.requestAnimationFrame(() => {
      document.getElementById("poster-wall")?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
      const firstPoster = videos[activeIndex];
      if (firstPoster) posterRefs.current.get(firstPoster.id)?.focus({ preventScroll: true });
    });
  };

  const openScreen = (id: string) => {
    if (suppressClick.current) return;

    const index = videos.findIndex((video) => video.id === id);
    if (index < 0) return;

    videoRef.current?.pause();
    setEntered(true);
    setActiveIndex(index);
    setSelectedId(id);
    setMediaStatus(videos[index].videoUrl ? "loading" : "idle");
    returnFocusId.current = id;
    writeSelectionToHistory(id, selectedId !== null);
  };

  const closeScreen = () => {
    videoRef.current?.pause();
    if (pushedScreenState.current) {
      pushedScreenState.current = false;
      window.history.back();
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete(VIDEO_QUERY_KEY);
    window.history.replaceState({ ...window.history.state, videoId: null }, "", url);
    setSelectedId(null);
    setMediaStatus("idle");
  };

  const focusPoster = (index: number) => {
    const safeIndex = (index + videos.length) % videos.length;
    const video = videos[safeIndex];
    setActiveIndex(safeIndex);
    window.requestAnimationFrame(() => {
      posterRefs.current.get(video.id)?.focus();
      posterRefs.current.get(video.id)?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    });
  };

  const moveScreen = (direction: -1 | 1) => {
    if (!selectedVideo) return;
    videoRef.current?.pause();
    const currentIndex = videos.findIndex((video) => video.id === selectedVideo.id);
    const nextIndex = (currentIndex + direction + videos.length) % videos.length;
    const nextVideo = videos[nextIndex];
    setActiveIndex(nextIndex);
    setSelectedId(nextVideo.id);
    setMediaStatus(nextVideo.videoUrl ? "loading" : "idle");
    returnFocusId.current = nextVideo.id;
    writeSelectionToHistory(nextVideo.id, true);
  };

  const handlePosterKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusPoster(index + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusPoster(index - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      focusPoster(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      focusPoster(videos.length - 1);
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
    focusPoster(activeIndex + (distance < 0 ? 1 : -1));
  };

  if (videos.length === 0) {
    return (
      <main id="main-content" tabIndex={-1} className={styles.emptyCinema}>
        <p className={styles.eyebrow}>PERSONAL CINEMA / FEATURE PROGRAM</p>
        <h1>银幕已经亮起，片单还在路上。</h1>
        <p>补充视频数据后，海报、章节与文字稿会在这里组成完整放映体验。</p>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`${styles.cinema} ${entered ? styles.entered : ""} ${motionPaused ? styles.motionPaused : ""}`}
    >
      <div className={styles.filmGrain} aria-hidden="true" />
      <div className={styles.marquee} aria-hidden="true">
        <span>PERSONAL CINEMA · PROCESS ON SCREEN · PERSONAL CINEMA · PROCESS ON SCREEN · </span>
      </div>

      <header className={styles.lobby}>
        <div className={styles.lobbyCopy}>
          <p className={styles.eyebrow}>PERSONAL CINEMA / FEATURE PROGRAM</p>
          <h1>
            不是作品预告，
            <span>是过程正式上映。</span>
          </h1>
          <p className={styles.lede}>
            从弧形海报墙选一部片。真实视频尚未接入时，仍可查看片目结构、章节与完整文字说明。
          </p>
          <div className={styles.lobbyActions}>
            <button type="button" className={styles.admitButton} onClick={enterTheater}>
              检票入场
              <span>05</span>
            </button>
            <button
              type="button"
              className={styles.motionToggle}
              aria-pressed={motionPaused}
              onClick={() => setMotionPaused((paused) => !paused)}
            >
              {motionPaused ? "继续影院动态" : "暂停影院动态"}
            </button>
          </div>
        </div>

        <div className={styles.entrance} aria-hidden="true">
          <div className={styles.ceilingLight} />
          <div className={styles.leftDoor}><span>SCREEN</span></div>
          <div className={styles.rightDoor}><span>05</span></div>
          <div className={styles.aisle} />
        </div>
      </header>

      <section id="poster-wall" className={styles.posterHall} aria-labelledby="poster-heading">
        <div className={styles.hallHeading}>
          <div>
            <p>NOW SHOWING</p>
            <h2 id="poster-heading">弧形片目墙</h2>
          </div>
          <output aria-live="polite">
            {activeVideo.id} · {activeVideo.title}
          </output>
        </div>

        <div className={styles.wallFrame}>
          <div className={styles.projectorBeam} aria-hidden="true" />
          <div
            className={styles.posterWall}
            role="list"
            aria-label="视频片单，使用方向键或触摸滑动选择"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {videos.map((video, index) => {
              const center = (videos.length - 1) / 2;
              const fan = index - center;
              const posterStyle = {
                "--poster-turn": `${fan * -16}deg`,
                "--poster-depth": `${-Math.abs(fan) * 48}px`,
                "--poster-lift": `${Math.abs(fan) * 1.8}rem`,
                "--poster-tone": POSTER_TONES[index % POSTER_TONES.length],
              } as PosterStyle;

              return (
                <article
                  key={video.id}
                  className={`${styles.posterSlot} ${index === activeIndex ? styles.posterActive : ""}`}
                  style={posterStyle}
                  role="listitem"
                >
                  <button
                    ref={(node) => {
                      if (node) posterRefs.current.set(video.id, node);
                      else posterRefs.current.delete(video.id);
                    }}
                    type="button"
                    aria-haspopup="dialog"
                    aria-label={`让 ${video.title} 变成银幕`}
                    onFocus={() => setActiveIndex(index)}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openScreen(video.id)}
                    onKeyDown={(event) => handlePosterKeyDown(event, index)}
                  >
                    <span className={styles.posterArt} role="img" aria-label={video.asset.alt}>
                      <span className={styles.posterNumber}>{video.id}</span>
                      <span className={styles.posterOrb} aria-hidden="true" />
                      <span className={styles.posterTitle}>{video.title}</span>
                      <span className={styles.posterMeta}>{video.genre} / {video.duration}</span>
                      <span className={styles.replaceKey}>REPLACE / {video.asset.replaceKey}</span>
                    </span>
                    <span className={styles.posterCaption}>
                      <span>{video.year}</span>
                      <strong>{video.title}</strong>
                      <small>{video.logline}</small>
                    </span>
                  </button>
                </article>
              );
            })}
          </div>

          <div className={styles.wallControls} role="group" aria-label="片目控制">
            <button type="button" onClick={() => focusPoster(activeIndex - 1)}>上一部</button>
            <span>{String(activeIndex + 1).padStart(2, "0")} / {String(videos.length).padStart(2, "0")}</span>
            <button type="button" onClick={() => focusPoster(activeIndex + 1)}>下一部</button>
          </div>
        </div>

        <aside className={styles.nowShowing} aria-label="当前片目">
          <p>{activeVideo.id} / {activeVideo.genre}</p>
          <h3>{activeVideo.title}</h3>
          <span>{activeVideo.logline}</span>
          <button type="button" onClick={() => openScreen(activeVideo.id)}>
            让海报变成银幕
          </button>
        </aside>
      </section>

      <section className={styles.programNotes} aria-label="放映原则">
        <div><span>01</span><p>真实视频未接入时，不显示损坏播放器。</p></div>
        <div><span>02</span><p>所有影片保留章节和文字稿，无声环境也可理解。</p></div>
        <div><span>03</span><p>声音与播放只由观众主动开启。</p></div>
      </section>

      <dialog
        ref={dialogRef}
        className={styles.screenDialog}
        aria-labelledby={selectedVideo ? `${selectedVideo.id}-title` : undefined}
        onCancel={(event) => {
          event.preventDefault();
          closeScreen();
        }}
        onKeyDown={(event) => {
          const target = event.target;
          if (
            target instanceof HTMLElement
            && target.closest("video, summary, a, input, textarea, select")
          ) return;

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveScreen(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveScreen(1);
          }
        }}
      >
        {selectedVideo ? (
          <article className={styles.screening}>
            <header className={styles.screenHeader}>
              <p>SCREEN {selectedVideo.id} / {selectedVideo.genre}</p>
              <button ref={closeButtonRef} type="button" onClick={closeScreen}>
                离开放映厅
              </button>
            </header>

            <div className={styles.auditorium}>
              <div className={styles.curtainLeft} aria-hidden="true" />
              <div className={styles.curtainRight} aria-hidden="true" />
              <div className={styles.screenSurface}>
                {selectedVideo.videoUrl ? (
                  <>
                    {mediaStatus === "loading" ? (
                      <div className={styles.mediaNotice} role="status">正在准备放映资源…</div>
                    ) : null}
                    {mediaStatus === "error" ? (
                      <div className={styles.mediaNotice} role="alert">
                        视频加载失败，片目说明和文字稿仍可完整阅读。
                      </div>
                    ) : null}
                    <video
                      key={selectedVideo.id}
                      ref={videoRef}
                      className={mediaStatus === "error" ? styles.videoFailed : ""}
                      src={selectedVideo.videoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      aria-label={`${selectedVideo.title} 视频播放器`}
                      onLoadStart={() => setMediaStatus("loading")}
                      onCanPlay={() => setMediaStatus("ready")}
                      onError={() => setMediaStatus("error")}
                    >
                      {selectedVideo.captionsUrl ? (
                        <track
                          kind="captions"
                          src={selectedVideo.captionsUrl}
                          srcLang={selectedVideo.captionsLanguage ?? "zh-CN"}
                          label={selectedVideo.captionsLabel ?? "中文字幕"}
                          default
                        />
                      ) : null}
                    </video>
                  </>
                ) : (
                  <div className={styles.placeholderReel} role="img" aria-label={selectedVideo.asset.alt}>
                    <span className={styles.leaderRing} aria-hidden="true" />
                    <p>{selectedVideo.id}</p>
                    <strong>视频素材待接入</strong>
                    <small>{selectedVideo.asset.label}</small>
                    <i>{selectedVideo.asset.ratio} · {selectedVideo.asset.replaceKey}</i>
                  </div>
                )}
              </div>
              <div className={styles.seatRows} aria-hidden="true">
                <span /><span /><span /><span /><span /><span /><span />
              </div>
            </div>

            <div className={styles.filmInfo}>
              <div className={styles.filmTitle}>
                <p>{selectedVideo.year} · {selectedVideo.duration} · {selectedVideo.genre}</p>
                <h2 id={`${selectedVideo.id}-title`}>{selectedVideo.title}</h2>
                <span>{selectedVideo.logline}</span>
              </div>

              <dl className={styles.credits}>
                <div><dt>本人工作</dt><dd>{selectedVideo.role}</dd></div>
                <div><dt>制作工具</dt><dd>{selectedVideo.tools.join(" / ")}</dd></div>
                <div>
                  <dt>关联项目</dt>
                  <dd className={styles.relatedProjects}>
                    {selectedVideo.relatedProjectIds.length > 0
                      ? selectedVideo.relatedProjectIds.map((projectId) => {
                          const project = projectById.get(projectId);
                          return project ? (
                            <a key={project.id} href={publicPath(`/projects/#project-${project.slug}`)}>
                              {project.title}
                            </a>
                          ) : (
                            <span key={projectId}>{projectId}</span>
                          );
                        })
                      : "待补充"}
                  </dd>
                </div>
              </dl>

              <section className={styles.chapters} aria-labelledby={`${selectedVideo.id}-chapters`}>
                <h3 id={`${selectedVideo.id}-chapters`}>章节</h3>
                <ol>
                  {selectedVideo.chapters.map((chapter, index) => (
                    <li key={`${chapter.time}-${chapter.label}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <time>{chapter.time}</time>
                      <strong>{chapter.label}</strong>
                    </li>
                  ))}
                </ol>
              </section>

              <details className={styles.transcript} open>
                <summary>文字稿 / 无声观看说明</summary>
                <p>{selectedVideo.transcript}</p>
              </details>
            </div>

            <footer className={styles.screenNavigation}>
              <button type="button" onClick={() => moveScreen(-1)}>上一部影片</button>
              <span aria-live="polite">{selectedVideo.id} / {videos.length}</span>
              <button type="button" onClick={() => moveScreen(1)}>下一部影片</button>
            </footer>
          </article>
        ) : null}
      </dialog>
    </main>
  );
}
