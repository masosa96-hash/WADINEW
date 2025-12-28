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
        return "text-[var(--monday-primary)] border-[var(--monday-primary)]";
      case "VULNERABILIDAD":
        return "text-[var(--monday-red)] border-[var(--monday-red)]";
      default:
        return "text-[var(--monday-gray)] border-[var(--monday-gray)]";
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
            <tr className="border-b border-[var(--monday-border)] text-[var(--monday-text-dim)]">
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
                <td className="p-3 text-[var(--monday-text)]">{row.item}</td>
                <td className="p-3">
                  <span
                    className={`border px-2 py-0.5 text-[10px] font-bold ${getColor(row.category)}`}
                  >
                    {row.category}
                  </span>
                </td>
                <td className="p-3 text-[var(--monday-text-dim)] italic">
                  "{row.verdict}"
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-2 border-t border-[var(--monday-border)] text-[10px] text-[var(--monday-text-dim)] flex justify-between">
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
            a.download = `MONDAY_PLAN_${Date.now()}.txt`;
            a.click();
          }}
          className="hover:text-[var(--monday-primary)] hover:underline cursor-pointer uppercase font-bold"
        >
          [EXPORT_PLAN]
        </button>
      </div>
    </MondayCard>
  );
};
