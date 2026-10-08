import { ORB_STATES, type OrbState } from "./config";
import { ORB_MODES, type OrbMode } from "./modes";

type Upper = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";

/**
 * Settings that stay internal: dot radii (rBase, rDepth, rMark, …) are covered
 * by the shared `dotScale` prop, ink levels (inkFar, inkSpan) by the painter,
 * and rsPow / rMin are rendering details.
 */
export type OrbInternalKey = "rsPow" | "rMin" | `r${Upper}${string}` | `ink${Upper}${string}`;

/** The settings a mode exposes through `params`. */
export type OrbParamKey<M extends OrbMode> = Exclude<keyof (typeof ORB_MODES)[M]["defaults"] & string, OrbInternalKey>;

/** `params` for one mode: any of its own settings, each an absolute number. */
export type OrbParams<M extends OrbMode> = Partial<Record<OrbParamKey<M>, number>>;

/** `params` for the mode a state uses. */
export type OrbStateParams<S extends OrbState> = OrbParams<(typeof ORB_STATES)[S]["mode"]>;

const INTERNAL = /^(rsPow|rMin|r[A-Z].*|ink[A-Z].*)$/;

/** The public setting names of a mode, in the order the mode declares them. */
export function orbParamKeys<M extends OrbMode>(mode: M): OrbParamKey<M>[] {
  return Object.keys(ORB_MODES[mode].defaults).filter((key) => !INTERNAL.test(key)) as OrbParamKey<M>[];
}
