"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import {
  Aperture,
  ArrowLeft,
  ArrowRight,
  ChevronsLeftRight,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";

import type { Photo } from "../../data/types";
import styles from "./gallery.module.css";

type GalleryExperienceProps = {
  photos: Photo[];
};

type FilmStyle = CSSProperties & {
  "--angle"?: string;
  "--mobile-x"?: string;
  "--mobile-y"?: string;
  "--mobile-z"?: string;
  "--mobile-tilt"?: string;
  "--distance"?: number;
};

type StageStyle = CSSProperties & {
  "--density"?: number;
  "--rotation"?: string;
};

type PointerPoint = { x: number; y: number };

const ALL_COLLECTIONS = "全部";
const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
const buildLocalUrl = (url: URL) => `${url.pathname}${url.search}${url.hash}`;

export default function GalleryExperience({ photos }: GalleryExperienceProps) {
  const collections = useMemo(
    () => [ALL_COLLECTIONS, ...Array.from(new Set(photos.map((photo) => photo.collection)))],
    [photos],
  );
  const [collection, setCollection] = useState(ALL_COLLECTIONS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [density, setDensity] = useState(1);
  const [announcement, setAnnouncement] = useState("底片螺旋已就绪");
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const frameRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastTriggerIdRef = useRef<string | null>(null);
  const previousSelectedIdRef = useRef<string | null>(null);
  const wheelTimeRef = useRef(0);
  const pointersRef = useRef(new Map<number, PointerPoint>());
  const dragRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pinchRef = useRef<{ distance: number; density: number } | null>(null);
  const densityRef = useRef(1);
  const didDragRef = useRef(false);

  const visiblePhotos = useMemo(
    () =>
      collection === ALL_COLLECTIONS
        ? photos
        : photos.filter((photo) => photo.collection === collection),
    [collection, photos],
  );
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, visiblePhotos.length - 1));
  const activePhoto = visiblePhotos[safeActiveIndex] ?? photos[0];
  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedId) ?? null,
    [photos, selectedId],
  );
  const selectedVisibleIndex = selectedPhoto
    ? visiblePhotos.findIndex((photo) => photo.id === selectedPhoto.id)
    : -1;
  const stepAngle = visiblePhotos.length > 0
    ? Math.min(38, 360 / visiblePhotos.length)
    : 30;

  const moveTo = useCallback(
    (nextIndex: number, shouldFocus = false) => {
      if (!visiblePhotos.length) return;
      const index = clamp(nextIndex, 0, visiblePhotos.length - 1);
      setActiveIndex(index);
      setFlippedId(null);
      setAnnouncement(
        `当前底片 ${index + 1} / ${visiblePhotos.length}：${visiblePhotos[index].title}`,
      );
      if (shouldFocus) {
        window.requestAnimationFrame(() => frameRefs.current[index]?.focus());
      }
    },
    [visiblePhotos],
  );

  const changeCollection = (nextCollection: string) => {
    setCollection(nextCollection);
    setActiveIndex(0);
    setFlippedId(null);
    const count =
      nextCollection === ALL_COLLECTIONS
        ? photos.length
        : photos.filter((photo) => photo.collection === nextCollection).length;
    setAnnouncement(`${nextCollection}组，共 ${count} 张待替换照片`);
  };

  const setDensityLevel = useCallback((nextDensity: number) => {
    const value = Math.round(clamp(nextDensity, 0.72, 1.24) * 100) / 100;
    densityRef.current = value;
    setDensity(value);
    stageRef.current?.style.setProperty("--density", String(value));
    setAnnouncement(`底片螺旋密度 ${Math.round(value * 100)}%`);
  }, []);

  const openPhoto = useCallback(
    (photo: Photo) => {
      const index = visiblePhotos.findIndex((candidate) => candidate.id === photo.id);
      if (index >= 0) setActiveIndex(index);
      lastTriggerIdRef.current = photo.id;

      const url = new URL(window.location.href);
      url.searchParams.set("photo", photo.id);
      const currentState =
        window.history.state && typeof window.history.state === "object"
          ? window.history.state
          : {};
      window.history.pushState(
        { ...currentState, galleryLightbox: true },
        "",
        buildLocalUrl(url),
      );
      setSelectedId(photo.id);
    },
    [visiblePhotos],
  );

  const replaceOpenPhoto = useCallback(
    (photo: Photo) => {
      const index = visiblePhotos.findIndex((candidate) => candidate.id === photo.id);
      if (index >= 0) setActiveIndex(index);
      setFlippedId(null);

      const url = new URL(window.location.href);
      url.searchParams.set("photo", photo.id);
      const currentState =
        window.history.state && typeof window.history.state === "object"
          ? window.history.state
          : {};
      window.history.replaceState(
        { ...currentState, galleryLightbox: true },
        "",
        buildLocalUrl(url),
      );
      setSelectedId(photo.id);
    },
    [visiblePhotos],
  );

  const closeLightbox = useCallback(() => {
    const url = new URL(window.location.href);
    if (window.history.state?.galleryLightbox) {
      window.history.back();
      return;
    }

    url.searchParams.delete("photo");
    window.history.replaceState(window.history.state, "", buildLocalUrl(url));
    setSelectedId(null);
  }, []);

  useEffect(() => {
    const syncFromHistory = () => {
      const requestedId = new URL(window.location.href).searchParams.get("photo");
      const index = photos.findIndex((photo) => photo.id === requestedId);
      if (index >= 0) {
        setCollection(ALL_COLLECTIONS);
        setActiveIndex(index);
        setSelectedId(photos[index].id);
      } else {
        setSelectedId(null);
      }
    };

    syncFromHistory();
    window.addEventListener("popstate", syncFromHistory);
    return () => window.removeEventListener("popstate", syncFromHistory);
  }, [photos]);

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
        const triggerIndex = visiblePhotos.findIndex(
          (photo) => photo.id === lastTriggerIdRef.current,
        );
        focusFrame = window.requestAnimationFrame(() =>
          frameRefs.current[triggerIndex]?.focus(),
        );
      }
    }

    previousSelectedIdRef.current = selectedId;
    return () => window.cancelAnimationFrame(focusFrame);
  }, [selectedId, visiblePhotos]);

  const handleStageKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveTo(safeActiveIndex + 1, true);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveTo(safeActiveIndex - 1, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      moveTo(0, true);
    } else if (event.key === "End") {
      event.preventDefault();
      moveTo(visiblePhotos.length - 1, true);
    } else if (event.key === "Enter" && activePhoto) {
      event.preventDefault();
      openPhoto(activePhoto);
    } else if (event.key.toLowerCase() === "n" && activePhoto) {
      event.preventDefault();
      setFlippedId((current) => (current === activePhoto.id ? null : activePhoto.id));
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setDensityLevel(densityRef.current + 0.08);
    } else if (event.key === "-") {
      event.preventDefault();
      setDensityLevel(densityRef.current - 0.08);
    }
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const horizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
    if (!horizontalIntent) return;
    event.preventDefault();
    const now = performance.now();
    if (now - wheelTimeRef.current < 360) return;
    wheelTimeRef.current = now;
    moveTo(safeActiveIndex + (event.deltaX + event.deltaY > 0 ? 1 : -1), true);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target;
    if (target instanceof Element && target.closest('[data-no-drag="true"]')) return;

    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    didDragRef.current = false;

    if (pointersRef.current.size === 1) {
      dragRef.current = { x: event.clientX, y: event.clientY, time: performance.now() };
      event.currentTarget.classList.add(styles.stageDragging);
    } else if (pointersRef.current.size === 2) {
      const [first, second] = Array.from(pointersRef.current.values());
      pinchRef.current = {
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        density: densityRef.current,
      };
      dragRef.current = null;
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const [first, second] = Array.from(pointersRef.current.values());
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const nextDensity = clamp(
        pinchRef.current.density * (distance / Math.max(1, pinchRef.current.distance)),
        0.72,
        1.24,
      );
      densityRef.current = nextDensity;
      event.currentTarget.style.setProperty("--density", String(nextDensity));
      didDragRef.current = true;
      return;
    }

    const start = dragRef.current;
    if (!start || !event.isPrimary) return;
    const deltaX = event.clientX - start.x;
    if (Math.abs(deltaX) > 6) didDragRef.current = true;
    event.currentTarget.style.setProperty("--drag-angle", `${deltaX * 0.1}deg`);
    event.currentTarget.style.setProperty("--drag-x", `${deltaX * 0.2}px`);
  };

  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    const wasPinching = Boolean(pinchRef.current);
    pointersRef.current.delete(event.pointerId);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (wasPinching) {
      if (pointersRef.current.size < 2) {
        pinchRef.current = null;
        setDensity(Math.round(densityRef.current * 100) / 100);
        setAnnouncement(`底片螺旋密度 ${Math.round(densityRef.current * 100)}%`);
      }
      dragRef.current = null;
    } else if (start && event.isPrimary) {
      const deltaX = event.clientX - start.x;
      const deltaY = event.clientY - start.y;
      const elapsed = Math.max(80, performance.now() - start.time);
      const velocity = Math.abs(deltaX) / elapsed;
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
        const steps = clamp(Math.round(Math.abs(deltaX) / 110 + velocity * 1.8), 1, 3);
        moveTo(safeActiveIndex + (deltaX < 0 ? steps : -steps), true);
      }
      dragRef.current = null;
    }

    event.currentTarget.style.setProperty("--drag-angle", "0deg");
    event.currentTarget.style.setProperty("--drag-x", "0px");
    event.currentTarget.classList.remove(styles.stageDragging);
    window.setTimeout(() => {
      didDragRef.current = false;
    }, 0);
  };

  if (!photos.length) {
    return (
      <main id="main-content" tabIndex={-1} className={styles.world}>
        <section className={styles.emptyState}>
          <span>G / EMPTY</span>
          <h1>暗房里还没有可以显影的底片</h1>
          <p>在集中内容数据中加入照片后，这里会自动生成可浏览的底片螺旋。</p>
        </section>
      </main>
    );
  }

  const stageStyle: StageStyle = {
    "--density": density,
    "--rotation": `${safeActiveIndex * -stepAngle}deg`,
  };

  return (
    <main id="main-content" tabIndex={-1} className={styles.world} data-world="gallery">
      <div className={styles.safeLight} aria-hidden="true" />
      <div className={styles.darkroomGrid} aria-hidden="true" />

      <header className={styles.hero}>
        <div className={styles.heroCode}>
          <span>WORLD 06</span>
          <span>G / CONTACT SHEET</span>
        </div>
        <div className={styles.heroTitle}>
          <p>一间为尚未替换的记忆预留的暗房</p>
          <h1>光没有消失，<br />它只是还在等待显影。</h1>
        </div>
        <div className={styles.heroGuide}>
          <Aperture aria-hidden="true" />
          <p>横向甩动底片，双击翻面短记。方向键、Enter 与 N 键提供同等操作。</p>
        </div>
      </header>

      <section className={styles.archive} aria-labelledby="gallery-title">
        <div className={styles.archiveTopline}>
          <div>
            <span>ARCHIVE / {String(photos.length).padStart(2, "0")}</span>
            <h2 id="gallery-title">记忆底片库</h2>
          </div>
          <div className={styles.positionReadout} aria-hidden="true">
            <strong>{String(safeActiveIndex + 1).padStart(2, "0")}</strong>
            <span>/ {String(visiblePhotos.length).padStart(2, "0")}</span>
          </div>
        </div>

        <nav className={styles.collectionFilter} aria-label="按照片组筛选">
          {collections.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => changeCollection(item)}
              aria-pressed={collection === item}
            >
              {item}
            </button>
          ))}
        </nav>

        <div
          ref={stageRef}
          className={styles.galleryStage}
          style={stageStyle}
          role="region"
          aria-roledescription="照片底片轮播"
          aria-label="可拖动的 3D 底片螺旋"
          tabIndex={0}
          onKeyDown={handleStageKeyDown}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
        >
          <div className={styles.enlarger} aria-hidden="true">
            <span />
          </div>
          <div className={styles.stageHalo} aria-hidden="true" />

          <div className={styles.filmTrack}>
            {visiblePhotos.map((photo, index) => {
              const relative = index - safeActiveIndex;
              const distance = Math.abs(relative);
              const isActive = index === safeActiveIndex;
              const isFlipped = flippedId === photo.id;
              const filmStyle: FilmStyle = {
                "--angle": `${index * stepAngle}deg`,
                "--mobile-x": `${relative * 3.1}rem`,
                "--mobile-y": `${relative * 5.4}rem`,
                "--mobile-z": `${distance * -2.3}rem`,
                "--mobile-tilt": `${relative * -13}deg`,
                "--distance": distance,
                zIndex: 40 - distance,
                opacity: Math.max(0.16, 1 - distance * 0.12),
                pointerEvents: distance > 2 ? "none" : "auto",
              };

              return (
                <button
                  key={photo.id}
                  ref={(node) => {
                    frameRefs.current[index] = node;
                  }}
                  type="button"
                  disabled={distance > 2}
                  className={`${styles.filmFrame} ${isActive ? styles.frameActive : ""} ${isFlipped ? styles.frameFlipped : ""}`}
                  style={filmStyle}
                  tabIndex={isActive ? 0 : -1}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`${photo.id}，${photo.title}${isActive ? "，当前底片" : ""}`}
                  onClick={() => {
                    if (didDragRef.current) return;
                    if (!isActive) moveTo(index, true);
                  }}
                  onDoubleClick={() => {
                    if (!didDragRef.current) {
                      setActiveIndex(index);
                      setFlippedId((current) => current === photo.id ? null : photo.id);
                    }
                  }}
                >
                  <span className={styles.filmCard}>
                    <span className={`${styles.filmFace} ${styles.filmFront}`}>
                      <span className={styles.perforation} aria-hidden="true" />
                      <span
                        className={styles.photoSurface}
                        style={{ backgroundColor: photo.color }}
                      >
                        <span className={styles.assetState}>待替换照片</span>
                        <span className={styles.assetKey}>{photo.asset.replaceKey}</span>
                        <span className={styles.emulsion} aria-hidden="true" />
                      </span>
                      <span className={styles.filmCaption}>
                        <span>{photo.id}</span>
                        <strong>{photo.title}</strong>
                        <small>{photo.date}</small>
                      </span>
                    </span>
                    <span className={`${styles.filmFace} ${styles.filmBack}`} aria-hidden={!isFlipped}>
                      <span>{photo.collection} / SHORT NOTE</span>
                      <strong>{photo.note}</strong>
                      <small>{photo.place}</small>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.stageControls} data-no-drag="true">
            <button
              type="button"
              onClick={() => moveTo(safeActiveIndex - 1, true)}
              disabled={safeActiveIndex === 0}
              aria-label="上一张底片"
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <span><ChevronsLeftRight aria-hidden="true" /> 甩动浏览</span>
            <button
              type="button"
              onClick={() => moveTo(safeActiveIndex + 1, true)}
              disabled={safeActiveIndex === visiblePhotos.length - 1}
              aria-label="下一张底片"
            >
              <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>

        {activePhoto && (
          <section className={styles.developingDesk} key={activePhoto.id} aria-labelledby={`photo-title-${activePhoto.id}`}>
            <div className={styles.developingTray}>
              <div
                className={`${styles.developedPrint} ${styles[`ratio_${activePhoto.ratio}`]}`}
                style={{ backgroundColor: activePhoto.color }}
                role="img"
                aria-label={activePhoto.alt}
              >
                <span className={styles.developingWash} aria-hidden="true" />
                <span>PHOTO PLACEHOLDER</span>
                <strong>{activePhoto.asset.label}</strong>
                <small>{activePhoto.asset.replaceKey}</small>
              </div>
            </div>

            <div className={styles.photoRecord}>
              <span className={styles.recordNumber}>{activePhoto.id}</span>
              <p className={styles.recordCollection}>{activePhoto.collection}</p>
              <h3 id={`photo-title-${activePhoto.id}`}>{activePhoto.title}</h3>
              <dl>
                <div><dt>日期</dt><dd>{activePhoto.date}</dd></div>
                <div><dt>地点</dt><dd>{activePhoto.place}</dd></div>
                <div><dt>素材状态</dt><dd>待替换</dd></div>
              </dl>
              <p className={styles.photoNote}>{activePhoto.note}</p>

              <div className={styles.photoActions}>
                <button type="button" onClick={() => openPhoto(activePhoto)}>
                  <Maximize2 aria-hidden="true" /> 打开灯箱
                </button>
                <button
                  type="button"
                  onClick={() => setFlippedId((current) => current === activePhoto.id ? null : activePhoto.id)}
                  aria-pressed={flippedId === activePhoto.id}
                >
                  <RotateCcw aria-hidden="true" /> {flippedId === activePhoto.id ? "翻回正面" : "翻面短记"}
                </button>
              </div>

              <div className={styles.densityControl} role="group" aria-label="底片螺旋密度">
                <span>螺旋密度 {Math.round(density * 100)}%</span>
                <div>
                  <button
                    type="button"
                    onClick={() => setDensityLevel(density - 0.08)}
                    disabled={density <= 0.72}
                    aria-label="收紧底片螺旋"
                  >
                    <Minus aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDensityLevel(density + 0.08)}
                    disabled={density >= 1.24}
                    aria-label="展开底片螺旋"
                  >
                    <Plus aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        <p className={styles.srOnly} aria-live="polite">{announcement}</p>
      </section>

      <footer className={styles.footerNote}>
        <span>所有照片均为结构占位</span>
        <p>替换真实照片前，请确认他人肖像、地点与证件信息适合公开。</p>
      </footer>

      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        aria-labelledby={selectedPhoto ? `lightbox-title-${selectedPhoto.id}` : undefined}
        onCancel={(event) => {
          event.preventDefault();
          closeLightbox();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeLightbox();
        }}
      >
        {selectedPhoto && (
          <div className={styles.lightboxFrame} key={selectedPhoto.id}>
            <header className={styles.lightboxTopline}>
              <span>{selectedPhoto.id} / {selectedVisibleIndex + 1} OF {visiblePhotos.length}</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeLightbox}
                aria-label="关闭照片灯箱"
              >
                <X aria-hidden="true" />
              </button>
            </header>

            <div className={styles.lightboxBody}>
              <figure className={styles.lightboxPhoto}>
                <div
                  className={`${styles.lightboxPlaceholder} ${styles[`ratio_${selectedPhoto.ratio}`]}`}
                  style={{ backgroundColor: selectedPhoto.color }}
                  role="img"
                  aria-label={selectedPhoto.alt}
                >
                  <span>待替换照片</span>
                  <strong>{selectedPhoto.asset.replaceKey}</strong>
                </div>
                <figcaption>{selectedPhoto.alt}</figcaption>
              </figure>

              <aside className={styles.lightboxRecord}>
                <span>{selectedPhoto.collection}</span>
                <h2 id={`lightbox-title-${selectedPhoto.id}`}>{selectedPhoto.title}</h2>
                <p>{selectedPhoto.note}</p>
                <dl>
                  <div><dt>日期</dt><dd>{selectedPhoto.date}</dd></div>
                  <div><dt>地点</dt><dd>{selectedPhoto.place}</dd></div>
                  <div><dt>比例</dt><dd>{selectedPhoto.asset.ratio}</dd></div>
                  <div><dt>状态</dt><dd>待替换</dd></div>
                </dl>
              </aside>
            </div>

            <nav className={styles.lightboxNav} aria-label="照片前后导航">
              <button
                type="button"
                disabled={selectedVisibleIndex <= 0}
                onClick={() => replaceOpenPhoto(visiblePhotos[selectedVisibleIndex - 1])}
              >
                <ArrowLeft aria-hidden="true" /> 上一张
              </button>
              <span aria-live="polite">{selectedVisibleIndex + 1} / {visiblePhotos.length}</span>
              <button
                type="button"
                disabled={selectedVisibleIndex >= visiblePhotos.length - 1}
                onClick={() => replaceOpenPhoto(visiblePhotos[selectedVisibleIndex + 1])}
              >
                下一张 <ArrowRight aria-hidden="true" />
              </button>
            </nav>
          </div>
        )}
      </dialog>
    </main>
  );
}
