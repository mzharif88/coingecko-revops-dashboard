"use client";

import { Grid } from "lucide-react";

interface CohortRow {
  month: string;
  startCount: number;
  retention: number[];
}

const COHORTS: CohortRow[] = [
  { month: "Jan 2025", startCount: 12, retention: [100, 92, 83, 75, 75, 67] },
  { month: "Feb 2025", startCount: 9,  retention: [100, 89, 78, 78, 67] },
  { month: "Mar 2025", startCount: 14, retention: [100, 93, 86, 79, 79] },
  { month: "Apr 2025", startCount: 11, retention: [100, 91, 82, 73] },
  { month: "May 2025", startCount: 8,  retention: [100, 88, 75] },
  { month: "Jun 2025", startCount: 16, retention: [100, 94] },
];

const MAX_MONTHS = 6;

function cellColor(pct: number): string {
  if (pct >= 90) return "bg-green-900/50 text-green-400";
  if (pct >= 75) return "bg-yellow-900/50 text-yellow-400";
  return "bg-red-900/50 text-red-400";
}

export default function CohortRetention() {
  const m1Vals = COHORTS.filter(c => c.retention[1] !== undefined).map(c => c.retention[1]);
  const m3Vals = COHORTS.filter(c => c.retention[3] !== undefined).map(c => c.retention[3]);
  const avgM1 = Math.round(m1Vals.reduce((s, v) => s + v, 0) / m1Vals.length);
  const avgM3 = m3Vals.length ? Math.round(m3Vals.reduce((s, v) => s + v, 0) / m3Vals.length) : null;

  const m1Scores = COHORTS.map((c, i) => ({ month: c.month, val: c.retention[1] ?? 0, i }));
  const best  = m1Scores.reduce((a, b) => b.val > a.val ? b : a);
  const worst = m1Scores.filter(x => x.val > 0).reduce((a, b) => b.val < a.val ? b : a);

  const bestCohort = COHORTS.find(c => c.month === best.month);
  const latestM1 = COHORTS[COHORTS.length - 1].retention[1];

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Grid className="w-4 h-4 text-purple-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Cohort Retention</h2>
        <span className="text-xs text-[#8B949E] ml-auto">Monthly signups</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#E6EDF3]">{avgM1}%</div>
          <div className="text-xs text-[#8B949E]">Avg M1</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#E6EDF3]">{avgM3 ?? "—"}%</div>
          <div className="text-xs text-[#8B949E]">Avg M3</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-400">{best.val}%</div>
          <div className="text-xs text-[#8B949E] truncate">Best M1 ({best.month.split(" ")[0]})</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-400">{worst.val}%</div>
          <div className="text-xs text-[#8B949E] truncate">Worst M1 ({worst.month.split(" ")[0]})</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-[#8B949E] font-medium pb-2 pr-3">Cohort</th>
              <th className="text-center text-[#8B949E] font-medium pb-2 px-1">n</th>
              {Array.from({ length: MAX_MONTHS }).map((_, i) => (
                <th key={i} className="text-center text-[#8B949E] font-medium pb-2 px-1 min-w-[48px]">M{i}</th>
              ))}
            </tr>
          </thead>
          <tbody className="space-y-1">
            {COHORTS.map((row) => (
              <tr key={row.month}>
                <td className="text-[#E6EDF3] pr-3 py-1 whitespace-nowrap">{row.month}</td>
                <td className="text-center text-[#8B949E] px-1 py-1">{row.startCount}</td>
                {Array.from({ length: MAX_MONTHS }).map((_, mi) => {
                  const val = row.retention[mi];
                  return (
                    <td key={mi} className="px-1 py-1">
                      {val !== undefined ? (
                        <div className={`text-center rounded px-1 py-0.5 font-medium ${cellColor(val)}`}>
                          {val}%
                        </div>
                      ) : (
                        <div className="text-center text-[#21262D]">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-3 border-t border-[#21262D] text-xs text-[#8B949E]">
        💡 {latestM1 !== undefined
          ? `${COHORTS[COHORTS.length - 1].month} cohort showing ${latestM1 >= 90 ? "strongest" : "M1 retention at"} ${latestM1}% — ${latestM1 >= 90 ? "early onboarding signal strong" : "monitor for early churn"}`
          : "Cohort data updates monthly"
        }
      </div>
    </div>
  );
}
