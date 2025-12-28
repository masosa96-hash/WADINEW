import React from "react";
import { MondayCard } from "../ui/MondayCard";

interface DeconstructItem {
  item: string;
  category: "CRÍTICO" | "RUIDO" | "VULNERABILIDAD";
  verdict: string;
}

interface DataDeconstructorProps {
  items: DeconstructItem[];
}

export const DataDeconstructor: React.FC<DataDeconstructorProps> = ({
  items,
}) => {
  const getColor = (cat: string) => {
    switch (cat) {
      case "CRÍTICO":
        return "text-[var(--wadi-primary)] border-[var(--wadi-primary)]";
      case "VULNERABILIDAD":
        return "text-[var(--wadi-red)] border-[var(--wadi-red)]";
      default:
        return "text-[var(--wadi-gray)] border-[var(--wadi-gray)]";
    }
  };

  return (
    <MondayCard
      title="DECONSTRUCTOR_V3.0"
      className="w-full my-4 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-[var(--wadi-border)] text-[var(--wadi-text-dim)]">
              <th className="p-3 uppercase">Input Data</th>
              <th className="p-3 uppercase">Class</th>
              <th className="p-3 uppercase">System Verdict</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)]"
              >
                <td className="p-3 text-[var(--wadi-text)]">{row.item}</td>
                <td className="p-3">
                  <span
                    className={`border px-2 py-0.5 text-[10px] font-bold ${getColor(row.category)}`}
                  >
                    {row.category}
                  </span>
                </td>
                <td className="p-3 text-[var(--wadi-text-dim)] italic">
                  "{row.verdict}"
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-2 border-t border-[var(--wadi-border)] text-[10px] text-[var(--wadi-text-dim)] flex justify-between">
        <span>TOTAL ITEMS: {items.length}</span>
        <button
          onClick={() => {
            const text = items
              .map((i) => `[${i.category}] ${i.item} -> ${i.verdict}`)
              .join("\n");
            const blob = new Blob([text], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `WADI_PLAN_${Date.now()}.txt`;
            a.click();
          }}
          className="hover:text-[var(--wadi-primary)] hover:underline cursor-pointer uppercase font-bold"
        >
          [EXPORT_PLAN]
        </button>
      </div>
    </MondayCard>
  );
};
