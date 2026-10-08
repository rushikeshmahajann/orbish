"use client";

import { useRef } from "react";
import { RAY_LIGHT, rayLightGlsl, type RayLight } from "@/lib/rays";
import { useShaderCanvas } from "@/lib/shader-canvas";
import "./SideRays.css";

interface SideRaysProps {
  rayColor1?: string;
  rayColor2?: string;
  /** 1 leaves the colours alone; 0 is greyscale. */
  saturation?: number;
  opacity?: number;
  /** The light's geometry and motion. Pass the same object to anything that should be lit by it. */
  light?: RayLight;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [
        parseInt(m[1], 16) / 255,
        parseInt(m[2], 16) / 255,
        parseInt(m[3], 16) / 255,
      ]
    : [1, 1, 1];
};

const frag = (light: RayLight) => `precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;
uniform float iSaturation;
uniform float iOpacity;

${rayLightGlsl(light)}

void main() {
  vec3 fld = rayField(gl_FragCoord.xy, iResolution, iTime);
  vec3 color = (iRayColor1 * fld.x * (1.0 - RAY_BLEND) + iRayColor2 * fld.y * RAY_BLEND) * 0.9 * fld.z;
  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(gray), color, iSaturation);
  float alpha = max(color.r, max(color.g, color.b)) * iOpacity;
  gl_FragColor = vec4(color, alpha);
}`;

/**
 * Animated light rays on a transparent canvas: react-bits' SideRays, rebuilt
 * around the shared ray field in src/lib/rays.ts so other layers can be lit
 * by the same light. Fills its parent, which must be sized and positioned.
 */
const SideRays = ({
  rayColor1 = "#ffffff",
  rayColor2 = "#9a9a9a",
  saturation = 1,
  opacity = 1,
  light = RAY_LIGHT,
  className = "",
}: SideRaysProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  useShaderCanvas(hostRef, {
    fragment: frag(light),
    uniforms: () => ({
      iRayColor1: { value: hexToRgb(rayColor1) },
      iRayColor2: { value: hexToRgb(rayColor2) },
      iSaturation: { value: saturation },
      iOpacity: { value: opacity },
    }),
    deps: [rayColor1, rayColor2, saturation, opacity, light],
  });
  return (
    <div ref={hostRef} className={`side-rays-container ${className}`.trim()} />
  );
};

export default SideRays;
