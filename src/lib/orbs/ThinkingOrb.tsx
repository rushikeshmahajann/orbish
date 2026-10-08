"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { ORB_STATES, customizeOrb, resolveOrb, type OrbState } from "./config";
import { depthPaint, type Rgb } from "./core";
import type { OrbMode } from "./modes";

export type OrbTheme = "dark" | "light" | "auto";

export type ThinkingOrbProps = Omit<HTMLAttributes<HTMLCanvasElement>, "children"> & {
  /** Semantic state (picks a mode). Ignored when `mode` is set. */
  state?: OrbState;
  /** Visual mode, bypassing the state map. */
  mode?: OrbMode;
  /** CSS pixel size (square). */
  size?: number;
  /** "auto" reads the nearest [data-theme] ancestor, then prefers-color-scheme. */
  theme?: OrbTheme;
  /** Multiplier on the orb's tuned base speed. */
  speed?: number;
  /** Freeze on the current frame. */
  paused?: boolean;
  /**
   * Tint for the dots: any CSS colour, including var(--…) and currentColor.
   * Depth shading still applies. Omit for grayscale ink.
   */
  color?: string;
  /** Multiplies every dot's size. Default 1. */
  dotScale?: number;
  /** Multiplies the number of dots. 0.5 halves them, 2 doubles them. Default 1. */
  density?: number;
  /**
   * Absolute values for this orb's own settings (see its docs page), applied
   * after `density` and `dotScale`. The named wrappers (e.g. SearchingOrb)
   * type these per orb; here any key is accepted.
   */
  params?: Partial<Record<string, number>>;
};

/**
 * Resolves any CSS colour to sRGB channels: computed style first, so var()
 * and currentColor work in context, then a 1×1 canvas, which converts every
 * colour syntax the browser knows (oklch, hsl, named…) to plain sRGB.
 */
function resolveColor(el: HTMLElement, color: string | undefined): Rgb | undefined {
  if (!color) return undefined;
  const previous = el.style.color;
  el.style.color = color;
  const computed = getComputedStyle(el).color;
  el.style.color = previous;
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!computed || !probe) return undefined;
  probe.fillStyle = computed;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

function resolveDark(el: HTMLElement, theme: OrbTheme) {
  if (theme !== "auto") return theme === "dark";
  const t = el.closest("[data-theme]")?.getAttribute("data-theme");
  if (t === "dark" || t === "light") return t === "dark";
  return matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThinkingOrb({
  state = "searching",
  mode,
  size = 96,
  theme = "auto",
  speed = 1,
  paused = false,
  color,
  dotScale = 1,
  density = 1,
  params,
  style,
  ...rest
}: ThinkingOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(speed);
  // Animation clock survives re-renders, so pausing / theme changes don't restart the animation.
  const timeRef = useRef(0);
  const resolvedMode = mode ?? ORB_STATES[state].mode;
  // A stable key, so a new params object with the same values does not restart the effect.
  const paramsKey = params ? JSON.stringify(params) : "";

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    const { def, speed: baseSpeed, opts } = customizeOrb(resolveOrb(resolvedMode, size), {
      density,
      dotScale,
      params: paramsKey ? (JSON.parse(paramsKey) as Partial<Record<string, number>>) : undefined,
    });
    const reducedQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const schemeQuery = matchMedia("(prefers-color-scheme: dark)");
    let dark = resolveDark(canvas, theme);
    let tint = resolveColor(canvas, color);
    let raf = 0, running = false, onScreen = true, last = 0;

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const t = reducedQuery.matches ? 0.6 : timeRef.current;
      depthPaint(ctx, def.dots(size, t, opts), dark, opts.rMin, tint);
    };
    const loop = (now: number) => {
      // rAF timestamps can precede the performance.now() read in start(); never step backwards.
      timeRef.current += (Math.max(0, now - last) / 1000) * baseSpeed * speedRef.current;
      last = now;
      draw();
      if (running) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || paused || reducedQuery.matches || !onScreen || document.hidden) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => (onScreen && !document.hidden ? start() : stop());
    const onScheme = () => {
      dark = resolveDark(canvas, theme);
      // var()-based colours often change with the scheme too.
      tint = resolveColor(canvas, color);
      draw();
    };
    const onReduced = () => {
      stop();
      draw();
      sync();
    };

    // Pause when scrolled off-screen or the tab is hidden.
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    schemeQuery.addEventListener("change", onScheme);
    reducedQuery.addEventListener("change", onReduced);

    draw();
    start();

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      schemeQuery.removeEventListener("change", onScheme);
      reducedQuery.removeEventListener("change", onReduced);
    };
  }, [resolvedMode, size, theme, paused, color, dotScale, density, paramsKey]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ORB_STATES[state].label}
      style={{ width: size, height: size, ...style }}
      {...rest}
    />
  );
}
