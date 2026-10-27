"use client";

import { publicPath } from "@/lib/public-path";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowLeft, ArrowRight, BookOpen, Feather, X } from "lucide-react";

import type { Post, Project } from "../../data/types";
import styles from "./journal.module.css";

type JournalExperienceProps = {
  posts: Post[];
  projects: Pick<Project, "id" | "slug" | "title">[];
};

type JournalStyle = CSSProperties & {
  "--distance"?: number;
  "--page-order"?: number;
};

const buildLocalUrl = (url: URL) => `${url.pathname}${url.search}${url.hash}`;

export default function JournalExperience({ posts, projects }: JournalExperienceProps) {
  const [bookOpen, setBookOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quoteLifted, setQuoteLifted] = useState(false);
  const [announcement, setAnnouncement] = useState("书册尚未展开");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pageRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastTriggerIdRef = useRef<string | null>(null);
  const previousSelectedIdRef = useRef<string | null>(null);
  const swipeRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const activePost = posts[activeIndex] ?? posts[0];
  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedId) ?? null,
    [posts, selectedId],
  );
  const projectById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );
  const selectedIndex = selectedPost
    ? posts.findIndex((post) => post.id === selectedPost.id)
    : -1;

  const selectPage = useCallback(
    (nextIndex: number, shouldFocus = false) => {
      if (!posts.length) return;
      const index = Math.min(posts.length - 1, Math.max(0, nextIndex));
      setActiveIndex(index);
      setAnnouncement(`当前页：${posts[index].title}`);
      if (shouldFocus) {
        window.requestAnimationFrame(() => pageRefs.current[index]?.focus());
      }
    },
    [posts],
  );

  const revealBook = useCallback(() => {
    setBookOpen(true);
    setAnnouncement(`书册已展开，当前页：${activePost.title}`);
    window.requestAnimationFrame(() => pageRefs.current[activeIndex]?.focus());
  }, [activeIndex, activePost.title]);

  const openPost = useCallback(
    (post: Post) => {
      const index = posts.findIndex((candidate) => candidate.id === post.id);
      if (index >= 0) setActiveIndex(index);
      setBookOpen(true);
      setQuoteLifted(false);
      lastTriggerIdRef.current = post.id;

      const url = new URL(window.location.href);
      url.searchParams.set("post", post.id);
      const currentState =
        window.history.state && typeof window.history.state === "object"
          ? window.history.state
          : {};
      window.history.pushState(
        { ...currentState, journalOverlay: true },
        "",
        buildLocalUrl(url),
      );
      setSelectedId(post.id);
    },
    [posts],
  );

  const replaceOpenPost = useCallback((post: Post) => {
    const url = new URL(window.location.href);
    url.searchParams.set("post", post.id);
    const currentState =
      window.history.state && typeof window.history.state === "object"
        ? window.history.state
        : {};
    window.history.replaceState(
      { ...currentState, journalOverlay: true },
      "",
      buildLocalUrl(url),
    );
    setQuoteLifted(false);
    setSelectedId(post.id);
  }, []);

  const closeReader = useCallback(() => {
    const url = new URL(window.location.href);
    if (window.history.state?.journalOverlay) {
      window.history.back();
      return;
    }

    url.searchParams.delete("post");
    window.history.replaceState(window.history.state, "", buildLocalUrl(url));
    setSelectedId(null);
  }, []);

  useEffect(() => {
    const syncFromHistory = () => {
      const requestedId = new URL(window.location.href).searchParams.get("post");
      const index = posts.findIndex((post) => post.id === requestedId);
      if (index >= 0) {
        setBookOpen(true);
        setActiveIndex(index);
        setSelectedId(posts[index].id);
      } else {
        setSelectedId(null);
      }
    };

    syncFromHistory();
    window.addEventListener("popstate", syncFromHistory);
    return () => window.removeEventListener("popstate", syncFromHistory);
  }, [posts]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousId = previousSelectedIdRef.current;
    let focusFrame = 0;

    if (selectedId) {
      if (dialog && !dialog.open) dialog.showModal();
      focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    } else {
      if (dialog?.open) dialog.close();
      if (previousId && lastTriggerIdRef.current) {
        const triggerIndex = posts.findIndex(
          (post) => post.id === lastTriggerIdRef.current,
        );
        focusFrame = window.requestAnimationFrame(() =>
          pageRefs.current[triggerIndex]?.focus(),
        );
      }
    }

    previousSelectedIdRef.current = selectedId;
    return () => window.cancelAnimationFrame(focusFrame);
  }, [posts, selectedId]);

  const handleBookKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!bookOpen) return;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      selectPage(activeIndex + 1, true);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      selectPage(activeIndex - 1, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectPage(0, true);
    } else if (event.key === "End") {
      event.preventDefault();
      selectPage(posts.length - 1, true);
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!bookOpen || !event.isPrimary) return;
    swipeRef.current = { x: event.clientX, y: event.clientY, time: performance.now() };
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start || !event.isPrimary) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    selectPage(activeIndex + (deltaX < 0 ? 1 : -1), true);
  };

  if (!posts.length) {
    return (
      <main id="main-content" tabIndex={-1} className={styles.world}>
        <section className={styles.emptyState}>
          <span>J / EMPTY</span>
          <h1>花园正在等待第一颗内容种子</h1>
          <p>在集中内容数据中加入文章后，物理书页会自动生长出来。</p>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" tabIndex={-1} className={styles.world} data-world="journal">
      <div className={styles.paperGrain} aria-hidden="true" />

      <header className={styles.hero}>
        <div className={styles.heroIndex}>
          <span>WORLD 04</span>
          <span>J / DIGITAL GARDEN</span>
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>一本没有写完的物理书</p>
          <h1>让思考留下墨迹，<br />也留下可以继续生长的岔路。</h1>
          <p className={styles.intro}>
            这里的文字仍是内容种子。每一页明确标出状态、关联项目与待补充部分，
            等真实经历把它们慢慢写实。
          </p>
        </div>
        <div className={styles.marginNote}>
          <Feather aria-hidden="true" />
          <span>拖动或使用方向键翻页</span>
        </div>
      </header>

      <section className={styles.readingRoom} aria-labelledby="journal-book-title">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.kicker}>FIELD NOTES / {String(posts.length).padStart(2, "0")}</span>
            <h2 id="journal-book-title">数字花园手稿</h2>
          </div>
          <div className={styles.bookControls} role="group" aria-label="翻页控制">
            <button
              type="button"
              onClick={() => selectPage(activeIndex - 1, true)}
              disabled={!bookOpen || activeIndex === 0}
              aria-label="上一篇"
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <span aria-hidden="true">
              {String(activeIndex + 1).padStart(2, "0")} / {String(posts.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => selectPage(activeIndex + 1, true)}
              disabled={!bookOpen || activeIndex === posts.length - 1}
              aria-label="下一篇"
            >
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          className={`${styles.bookViewport} ${bookOpen ? styles.bookIsOpen : ""}`}
          onKeyDown={handleBookKeyDown}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <svg className={styles.inkMap} viewBox="0 0 1000 560" aria-hidden="true">
            <path className={styles.inkStem} pathLength="1" d="M88 476 C240 428 300 155 478 252 C620 330 672 88 918 98" />
            {posts.map((post, index) => (
              <path
                key={post.id}
                className={`${styles.inkBranch} ${index === activeIndex ? styles.inkBranchActive : ""}`}
                pathLength="1"
                d={
                  index % 3 === 0
                    ? "M302 310 C220 232 190 160 116 126"
                    : index % 3 === 1
                      ? "M496 257 C530 160 562 126 650 96"
                      : "M668 218 C756 262 810 330 910 354"
                }
              />
            ))}
          </svg>

          <div className={styles.book} role="group" aria-label="文章书册">
            <div className={styles.bookShadow} aria-hidden="true" />
            <div className={styles.spine} aria-hidden="true" />

            <button
              type="button"
              className={styles.cover}
              onClick={revealBook}
              disabled={bookOpen}
              aria-expanded={bookOpen}
              aria-controls="journal-pages"
              tabIndex={bookOpen ? -1 : 0}
            >
              <span className={styles.coverFront}>
                <span className={styles.coverCode}>HAI / J-00</span>
                <strong>FIELD<br />NOTES</strong>
                <span className={styles.coverInstruction}>
                  <BookOpen aria-hidden="true" />
                  展开数字花园
                </span>
              </span>
              <span className={styles.coverBack} aria-hidden="true">
                <span>所有完成的作品，都从一页仍然粗糙的笔记开始。</span>
              </span>
            </button>

            <div id="journal-pages" className={styles.pageStack}>
              {posts.map((post, index) => {
                const distance = Math.abs(index - activeIndex);
                const pageState =
                  index < activeIndex
                    ? styles.pagePast
                    : index === activeIndex
                      ? styles.pageActive
                      : styles.pageFuture;
                const pageStyle: JournalStyle = {
                  "--distance": distance,
                  "--page-order": index,
                  zIndex: index === activeIndex ? 34 : index < activeIndex ? 20 + index : 30 - index,
                };

                return (
                  <button
                    key={post.id}
                    ref={(node) => {
                      pageRefs.current[index] = node;
                    }}
                    type="button"
                    className={`${styles.page} ${pageState}`}
                    style={pageStyle}
                    onClick={() => {
                      if (index === activeIndex) openPost(post);
                      else selectPage(index, true);
                    }}
                    disabled={!bookOpen}
                    tabIndex={bookOpen && index === activeIndex ? 0 : -1}
                    aria-label={
                      index === activeIndex
                        ? `展开文章：${post.title}`
                        : `翻到文章：${post.title}`
                    }
                    aria-current={index === activeIndex ? "page" : undefined}
                  >
                    <span className={`${styles.pageFace} ${styles.pageFront}`}>
                      <span className={styles.pageMeta}>
                        <span>{post.id}</span>
                        <span>{post.status}</span>
                      </span>
                      <span className={styles.pageTitle}>{post.title}</span>
                      <span className={styles.pageSubtitle}>{post.subtitle}</span>
                      <span className={styles.pageSummary}>{post.summary}</span>
                      <span className={styles.tagRow}>
                        {post.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </span>
                      <span className={styles.readAction}>
                        展开全文 <ArrowRight aria-hidden="true" />
                      </span>
                    </span>
                    <span className={`${styles.pageFace} ${styles.pageBack}`} aria-hidden="true">
                      <span className={styles.backNumber}>{post.id}</span>
                      <span className={styles.backQuote}>{post.sections[0]?.body}</span>
                      <span className={styles.backRule} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.annotationRail} role="group" aria-label="页边批注">
          {posts.map((post, index) => (
            <button
              key={post.id}
              type="button"
              className={index === activeIndex ? styles.annotationActive : ""}
              onClick={() => {
                if (!bookOpen) setBookOpen(true);
                selectPage(index, true);
              }}
              aria-pressed={index === activeIndex}
            >
              <span>{post.id}</span>
              <strong>{post.title}</strong>
              <small>{post.date} · {post.readTime}</small>
            </button>
          ))}
        </div>

        <p className={styles.srOnly} aria-live="polite">{announcement}</p>
      </section>

      <footer className={styles.footerNote}>
        <span>本页内容状态：内容种子</span>
        <p>真实文章将沿用现有编号、标签与关联项目位置持续替换。</p>
      </footer>

      <dialog
        ref={dialogRef}
        className={styles.readerDialog}
        aria-labelledby={selectedPost ? `reader-title-${selectedPost.id}` : undefined}
        onCancel={(event) => {
          event.preventDefault();
          closeReader();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeReader();
        }}
      >
        {selectedPost && (
          <div className={styles.readerBook} key={selectedPost.id}>
            <aside className={styles.readerMargin}>
              <span className={styles.readerIndex}>{selectedPost.id}</span>
              <span>{selectedPost.date}</span>
              <span>{selectedPost.readTime}</span>
              <div className={styles.readerTags}>
                {selectedPost.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <p>{selectedPost.note}</p>
            </aside>

            <article className={styles.readerPage}>
              <div className={styles.readerTopline}>
                <span>{selectedPost.status}</span>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeReader}
                  aria-label="关闭文章"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
              <h2 id={`reader-title-${selectedPost.id}`}>{selectedPost.title}</h2>
              <p className={styles.readerLead}>{selectedPost.subtitle}</p>

              <button
                type="button"
                className={`${styles.liftedQuote} ${quoteLifted ? styles.quoteIsLifted : ""}`}
                onClick={() => setQuoteLifted((current) => !current)}
                aria-pressed={quoteLifted}
              >
                <span>INK NOTE</span>
                <q>{selectedPost.sections[0]?.body}</q>
                <small>{quoteLifted ? "收回页内" : "轻点或按 Enter 浮出引文"}</small>
              </button>

              {selectedPost.sections.map((section, index) => (
                <section key={section.heading} className={styles.readerSection}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{section.heading}</h3>
                    <p>{section.body}</p>
                  </div>
                </section>
              ))}

              <div className={styles.relatedProjects}>
                <span>关联项目</span>
                <p>
                  {selectedPost.relatedProjectIds.length > 0
                    ? selectedPost.relatedProjectIds.map((projectId) => {
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
                </p>
              </div>

              <nav className={styles.readerNav} aria-label="文章前后导航">
                <button
                  type="button"
                  disabled={selectedIndex <= 0}
                  onClick={() => replaceOpenPost(posts[selectedIndex - 1])}
                >
                  <ArrowLeft aria-hidden="true" /> 上一篇
                </button>
                <span>{selectedIndex + 1} / {posts.length}</span>
                <button
                  type="button"
                  disabled={selectedIndex >= posts.length - 1}
                  onClick={() => replaceOpenPost(posts[selectedIndex + 1])}
                >
                  下一篇 <ArrowRight aria-hidden="true" />
                </button>
              </nav>
            </article>
          </div>
        )}
      </dialog>
    </main>
  );
}
