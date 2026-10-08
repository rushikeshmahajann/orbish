import { highlight } from "sugar-high";
import { CopyButton } from "@/components/CopyButton";
import { cn } from "@/lib/utils";

/**
 * A code sample: one quiet surface, an optional filename label, and a copy
 * button in the corner. Highlighting is sugar-high run on the server, so no
 * highlighter ships to the browser; its token colours are the .code-block
 * variables in globals.css. Adapted from soonish's docs CodeBlock.
 */
export function CodeBlock({ code, filename, title, className }: { code: string; filename?: string; title?: string; className?: string }) {
  const source = code.trim();
  return (
    <div className={cn("group code-block relative rounded-lg bg-white/2 ring-1 ring-white/5 ring-inset", className)}>
      {(title || filename) && (
        <div className="flex items-baseline gap-3 px-5 pt-4">
          {title && <span className="font-display text-sm text-white/70">{title}</span>}
          {filename && <span className="font-mono text-xs text-white/30">{filename}</span>}
        </div>
      )}
      <CopyButton
        value={source}
        label={filename ? `${filename} code` : "code"}
        className="absolute top-2.5 right-2.5 rounded-md opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
      />
      <pre className={cn("overflow-x-auto px-5 pb-4 text-[13px] leading-[1.7]", title || filename ? "pt-2.5" : "pt-4")}>
        <code className="font-mono" dangerouslySetInnerHTML={{ __html: highlight(source) }} />
      </pre>
    </div>
  );
}
