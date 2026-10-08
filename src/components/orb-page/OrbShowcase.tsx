"use client";

import { useState } from "react";
import { OrbLoader, ThinkingOrb, type OrbState } from "@/lib/orbs";
import { SlidingTabs } from "@/components/SlidingTabs";
import { AgentChatPreview } from "./AgentChatPreview";

const VIEWS = [
  { id: "orb", label: "Orb" },
  { id: "loader", label: "Loader" },
  { id: "chat", label: "In a chat" },
] as const;

/**
 * The left-hand preview: the orb large, as a stacked loader with its label,
 * or inline in an agent chat — the three ways it is used.
 */
export function OrbShowcase({ state }: { state: OrbState }) {
  const [view, setView] = useState<string>("orb");
  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-end">
        <SlidingTabs items={VIEWS} value={view} onChange={setView} label="Preview" />
      </div>
      <div className="flex flex-1 items-center justify-center py-10">
        {view === "orb" && <ThinkingOrb state={state} size={280} theme="dark" />}
        {view === "loader" && <OrbLoader state={state} size={96} theme="dark" className="text-white" />}
        {view === "chat" && <AgentChatPreview state={state} />}
      </div>
    </div>
  );
}
