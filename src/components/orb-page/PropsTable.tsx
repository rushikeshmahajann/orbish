import type { PropRow } from "@/lib/orb-docs";

/** Props reference on the tile surface, with mono labels. Adapted from soonish's docs PropsTable. */
export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white/2 ring-1 ring-white/5 ring-inset">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/5">
            {["Prop", "Type", "Default", "Notes"].map((h) => (
              <th key={h} className="px-4 py-3 text-left font-mono text-xs font-normal text-white/35">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.name} className="border-b border-white/4 align-top last:border-0">
              <td className="px-4 py-3 font-mono text-[0.8125rem] whitespace-nowrap text-white/85">{p.name}</td>
              <td className="px-4 py-3 font-mono text-[0.8125rem] text-white/55">{p.type}</td>
              <td className="px-4 py-3 font-mono text-[0.8125rem] whitespace-nowrap text-white/40">{p.default ?? "—"}</td>
              <td className="min-w-56 px-4 py-3 leading-6 text-white/50">{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
