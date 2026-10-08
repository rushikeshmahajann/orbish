"use client";

import { useEffect, useState, type RefObject } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

export type ShaderUniforms = Record<string, { value: number | number[] }>;

export type ShaderCanvasOptions = {
  /** Fragment shader source; a full-screen triangle supplies gl_FragCoord. */
  fragment: string;
  /** Built once per mount. `iTime` (seconds) and `iResolution` (buffer pixels) are added if absent. */
  uniforms: () => ShaderUniforms;
  /** Device-pixel ratio cap. Soft effects can run at 1. */
  dprCap?: number;
  /** Called before every draw with the rAF timestamp in seconds; update uniforms here. */
  onFrame?: (time: number, uniforms: ShaderUniforms) => void;
  /** Remounts the renderer when any of these change. */
  deps?: readonly unknown[];
};

const VERT = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

/**
 * Runs one fragment shader on a transparent canvas filling `hostRef`.
 *
 * Shared by the hero's rays and smoke. Nothing is created until the host is
 * on screen; the loop stops while the tab is hidden; under reduced motion one
 * frame is drawn and held. The clock is the rAF timestamp, so every canvas
 * on this hook sees the same `iTime` and effects that sample one another's
 * light stay in step. Returns whether the canvas is currently live.
 */
export function useShaderCanvas(
  hostRef: RefObject<HTMLDivElement | null>,
  options: ShaderCanvasOptions,
): boolean {
  const [visible, setVisible] = useState(false);
  const [live, setLive] = useState(false);
  const {
    fragment,
    uniforms: makeUniforms,
    dprCap = 2,
    onFrame,
    deps = [],
  } = options;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [hostRef]);

  useEffect(() => {
    const host = hostRef.current;
    if (!visible || !host) return;

    // ogl logs a console error when it cannot get a context; check first so a
    // browser without WebGL just shows no effect, quietly.
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") ?? probe.getContext("webgl"))) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, dprCap),
        alpha: true,
        premultipliedAlpha: false,
      });
    } catch {
      return;
    }
    const gl = renderer.gl;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    host.replaceChildren(gl.canvas);

    const uniforms: ShaderUniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      ...makeUniforms(),
    };
    let mesh: Mesh;
    try {
      mesh = new Mesh(gl, {
        geometry: new Triangle(gl),
        program: new Program(gl, { vertex: VERT, fragment, uniforms }),
      });
    } catch (error) {
      console.warn("useShaderCanvas:", error);
      gl.canvas.remove();
      return;
    }

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let running = false;
    const draw = (t: number) => {
      const time = t * 0.001;
      uniforms.iTime.value = time;
      onFrame?.(time, uniforms);
      renderer.render({ scene: mesh });
    };
    const loop = (t: number) => {
      draw(t);
      if (running) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced.matches || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => (document.hidden ? stop() : start());
    const onReduced = () => {
      stop();
      draw(performance.now());
      sync();
    };
    const resize = () => {
      renderer.dpr = Math.min(window.devicePixelRatio, dprCap);
      renderer.setSize(host.clientWidth, host.clientHeight);
      uniforms.iResolution.value = [
        host.clientWidth * renderer.dpr,
        host.clientHeight * renderer.dpr,
      ];
      if (!running) draw(performance.now());
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", onReduced);
    resize();
    start();
    // Reported from a callback, not the effect body, so React sees no cascading render.
    const liveId = requestAnimationFrame(() => setLive(true));

    return () => {
      cancelAnimationFrame(liveId);
      setLive(false);
      stop();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", onReduced);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
    // `fragment`, `makeUniforms` and `onFrame` are owned by `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, hostRef, dprCap, ...deps]);

  return live;
}
