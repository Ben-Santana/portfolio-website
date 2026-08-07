'use client';
import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { animate, createTimeline, onScroll, stagger } from 'animejs';
import { useTheme } from '../../context/ThemeContext';
import WireframeModel, { createModelParams, ModelParams } from './WireframeModel';
import { roles, awards, education, experience } from './content';

// ---------------------------------------------------------------------------
// Small pieces
// ---------------------------------------------------------------------------

type BeatWindow = [number, number, number, number];

function panelOpacity(progress: number, [in0, in1, out0, out1]: BeatWindow) {
  if (progress < in0) return 0;
  if (progress < in1) {
    if (in1 === in0) return 1;
    return (progress - in0) / (in1 - in0);
  }
  if (progress <= out0) return 1;
  if (out1 <= out0) return 1;
  if (progress < out1) return 1 - (progress - out0) / (out1 - out0);
  return 0;
}

function panelTranslateY(progress: number, beat: BeatWindow, enterY = 60, exitY = 50) {
  const [in0, in1, out0, out1] = beat;
  if (progress < in0) return enterY;
  if (progress < in1) {
    if (in1 === in0) return 0;
    const t = (progress - in0) / (in1 - in0);
    return (1 - t) * enterY;
  }
  if (progress <= out0) return 0;
  if (out1 <= out0) return 0;
  if (progress < out1) {
    const t = (progress - out0) / (out1 - out0);
    return -t * exitY;
  }
  return 0;
}

function trackScrollProgress(track: HTMLElement) {
  const scrollable = track.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return Math.min(1, Math.max(0, -track.getBoundingClientRect().top / scrollable));
}

function applyPanelStyles(
  el: HTMLElement,
  opacity: number,
  translateY: number,
  baseOffsetY = 0,
) {
  const y = Math.round((translateY + baseOffsetY) * 100) / 100;
  el.style.opacity = String(opacity);
  // Always set an explicit transform so Tailwind translate utilities can't snap in/out.
  el.style.transform = `translate3d(0, ${y}px, 0)`;
  el.style.visibility = opacity < 0.02 ? 'hidden' : 'visible';
  el.style.pointerEvents = opacity > 0.4 ? 'auto' : 'none';
  el.querySelectorAll('.be-item').forEach((item) => {
    const node = item as HTMLElement;
    node.style.opacity = '';
    node.style.transform = '';
  });
}

function clearHeroEntranceStyles(hero: HTMLElement) {
  hero.querySelectorAll('.hero-letter, .hero-meta').forEach((node) => {
    const el = node as HTMLElement;
    el.style.transform = '';
    el.style.opacity = '';
  });
}


function TypewriterRoles({ phrases, animated }: { phrases: string[]; animated: boolean }) {
  const longestPhrase = phrases.reduce((a, b) => (a.length > b.length ? a : b), '');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [text, setText] = useState(animated ? '' : phrases[0]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!animated) {
      setText(phrases[0]);
      return;
    }

    const current = phrases[phraseIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => {
        setText(current.slice(0, text.length + 1));
      }, 58);
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => {
        setText(current.slice(0, text.length - 1));
      }, 32);
    } else {
      timeout = setTimeout(() => {
        setDeleting(false);
        setPhraseIdx((i) => (i + 1) % phrases.length);
      }, 350);
    }

    return () => clearTimeout(timeout);
  }, [animated, phrases, phraseIdx, text, deleting]);

  return (
    <span className="relative inline-grid align-bottom">
      <span className="invisible col-start-1 row-start-1 font-semibold" aria-hidden>
        {longestPhrase}
      </span>
      <span className="col-start-1 row-start-1 font-semibold text-neutral-800 dark:text-neutral-100">
        {text}
        {animated && (
          <span
            className="terminal-caret ml-px inline-block w-[2px] h-[0.9em] align-[-0.05em] bg-neutral-800 dark:bg-neutral-100"
            aria-hidden
          />
        )}
      </span>
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="be-item font-mono text-xs uppercase tracking-[0.35em] text-neutral-400 dark:text-neutral-500 mb-6">
      {children}
    </p>
  );
}

function AwardsContent() {
  return (
    <>
      <SectionLabel>awards</SectionLabel>
      <div className="space-y-6">
        {awards.map((a) => {
          const inner = (
            <>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {a.title}
                {a.link && <span className="ml-2 text-sm align-super text-neutral-400">↗</span>}
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {a.issuer} · {a.year}
              </p>
              {a.description && (
                <p className="mt-1 text-neutral-600 dark:text-neutral-300">{a.description}</p>
              )}
            </>
          );
          return a.link ? (
            <a
              key={a.title}
              href={a.link}
              target="_blank"
              rel="noopener noreferrer"
              className="be-item block hover:opacity-70 transition-opacity pointer-events-auto"
            >
              {inner}
            </a>
          ) : (
            <div key={a.title} className="be-item">
              {inner}
            </div>
          );
        })}
      </div>
    </>
  );
}

function EducationContent() {
  return (
    <>
      <SectionLabel>education</SectionLabel>
      <div className="be-item">
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{education.school}</h3>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {education.degree} · {education.period}
        </p>
      </div>
      <div className="mt-5 space-y-2">
        {education.details.map((d) => (
          <p key={d} className="be-item text-lg text-neutral-700 dark:text-neutral-200">
            {d}
          </p>
        ))}
      </div>
    </>
  );
}

function ExperienceContent() {
  return (
    <>
      <SectionLabel>experience</SectionLabel>
      <div className="space-y-6">
        {experience.map((e) => (
          <div key={`${e.org}-${e.period}`} className="be-item">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">{e.org}</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {e.role} · {e.period}
            </p>
            <p className="mt-1 text-neutral-600 dark:text-neutral-300">{e.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function HeroContent({
  animated,
  layout = 'desktop',
}: {
  animated: boolean;
  layout?: 'desktop' | 'mobile';
}) {
  const isMobile = layout === 'mobile';
  return (
    <div className="select-none w-full">
      <p className="hero-meta font-mono text-sm uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
        hey, i&apos;m
      </p>
      <h1
        aria-label="ben santana"
        className={
          isMobile
            ? 'mt-3 font-black leading-[0.83] tracking-tight text-neutral-900 dark:text-white'
            : 'mt-3 text-[clamp(3.2rem,8.5vw,8rem)] font-black leading-[0.89] tracking-tight text-neutral-900 dark:text-white'
        }
        style={isMobile ? { fontSize: '10vh' } : undefined}
      >
        {'ben santana'.split(' ').map((word, wi) => (
          <span
            key={word}
            aria-hidden
            className={`block overflow-hidden ${wi > 0 ? '-mt-[0.03em]' : 'pb-[0.05em]'}`}
          >
            {word.split('').map((ch, i) => (
              <span key={i} className="hero-letter inline-block">
                {ch}
              </span>
            ))}
          </span>
        ))}
      </h1>
      <p
        className={`hero-meta text-neutral-600 dark:text-neutral-300 ${
          isMobile ? 'mt-4 text-base' : 'mt-6 text-xl'
        }`}
      >
        i&apos;m also <TypewriterRoles phrases={roles} animated={animated} />
      </p>
      <p
        className={`hero-meta max-w-md text-neutral-500 dark:text-neutral-400 ${
          isMobile ? 'mt-1.5 text-sm leading-snug' : 'mt-2'
        }`}
      >
        building intelligent systems, simulations, and hardware integrations.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop: pinned scrollytelling
// ---------------------------------------------------------------------------

function DesktopExperience() {
  const { theme } = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const awardsRef = useRef<HTMLDivElement>(null);
  const eduRef = useRef<HTMLDivElement>(null);
  const expRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef<ModelParams>(createModelParams());

  useEffect(() => {
    const p = paramsRef.current;
    const track = trackRef.current;
    const hero = heroRef.current;
    const awardsEl = awardsRef.current;
    const eduEl = eduRef.current;
    const expEl = expRef.current;
    if (!track || !hero || !awardsEl || !eduEl || !expEl) return;

    // Entrance (on load, independent of scroll)
    const drawIn = animate(p, { draw: 1, duration: 2200, ease: 'outExpo' });
    const letters = animate(hero.querySelectorAll('.hero-letter'), {
      translateY: ['110%', '0%'],
      duration: 750,
      ease: 'outExpo',
      delay: stagger(26, { start: 120 }),
    });
    const meta = animate(hero.querySelectorAll('.hero-meta'), {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 550,
      ease: 'outQuad',
      delay: stagger(90, { start: 550 }),
    });

    // Scroll-scrubbed timeline for 3D only — panel opacity is driven directly from
    // scroll progress so fast scrolling can't leave stale inline styles on children.
    const tl = createTimeline({
      defaults: { ease: 'inOutQuad' },
      autoplay: onScroll({
        target: track,
        sync: true,
        enter: 'top top',
        leave: 'bottom bottom',
      }),
    });

    tl.add(p, { spin: [0, Math.PI * 2.5], duration: 4200, ease: 'linear' }, 0);
    tl.add(p, { x: [0, 1.1], duration: 900, ease: 'inOutQuad' }, 0);
    tl.add(p, { shape: [0, 1], x: [1.1, -1.1], duration: 650, ease: 'inOutSine' }, 780);
    tl.add(p, { shape: [1, 2], x: [-1.1, 1.1], duration: 650, ease: 'inOutSine' }, 2080);
    tl.add(p, { shape: [2, 3], x: [1.1, -1.1], duration: 650, ease: 'inOutSine' }, 3380);

    const panelEls = [hero, awardsEl, eduEl, expEl];
    const panelBaseOffsets = [0, -24, -24, 0];
    const beats: BeatWindow[] = [
      [0, 0, 0.128, 0.198],
      [0.314, 0.395, 0.437, 0.507],
      [0.616, 0.698, 0.74, 0.809],
      [0.919, 1.0, 1.0, 1.0],
    ];

    let heroEntranceDone = false;

    const applyPanels = () => {
      const progress = trackScrollProgress(track);
      panelEls.forEach((el, i) => {
        const opacity = panelOpacity(progress, beats[i]);
        let translateY = panelTranslateY(progress, beats[i]);
        // Don't move the hero panel until entrance finishes — avoids fighting letter/meta anims.
        if (i === 0 && !heroEntranceDone) translateY = 0;
        applyPanelStyles(el, opacity, translateY, panelBaseOffsets[i]);
      });
    };

    meta.then?.(() => {
      heroEntranceDone = true;
      clearHeroEntranceStyles(hero);
      applyPanels();
    });

    applyPanels();
    window.addEventListener('scroll', applyPanels, { passive: true });
    window.addEventListener('resize', applyPanels, { passive: true });

    // Mouse parallax
    const onMove = (e: MouseEvent) => {
      p.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      p.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', applyPanels);
      window.removeEventListener('resize', applyPanels);
      drawIn.revert();
      letters.revert();
      meta.revert();
      tl.revert();
      panelEls.forEach((el) => {
        el.style.opacity = '';
        el.style.transform = '';
        el.style.visibility = '';
        el.style.pointerEvents = '';
      });
    };
    // Rebuilding the timeline on theme change is unnecessary; params live in a ref
  }, []);

  return (
    <div ref={trackRef} className="relative h-[480vh]">
      {/* Anchor so existing /#achievements links land in the awards/education beats */}
      <div id="achievements" className="absolute left-0 w-px h-px" style={{ top: '30%' }} />

      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
        <Canvas
          className="!absolute inset-0"
          style={{ pointerEvents: 'none' }}
          camera={{ position: [0, 0.4, 6.4], fov: 42 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
        >
          <WireframeModel params={paramsRef.current} theme={theme} />
        </Canvas>

        {/* Beat 0: hero (left, opposite wireframe on the right) */}
        <div className="absolute inset-0 flex items-center px-[7%] pointer-events-none">
          <div ref={heroRef} className="max-w-xl pointer-events-auto">
            <HeroContent animated />
          </div>
        </div>

        {/* Beat 1: awards (right, opposite wireframe on the left) */}
        <div className="absolute inset-0 flex items-center justify-end px-[7%] pointer-events-none">
          <div ref={awardsRef} className="max-w-lg opacity-0 pointer-events-none [&_h3]:text-3xl [&_p]:text-base">
            <AwardsContent />
          </div>
        </div>

        {/* Beat 2: education (left) */}
        <div className="absolute inset-0 flex items-center px-[7%] pointer-events-none">
          <div ref={eduRef} className="max-w-lg opacity-0 [&_h3]:text-3xl [&_p]:text-base [&_.be-item.text-lg]:text-xl">
            <EducationContent />
          </div>
        </div>

        {/* Beat 3: experience (right) */}
        <div className="absolute inset-0 flex items-center justify-end px-[7%] pointer-events-none">
          <div ref={expRef} className="max-w-md opacity-0">
            <ExperienceContent />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stacked fallback: small screens and reduced motion. On phones this is a
// pinned scrollytelling like the desktop version, but laid out vertically:
// model in the top 3/7 of the viewport, one text panel at a time in the
// bottom 4/7 — each panel fades out before the next fades in, so nothing
// piles up or overlaps the wireframe.
// ---------------------------------------------------------------------------

function StackedExperience({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) return <StaticExperience />;
  return <MobilePinnedExperience />;
}

function MobilePinnedExperience() {
  const { theme } = useTheme();
  const paramsRef = useRef<ModelParams>(createModelParams());
  const trackRef = useRef<HTMLDivElement>(null);
  const heroPanelRef = useRef<HTMLDivElement>(null);
  const [panelOpacities, setPanelOpacities] = useState([1, 0, 0, 0]);
  const [panelOffsets, setPanelOffsets] = useState([0, 28, 28, 28]);

  useEffect(() => {
    const p = paramsRef.current;
    const track = trackRef.current;
    const heroPanel = heroPanelRef.current;
    if (!track) return;

    const drawIn = animate(p, { draw: 1, duration: 2200, ease: 'outExpo' });

    const entranceAnims: ReturnType<typeof animate>[] = [];
    if (heroPanel) {
      entranceAnims.push(
        animate(heroPanel.querySelectorAll('.hero-letter'), {
          translateY: ['110%', '0%'],
          duration: 750,
          ease: 'outExpo',
          delay: stagger(26, { start: 120 }),
        }),
        animate(heroPanel.querySelectorAll('.hero-meta'), {
          opacity: [0, 1],
          translateY: [14, 0],
          duration: 550,
          ease: 'outQuad',
          delay: stagger(90, { start: 550 }),
        }),
      );
    }

    const panelBaseOffsets = [0, 0, 0, 0];
    // Match desktop beat windows so each text panel aligns with its shape beat.
    const beats: BeatWindow[] = [
      [0, 0, 0.128, 0.198],
      [0.314, 0.395, 0.437, 0.507],
      [0.616, 0.698, 0.74, 0.809],
      [0.919, 1.0, 1.0, 1.0],
    ];

    const tl = createTimeline({
      defaults: { ease: 'inOutQuad' },
      autoplay: onScroll({
        target: track,
        sync: true,
        enter: 'top top',
        leave: 'bottom bottom',
      }),
    });

    tl.add(p, { spin: [0, Math.PI * 2.5], duration: 4200, ease: 'linear' }, 0);
    tl.add(p, { shape: [0, 1], duration: 650, ease: 'inOutSine' }, 780);
    tl.add(p, { shape: [1, 2], duration: 650, ease: 'inOutSine' }, 2080);
    tl.add(p, { shape: [2, 3], duration: 650, ease: 'inOutSine' }, 3380);

    let heroEntranceDone = false;

    const apply = () => {
      const progress = trackScrollProgress(track);
      const opacities = beats.map((beat) => panelOpacity(progress, beat));
      const offsets = beats.map((beat, i) => {
        if (i === 0 && !heroEntranceDone) return panelBaseOffsets[i];
        return (
          panelTranslateY(progress, beat, i === 0 ? 12 : 28, i === 0 ? 12 : 28) +
          panelBaseOffsets[i]
        );
      });

      setPanelOpacities(opacities);
      setPanelOffsets(offsets);
    };

    const entranceDone = entranceAnims.at(-1);
    entranceDone?.then?.(() => {
      heroEntranceDone = true;
      if (heroPanel) clearHeroEntranceStyles(heroPanel);
      apply();
    });

    apply();
    window.addEventListener('scroll', apply, { passive: true });
    window.addEventListener('resize', apply, { passive: true });

    return () => {
      window.removeEventListener('scroll', apply);
      window.removeEventListener('resize', apply);
      drawIn.revert();
      entranceAnims.forEach((a) => a.revert());
      tl.revert();
    };
  }, []);

  const panelBase =
    'absolute inset-x-0 bottom-0 z-10 px-6 pointer-events-none';

  const panels = [
    {
      ref: heroPanelRef,
      pb: 'pb-16',
      content: <HeroContent animated layout="mobile" />,
    },
    {
      pb: 'pb-20',
      content: (
        <div className="mobile-beat w-full [&_h3]:text-2xl [&_p]:text-base [&_p.font-mono]:text-sm [&_.be-item.text-lg]:text-xl">
          <AwardsContent />
        </div>
      ),
    },
    {
      pb: 'pb-20',
      content: (
        <div className="mobile-beat w-full [&_h3]:text-2xl [&_p]:text-base [&_p.font-mono]:text-sm [&_.be-item.text-lg]:text-xl">
          <EducationContent />
        </div>
      ),
    },
    {
      pb: 'pb-16',
      content: (
        <div className="mobile-beat w-full [&_h3]:text-xl [&_p]:text-sm">
          <ExperienceContent />
        </div>
      ),
    },
  ];

  return (
    <div ref={trackRef} className="relative h-[480vh] min-h-[480vh]">
      <div id="achievements" className="absolute left-0 w-px h-px" style={{ top: '38%' }} />

      <div className="sticky top-0 h-screen min-h-screen w-full overflow-hidden bg-white dark:bg-neutral-900">
        <div className="absolute inset-x-0 top-14 h-[42vh] min-h-[240px] max-h-[400px]">
          <Canvas
            className="!absolute inset-0"
            camera={{ position: [0, 0.28, 6.85], fov: 42 }}
            gl={{ alpha: true, antialias: true }}
            dpr={[1, 2]}
            style={{ pointerEvents: 'none' }}
          >
            <WireframeModel params={paramsRef.current} theme={theme} scale={0.88} />
          </Canvas>
        </div>

        {panels.map((panel, i) => (
          <div
            key={i}
            ref={panel.ref}
            className={`${panelBase} ${panel.pb}`}
            style={{
              opacity: panelOpacities[i],
              transform: `translate3d(0, ${panelOffsets[i]}px, 0)`,
              visibility: panelOpacities[i] < 0.02 ? 'hidden' : 'visible',
              pointerEvents: panelOpacities[i] > 0.4 ? 'auto' : 'none',
            }}
          >
            {panel.content}
          </div>
        ))}
      </div>
    </div>
  );
}

// Reduced motion: everything in normal flow, no pinning, no morphing.
function StaticExperience() {
  const { theme } = useTheme();
  const paramsRef = useRef<ModelParams>(createModelParams());

  useEffect(() => {
    paramsRef.current.draw = 1;
  }, []);

  return (
    <div className="px-6 pt-20 pb-12">
      <div className="h-[38vh] min-h-[240px]">
        <Canvas
          camera={{ position: [0, 0.4, 6.8], fov: 42 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
          style={{ pointerEvents: 'none' }}
        >
          <WireframeModel params={paramsRef.current} theme={theme} scale={1} />
        </Canvas>
      </div>

      <div className="max-w-xl mx-auto space-y-16 mt-6">
        <StackedHero reducedMotion />
        <div id="achievements" className="space-y-16">
          <div>
            <AwardsContent />
          </div>
          <div>
            <EducationContent />
          </div>
          <div>
            <ExperienceContent />
          </div>
        </div>
      </div>
    </div>
  );
}

function StackedHero({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="select-none">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
        hey, i&apos;m
      </p>
      <h1 className="mt-3 text-5xl sm:text-6xl font-black leading-[0.95] tracking-tight text-neutral-900 dark:text-white">
        ben santana
      </h1>
      <p className="mt-5 text-xl text-neutral-600 dark:text-neutral-300">
        i&apos;m also <TypewriterRoles phrases={roles} animated={!reducedMotion} />
      </p>
      <p className="mt-2 text-neutral-500 dark:text-neutral-400">
        building intelligent systems, simulations, and hardware integrations.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

export default function ScrollExperience() {
  const [layout, setLayout] = useState<'desktop' | 'stacked'>('desktop');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState(false);
  const layoutRef = useRef<'desktop' | 'stacked'>('desktop');
  const initializedRef = useRef(false);

  useEffect(() => {
    const mqDesktop = window.matchMedia('(min-width: 768px)');
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const nextReduced = mqReduced.matches;
      const nextLayout =
        mqDesktop.matches && !nextReduced ? 'desktop' : 'stacked';

      if (initializedRef.current && layoutRef.current !== nextLayout) {
        // Resizing across the breakpoint preserves scrollY, which can land
        // past the (shorter) mobile track and make the hero look missing.
        window.scrollTo(0, 0);
      }

      layoutRef.current = nextLayout;
      setReducedMotion(nextReduced);
      setLayout(nextLayout);
      initializedRef.current = true;
      setReady(true);
    };
    update();
    mqDesktop.addEventListener('change', update);
    mqReduced.addEventListener('change', update);
    return () => {
      mqDesktop.removeEventListener('change', update);
      mqReduced.removeEventListener('change', update);
    };
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-white dark:bg-neutral-900" aria-hidden />;
  }

  if (layout === 'stacked') return <StackedExperience reducedMotion={reducedMotion} />;
  return <DesktopExperience />;
}
