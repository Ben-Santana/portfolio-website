'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { animate, createSpring, stagger } from 'animejs';
import { projects } from '@/data/projects';
import { useTheme } from '../context/ThemeContext';
import WireframeModel, { createModelParams, ModelParams } from './scroll-experience/WireframeModel';
import { buildProjectShapes, projectAccentColors } from './scroll-experience/projectShapes';
import type { ShapeSet } from './scroll-experience/shapes';

type Anim = ReturnType<typeof animate>;

const slugs = projects.map((p) => p.slug);
const accents = projectAccentColors(slugs);

function useProjectShapes() {
  return useMemo(() => buildProjectShapes(slugs), []);
}

function GithubLink() {
  return (
    <a
      href="https://github.com/Ben-Santana"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block text-neutral-700 dark:text-neutral-200 font-medium hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors"
    >
      more projects on GitHub →
    </a>
  );
}

function resetClickState(p: ModelParams) {
  p.clickScale = 1;
  p.clickWhite = 0;
}

function startDirectMorph(
  p: ModelParams,
  from: number,
  to: number,
  shapeAnimRef: React.MutableRefObject<Anim | null>,
) {
  shapeAnimRef.current?.pause();
  p.shape = from;
  p.morphFrom = from;
  p.morphTo = to;
  p.morphT = 0;
  shapeAnimRef.current = animate(p, {
    morphT: 1,
    duration: 600,
    ease: 'inOutQuad',
    onComplete: () => {
      p.shape = to;
      p.morphFrom = -1;
      p.morphT = 0;
    },
  });
}

function ClickableProjectWireframe({
  activeIndex,
  reducedMotion = false,
  paramsRef,
  theme,
  shapeSet,
  accents,
  className = '',
  canvasClassName = '!absolute inset-0',
  camera = { position: [0, 0.4, 6.4] as [number, number, number], fov: 42 },
  scale = 1,
  float = true,
}: {
  activeIndex: number;
  reducedMotion?: boolean;
  paramsRef: React.RefObject<ModelParams>;
  theme: 'light' | 'dark';
  shapeSet: ShapeSet;
  accents: string[];
  className?: string;
  canvasClassName?: string;
  camera?: { position: [number, number, number]; fov: number };
  scale?: number;
  float?: boolean;
}) {
  const router = useRouter();
  const navigatingRef = useRef(false);
  const pressedRef = useRef(false);
  const clickAnimRef = useRef<Anim | null>(null);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  useEffect(() => {
    resetClickState(paramsRef.current);
    clickAnimRef.current?.pause();
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    navigatingRef.current = false;
    pressedRef.current = false;
  }, [activeIndex, paramsRef]);

  useEffect(
    () => () => {
      clickAnimRef.current?.pause();
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    },
    [],
  );

  const press = useCallback(() => {
    if (navigatingRef.current || pressedRef.current) return;
    pressedRef.current = true;
    clickAnimRef.current?.pause();
    const p = paramsRef.current;
    clickAnimRef.current = animate(p, {
      clickScale: [p.clickScale, 0.74],
      clickWhite: [p.clickWhite, 1],
      duration: 220,
      ease: 'outCubic',
    });
  }, [paramsRef]);

  const release = useCallback(() => {
    if (!pressedRef.current || navigatingRef.current) return;
    pressedRef.current = false;

    const slug = projects[activeIndexRef.current]?.slug;
    if (!slug) {
      resetClickState(paramsRef.current);
      return;
    }

    if (reducedMotion) {
      resetClickState(paramsRef.current);
      navigatingRef.current = true;
      router.push(`/projects/${slug}`);
      return;
    }

    clickAnimRef.current?.pause();
    clickAnimRef.current = animate(paramsRef.current, {
      clickScale: 1,
      clickWhite: 0,
      ease: createSpring({ stiffness: 460, damping: 19 }),
    });

    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = setTimeout(() => {
      navigatingRef.current = true;
      router.push(`/projects/${slug}`);
    }, 300);
  }, [paramsRef, reducedMotion, router]);

  const project = projects[activeIndex];

  return (
    <div
      className={`cursor-pointer touch-none select-none ${className}`}
      role="link"
      tabIndex={0}
      aria-label={project ? `Open ${project.title}` : 'Open project'}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        press();
      }}
      onPointerUp={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        release();
      }}
      onPointerCancel={() => {
        pressedRef.current = false;
        resetClickState(paramsRef.current);
        clickAnimRef.current?.pause();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          press();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          release();
        }
      }}
    >
      <Canvas
        className={canvasClassName}
        camera={camera}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <WireframeModel
          params={paramsRef.current}
          theme={theme}
          shapeSet={shapeSet}
          accentColors={accents}
          float={float}
          scale={scale}
        />
      </Canvas>
    </div>
  );
}

function ProjectRow({
  project,
  index,
  active,
  onActivate,
  onOpen,
  className = 'block py-6',
}: {
  project: (typeof projects)[number];
  index: number;
  active: boolean;
  onActivate: () => void;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <a
      href={`/projects/${project.slug}`}
      data-idx={index}
      onClick={(e) => {
        e.preventDefault();
        if (active) onOpen();
        else onActivate();
      }}
      className={`proj-row group border-t border-neutral-200 dark:border-neutral-800 ${className}`}
    >
      {/* Fade lives on an inner wrapper so the entrance animation's inline
          opacity on the row doesn't override it */}
      <div
        className={`transition-all duration-300 ease-out ${
          active ? 'opacity-100 translate-x-3' : 'opacity-30 translate-x-0'
        }`}
      >
        <div className="flex items-baseline gap-4">
          <span className="w-7 shrink-0 font-mono text-xs text-neutral-400 dark:text-neutral-500">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3
            className={`flex-1 min-w-0 truncate text-xl lg:text-2xl font-bold tracking-tight transition-colors duration-300 ${
              active
                ? 'text-neutral-900 dark:text-white'
                : 'text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white'
            }`}
          >
            {project.title}
          </h3>
          <span className="shrink-0 font-mono text-sm text-neutral-400 dark:text-neutral-500">
            {project.year}
          </span>
        </div>
      </div>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Desktop: a single pinned viewport. Scrolling and arrow keys don't move the
// page while it's on screen — each wheel gesture / key tap steps the selection
// by exactly one project. Pushing past the first/last item releases the page.
// ---------------------------------------------------------------------------

function DesktopProjects() {
  const router = useRouter();
  const { theme } = useTheme();
  const shapeSet = useProjectShapes();
  const paramsRef = useRef<ModelParams>(createModelParams());
  const pinRef = useRef<HTMLDivElement>(null);
  const listColRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const shapeAnim = useRef<Anim | null>(null);
  const spinAnim = useRef<Anim | null>(null);
  const markerAnim = useRef<Anim | null>(null);
  const selectProjectRef = useRef<(idx: number, opts?: { direct?: boolean }) => void>(() => {});

  const count = projects.length;

  useEffect(() => {
    const pin = pinRef.current;
    const listCol = listColRef.current;
    const list = listRef.current;
    const marker = markerRef.current;
    if (!pin || !listCol || !list || !marker) return;
    const p = paramsRef.current;
    const anims: Anim[] = [];
    let played = false;

    const rows = Array.from(list.children) as HTMLElement[];
    rows.forEach((r) => (r.style.opacity = '0'));

    const markerY = (idx: number) => {
      const row = rows[idx];
      return row.offsetTop + row.offsetHeight / 2 - marker.offsetHeight / 2;
    };
    marker.style.transform = `translateY(${markerY(0)}px)`;

    const io = new IntersectionObserver(
      (entries) => {
        if (played || !entries.some((e) => e.isIntersecting)) return;
        played = true;
        anims.push(animate(p, { draw: 1, duration: 2200, ease: 'outExpo' }));
        anims.push(
          animate(rows, {
            opacity: [0, 1],
            translateY: [26, 0],
            duration: 600,
            ease: 'outQuad',
            delay: stagger(70),
          }),
        );
        anims.push(animate(marker, { opacity: [0, 1], duration: 500, ease: 'outQuad', delay: 300 }));
        io.disconnect();
      },
      { threshold: 0.05 },
    );
    io.observe(pin);

    // Move the selection to a row: marker springs and wireframe morphs.
    const selectProject = (idx: number, opts?: { direct?: boolean }) => {
      if (idx === activeRef.current) return;
      const from = activeRef.current;
      activeRef.current = idx;
      setActive(idx);

      markerAnim.current?.pause();
      markerAnim.current = animate(marker, {
        translateY: markerY(idx),
        ease: createSpring({ stiffness: 260, damping: 19 }),
      });

      shapeAnim.current?.pause();
      spinAnim.current?.pause();

      if (opts?.direct && from !== idx) {
        startDirectMorph(p, from, idx, shapeAnim);
      } else {
        p.morphFrom = -1;
        shapeAnim.current = animate(p, { shape: idx, duration: 600, ease: 'inOutQuad' });
      }

      const spinDelta = Math.PI * (0.35 + Math.min(0.25, Math.abs(idx - from) * 0.05));
      spinAnim.current = animate(p, {
        spin: p.spin + spinDelta * Math.sign(idx - from || 1),
        duration: 600,
        ease: 'outQuad',
      });
    };
    selectProjectRef.current = selectProject;

    const step = (dir: 1 | -1): boolean => {
      const next = Math.min(count - 1, Math.max(0, activeRef.current + dir));
      if (next === activeRef.current) return false;
      selectProject(next);
      return true;
    };

    // -----------------------------------------------------------------------
    // Scroll capture. The section is exactly one viewport tall; while it's
    // aligned with the viewport we swallow wheel/arrow input and translate it
    // into discrete steps. Pushing firmly past the first/last item "releases"
    // the page so normal scrolling resumes. When the section is approaching
    // mid-viewport, the first wheel event snaps it into alignment so you can
    // never scroll past the list.
    // -----------------------------------------------------------------------
    const isAligned = () => Math.abs(pin.getBoundingClientRect().top) < 2;

    let aligning = false;
    let alignTimeout: ReturnType<typeof setTimeout> | null = null;
    let released = false;
    let cooldownUntil = 0;
    let lastWheelAt = 0;
    let wheelAcc = 0;
    let exitAcc = 0;

    const alignSection = () => {
      aligning = true;
      if (alignTimeout) clearTimeout(alignTimeout);
      // Safety valve in case the smooth scroll gets interrupted
      alignTimeout = setTimeout(() => (aligning = false), 1200);
      window.scrollTo({
        top: window.scrollY + pin.getBoundingClientRect().top,
        behavior: 'smooth',
      });
    };

    const onScroll = () => {
      if (aligning && isAligned()) {
        aligning = false;
        if (alignTimeout) clearTimeout(alignTimeout);
        // Swallow leftover momentum from the scroll that triggered the align
        cooldownUntil = performance.now() + 400;
        wheelAcc = 0;
        exitAcc = 0;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // The wheel only grabs when the cursor is over the project list column;
    // scrolling anywhere else on the page passes through untouched.
    const overList = (e: WheelEvent) => {
      const r = listCol.getBoundingClientRect();
      return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    };

    const onWheel = (e: WheelEvent) => {
      const rect = pin.getBoundingClientRect();
      const vh = window.innerHeight;
      const down = e.deltaY > 0;
      // Normalize line-based deltas (e.g. Firefox) to pixels
      const delta = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;

      if (aligning) {
        e.preventDefault();
        return;
      }

      if (!overList(e)) {
        wheelAcc = 0;
        exitAcc = 0;
        return;
      }

      if (Math.abs(rect.top) >= 2) {
        released = false;
        // Approaching the section: capture and snap it into place
        if (down && rect.top > 2 && rect.top < vh * 0.55) {
          e.preventDefault();
          alignSection();
        } else if (!down && rect.bottom < vh - 2 && rect.bottom > vh * 0.45) {
          e.preventDefault();
          alignSection();
        }
        return;
      }

      if (released) return; // stepping past the edge: let the page move on

      e.preventDefault();
      const now = performance.now();
      const gap = now - lastWheelAt;
      lastWheelAt = now;
      if (now < cooldownUntil) return;
      if (gap > 300) {
        wheelAcc = 0;
        exitAcc = 0;
      }
      if (Math.abs(delta) < 10) return; // trailing inertia dribble

      const atEdge = down ? activeRef.current === count - 1 : activeRef.current === 0;
      if (atEdge) {
        // A firm push past the edge releases the page
        exitAcc = Math.sign(delta) === Math.sign(exitAcc) || exitAcc === 0 ? exitAcc + delta : delta;
        if (Math.abs(exitAcc) > 150) released = true;
        return;
      }

      wheelAcc = Math.sign(delta) === Math.sign(wheelAcc) || wheelAcc === 0 ? wheelAcc + delta : delta;
      if (Math.abs(wheelAcc) >= 60) {
        step(down ? 1 : -1);
        wheelAcc = 0;
        exitAcc = 0;
        cooldownUntil = now + 700; // one step per gesture: swallow the momentum
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });

    // One arrow tap = one step. At the edges the key falls through to normal
    // page scrolling so you can leave the section.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const rect = pin.getBoundingClientRect();
      const vh = window.innerHeight;
      const dir = e.key === 'ArrowDown' ? 1 : -1;

      if (Math.abs(rect.top) >= 2) {
        if (aligning) {
          e.preventDefault();
          return;
        }
        // Approaching via keyboard: snap into place instead of nudging past
        if (dir === 1 && rect.top > 2 && rect.top < vh * 0.55) {
          e.preventDefault();
          alignSection();
        } else if (dir === -1 && rect.bottom < vh - 2 && rect.bottom > vh * 0.45) {
          e.preventDefault();
          alignSection();
        }
        return;
      }

      if (step(dir)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);

    const onResize = () => {
      markerAnim.current?.pause();
      marker.style.transform = `translateY(${markerY(activeRef.current)}px)`;
    };
    window.addEventListener('resize', onResize);

    const onMove = (e: MouseEvent) => {
      p.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      p.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      io.disconnect();
      if (alignTimeout) clearTimeout(alignTimeout);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      anims.forEach((a) => a.revert());
      markerAnim.current?.pause();
      shapeAnim.current?.pause();
      spinAnim.current?.pause();
      rows.forEach((r) => (r.style.opacity = ''));
    };
  }, [count]);

  return (
    <section id="projects" className="relative bg-white dark:bg-neutral-900 select-none">
      <div ref={pinRef} className="relative h-screen overflow-hidden">
        {/* Wireframe viewer centered in the space right of the list */}
        <ClickableProjectWireframe
          activeIndex={active}
          paramsRef={paramsRef}
          theme={theme}
          shapeSet={shapeSet}
          accents={accents}
          className="absolute inset-y-0 left-[43%] right-0"
        />

        {/* Left: full-height list with the travelling selector, ~3/7 of the screen */}
        <div
          ref={listColRef}
          className="absolute inset-y-0 left-0 z-10 w-[43%] pl-[5%] pr-6 pt-24 pb-10 flex flex-col"
        >
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-neutral-400 dark:text-neutral-500 mb-4">
            projects
          </p>
          <div className="relative flex-1 min-h-0">
            <div
              ref={markerRef}
              className="absolute left-0 top-0 w-[3px] h-9 rounded-full opacity-0 transition-colors duration-500"
              style={{ backgroundColor: accents[active] }}
            />
            <div ref={listRef} className="flex h-full flex-col pl-5">
              {projects.map((project, i) => (
                <ProjectRow
                  key={project.slug}
                  project={project}
                  index={i}
                  active={active === i}
                  onActivate={() => selectProjectRef.current(i, { direct: true })}
                  onOpen={() => router.push(`/projects/${project.slug}`)}
                  className="flex-1 min-h-0 flex flex-col justify-center"
                />
              ))}
            </div>
          </div>

          {/* Arrow key hint */}
          <div className="mt-5 flex items-center gap-3 pl-5 text-neutral-400 dark:text-neutral-500">
            <span className="flex gap-1.5">
              <kbd className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 dark:border-neutral-700 font-mono text-[11px]">
                ↑
              </kbd>
              <kbd className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 dark:border-neutral-700 font-mono text-[11px]">
                ↓
              </kbd>
            </span>
            <span className="font-mono text-xs uppercase tracking-wider">navigate</span>
          </div>
        </div>
      </div>

      <div className="py-14 text-center">
        <GithubLink />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Stacked fallback: small screens and reduced motion. The model is pinned in
// the top 3/7 of the viewport; each project row sticks right below it and the
// next row scrolls up to cover it, so the row on top of the pile is always
// the active one.
// ---------------------------------------------------------------------------

const MODEL_FRACTION = 3 / 7;

function getStackStickyOffset(row: HTMLElement) {
  const computedTop = parseFloat(getComputedStyle(row).top);
  return (Number.isFinite(computedTop) ? computedTop : window.innerHeight * MODEL_FRACTION) + 2;
}

function scrollRowIntoActiveSlot(row: HTMLElement) {
  const offset = getStackStickyOffset(row);
  const targetScroll = window.scrollY + row.getBoundingClientRect().top - offset;
  window.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
}

function StackedProjects({ reducedMotion }: { reducedMotion: boolean }) {
  const router = useRouter();
  const { theme } = useTheme();
  const shapeSet = useProjectShapes();
  const paramsRef = useRef<ModelParams>(createModelParams());
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const shapeAnim = useRef<Anim | null>(null);
  const pendingScrollTargetRef = useRef<number | null>(null);

  useEffect(() => {
    const p = paramsRef.current;
    let drawIn: Anim | null = null;
    if (reducedMotion) {
      p.draw = 1;
    } else {
      drawIn = animate(p, { draw: 1, duration: 2200, ease: 'outExpo' });
    }

    const rows = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[data-stack-idx]') ?? [],
    );

    const activate = (idx: number) => {
      if (pendingScrollTargetRef.current !== null) {
        if (idx !== pendingScrollTargetRef.current) return;
        pendingScrollTargetRef.current = null;
      }
      if (idx === activeRef.current) return;
      activeRef.current = idx;
      setActive(idx);
      if (reducedMotion) {
        p.shape = idx;
        p.morphFrom = -1;
      } else {
        p.morphFrom = -1;
        shapeAnim.current?.pause();
        shapeAnim.current = animate(p, { shape: idx, duration: 600, ease: 'inOutQuad' });
      }
    };

    // Active row = the one currently on top of the pile, i.e. the last row
    // whose top has reached the shared sticky offset.
    const onScroll = () => {
      if (!rows.length) return;
      const offset = getStackStickyOffset(rows[0]);
      let idx = 0;
      for (const row of rows) {
        if (row.getBoundingClientRect().top <= offset) {
          idx = Number(row.dataset.stackIdx);
        }
      }
      activate(idx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      drawIn?.revert();
      shapeAnim.current?.pause();
    };
  }, [reducedMotion]);

  const jumpToProject = useCallback(
    (idx: number) => {
      const from = activeRef.current;
      if (from === idx) return;

      pendingScrollTargetRef.current = idx;
      activeRef.current = idx;
      setActive(idx);

      const p = paramsRef.current;
      if (reducedMotion) {
        p.shape = idx;
        p.morphFrom = -1;
        pendingScrollTargetRef.current = null;
      } else {
        startDirectMorph(p, from, idx, shapeAnim);
      }

      const row = listRef.current?.querySelector<HTMLElement>(`[data-stack-idx="${idx}"]`);
      if (row) scrollRowIntoActiveSlot(row);
      window.setTimeout(() => {
        pendingScrollTargetRef.current = null;
      }, 2500);
    },
    [reducedMotion],
  );

  return (
    <section id="projects" className="relative bg-white dark:bg-neutral-900 select-none">
      {/* Model pinned in the top 3/7 of the screen */}
      <div className="sticky top-0 z-20 h-[calc(100vh*3/7)] bg-gradient-to-b from-white via-white/90 to-transparent dark:from-neutral-900 dark:via-neutral-900/90">
        <p className="absolute left-6 top-[4.75rem] font-mono text-xs uppercase tracking-[0.35em] text-neutral-400 dark:text-neutral-500 pointer-events-none">
          projects
        </p>
        <ClickableProjectWireframe
          activeIndex={active}
          reducedMotion={reducedMotion}
          paramsRef={paramsRef}
          theme={theme}
          shapeSet={shapeSet}
          accents={accents}
          className="relative h-full pt-16"
          camera={{ position: [0, 0.4, 6.8], fov: 42 }}
          scale={0.85}
        />
      </div>

      {/* Sticky stack: each row pins just below the model and gets covered by
          the next one; the bottom padding sets the scroll dwell per project */}
      <div ref={listRef} className="px-6">
        {projects.map((project, i) => (
          <div
            key={project.slug}
            data-stack-idx={i}
            className="sticky top-[calc(100vh*3/7)] bg-white dark:bg-neutral-900 pb-[12vh]"
          >
            <ProjectRow
              project={project}
              index={i}
              active={active === i}
              onActivate={() => jumpToProject(i)}
              onOpen={() => router.push(`/projects/${project.slug}`)}
              className="block py-5"
            />
          </div>
        ))}
        <div aria-hidden className="h-[45vh]" />
      </div>

      <div className="px-6 pb-16">
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 text-center">
          <GithubLink />
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

export default function ProjectsSection() {
  const [layout, setLayout] = useState<'desktop' | 'stacked'>('desktop');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mqDesktop = window.matchMedia('(min-width: 768px)');
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(mqReduced.matches);
      setLayout(mqDesktop.matches && !mqReduced.matches ? 'desktop' : 'stacked');
    };
    update();
    mqDesktop.addEventListener('change', update);
    mqReduced.addEventListener('change', update);
    return () => {
      mqDesktop.removeEventListener('change', update);
      mqReduced.removeEventListener('change', update);
    };
  }, []);

  if (layout === 'stacked') return <StackedProjects reducedMotion={reducedMotion} />;
  return <DesktopProjects />;
}
