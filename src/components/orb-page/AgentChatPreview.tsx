"use client";

import { useEffect, useState } from "react";
import { OrbLoader, type OrbState } from "@/lib/orbs";
import { cn } from "@/lib/utils";

const PROMPT = "Why is the checkout page slow on mobile?";
const STEPS = ["Read 4 files in app/checkout", "Searched the codebase for date imports", "Compared bundle sizes"];
const ANSWER =
  "The checkout bundle loads the full date library on first paint, about 180 KB on mobile. Lazy-loading it behind the delivery picker fixes most of the delay. I've drafted the change.";

// Timeline of one loop, in ms.
const T_USER = 400;
const T_THINK = 1100;
const T_STEP = 900; // between steps
const T_STREAM = T_THINK + STEPS.length * T_STEP + 700;
const CHAR_MS = 18;
const HOLD = 3200;

type Phase = "idle" | "user" | "thinking" | "streaming" | "done";

/**
 * The orb where it actually lives: inline in an agent's status line.
 *
 * Loops a short exchange: the user asks, the assistant's status shows this
 * orb at text size with its shimmering label while tool steps tick off, then
 * the answer streams in and the orb goes away. Under reduced motion it shows
 * the thinking moment, held, instead of looping.
 */
export function AgentChatPreview({ state }: { state: OrbState }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [steps, setSteps] = useState(0);
  const [chars, setChars] = useState(0);
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    if (reduced) {
      at(0, () => {
        setPhase("thinking");
        setSteps(2);
      });
      return () => timers.forEach(clearTimeout);
    }

    at(0, () => {
      setPhase("idle");
      setSteps(0);
      setChars(0);
    });
    at(T_USER, () => setPhase("user"));
    at(T_THINK, () => setPhase("thinking"));
    STEPS.forEach((_, i) => at(T_THINK + (i + 1) * T_STEP, () => setSteps(i + 1)));
    at(T_STREAM, () => setPhase("streaming"));
    for (let i = 1; i <= ANSWER.length; i++) at(T_STREAM + i * CHAR_MS, () => setChars(i));
    const end = T_STREAM + ANSWER.length * CHAR_MS;
    at(end, () => setPhase("done"));
    at(end + HOLD, () => setLoop((n) => n + 1));
    return () => timers.forEach(clearTimeout);
  }, [loop]);

  const thinking = phase === "thinking";
  const answering = phase === "streaming" || phase === "done";
  const busy = phase === "user" || thinking || phase === "streaming";

  return (
    <div className="flex h-[26rem] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white/2 ring-1 ring-white/6 ring-inset">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span className="size-2 rounded-full bg-white/25" />
        <span className="text-sm text-white/60">Assistant</span>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-hidden px-4 py-5 text-sm leading-relaxed">
        {phase !== "idle" && (
          <div className="chat-enter self-end rounded-2xl rounded-br-md bg-white/8 px-3.5 py-2 text-white/85">{PROMPT}</div>
        )}

        {(thinking || answering) && (
          <div className="chat-enter flex flex-col gap-2.5">
            {/* The status line: the orb is replaced by the answer once it starts. */}
            {thinking ? (
              <OrbLoader state={state} size={20} theme="dark" className="text-white" />
            ) : (
              <span className="text-xs text-white/35">Worked for 4s · {STEPS.length} steps</span>
            )}
            {thinking && (
              <ul className="flex flex-col gap-1.5 border-l border-white/8 pl-3">
                {/* Done steps plus the one in progress; later ones are not shown yet. */}
                {STEPS.slice(0, Math.min(steps + 1, STEPS.length)).map((step, i) => (
                  <li key={step} className={cn("chat-enter flex items-center gap-2 text-xs", i < steps ? "text-white/50" : "text-white/30")}>
                    <span className="w-3 text-center text-white/40">{i < steps ? "✓" : "·"}</span>
                    {step}
                  </li>
                ))}
              </ul>
            )}
            {answering && (
              <p className="text-white/75">
                {ANSWER.slice(0, chars)}
                {phase === "streaming" && <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-white/60" />}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Composer: the button becomes "stop" while the agent works. */}
      <div className="flex items-center gap-2 border-t border-white/5 px-3 py-3">
        <div className="flex-1 truncate rounded-lg bg-white/4 px-3 py-2 text-sm text-white/30">Ask a follow-up…</div>
        <span
          aria-hidden="true"
          className={cn("grid size-8 place-items-center rounded-lg text-sm transition-colors", busy ? "bg-white/10 text-white/70" : "bg-white text-black")}
        >
          {busy ? "■" : "↑"}
        </span>
      </div>
    </div>
  );
}
