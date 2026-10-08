"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { RAY_LIGHT, rayLightAt } from "@/lib/rays";
import { cn } from "@/lib/utils";

/** Samples taken across the word each frame; plenty for beams this wide. */
const STOPS = 20;
/** How strongly the light shows. Lit letters lift toward white, unlit ones dim. */
const LIFT = 0.7;
const SHADE = 0.42;
/** The wordmark's own white → grey gradient, kept underneath the light (see WORDMARK_CLASS). */
const BASE = "linear-gradient(to bottom, #ffffff 39.13%, #a1a1a1 76.52%)";

/**
 * The hero heading, lit by the same rays that light the dots behind it.
 *
 * Each frame the ray field (src/lib/rays.ts) is evaluated at points across the
 * word along the direction the beams vary, on the same rAF clock the shaders
 * use, and written as a gradient over the wordmark's own white-to-grey fill.
 * So a beam crossing a letter brightens it and the gap between beams dims it,
 * in step with the rays canvas. It runs only while on screen and the tab is
 * visible, holds one frame under reduced motion, and until it mounts (or
 * without JS) the heading is the plain wordmark.
 *
 * The parent must be the element the rays canvas fills: positions are
 * measured relative to it.
 */
export function LitWordmark({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    const field = el?.parentElement;
    if (!el || !field) return;

    const angle = RAY_LIGHT.angleDeg;
    // A CSS gradient at the beams' own angle runs across them: its line is
    // perpendicular to the beam direction.
    const rad = (angle * Math.PI) / 180;
    const dx = Math.sin(rad);
    const dy = -Math.cos(rad);
    let box = { cx: 0, cy: 0, len: 0, fh: 1 };

    const measure = () => {
      const r = el.getBoundingClientRect();
      const f = field.getBoundingClientRect();
      box = {
        cx: r.left - f.left + r.width / 2,
        cy: r.top - f.top + r.height / 2,
        len: Math.abs(r.width * dx) + Math.abs(r.height * dy),
        fh: Math.max(f.height, 1),
      };
    };

    const paint = (now: number) => {
      const time = now * 0.001;
      const stops: string[] = [];
      for (let i = 0; i <= STOPS; i++) {
        const f = i / STOPS;
        const x = box.cx + (f - 0.5) * box.len * dx;
        const y = box.cy + (f - 0.5) * box.len * dy;
        const t = Math.min(
          1,
          Math.max(0, rayLightAt(x, y, box.fh, time) / 0.9),
        );
        const v = Math.round(20 + 235 * t);
        const a =
          (SHADE + (LIFT - SHADE) * t) * (0.4 + 0.6 * Math.abs(t - 0.5) * 2);
        stops.push(
          `rgba(${v},${v},${v},${a.toFixed(3)}) ${(f * 100).toFixed(1)}%`,
        );
      }
      el.style.backgroundImage = `linear-gradient(${angle}deg, ${stops.join(", ")}), ${BASE}`;
    };

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let running = false;
    let onScreen = true;
    const loop = (now: number) => {
      paint(now);
      if (running) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced.matches || !onScreen || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => (onScreen && !document.hidden ? start() : stop());
    const onReduced = () => {
      stop();
      paint(performance.now());
      sync();
    };

    const ro = new ResizeObserver(() => {
      measure();
      if (!running) paint(performance.now());
    });
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    measure();
    paint(performance.now());
    ro.observe(el);
    ro.observe(field);
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", onReduced);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", onReduced);
      el.style.backgroundImage = "";
    };
  }, []);

  return (
    <h1 ref={ref} className={cn(className)}>
      {children}
    </h1>
  );
}
