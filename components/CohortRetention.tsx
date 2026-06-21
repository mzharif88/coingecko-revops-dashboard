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

  const m1Scores = COHORTS.map(c => ({ month: c.month, val: c.retention[1] ?? 0 }));
  const best  = m1Scores.reduce((a, b) => b.val > a.val ? b : a);
  const worst = m1Scores.filter(x => x.val > 0).reduce((a, b) => b.val < a.val ? b : a);

  // Trend: is M1 improving or declining?
  const recentM1 = m1Vals.slice(-3);
  const m1Trend = recentM1.length >= 2
    ? recentM1[recentM1.length - 1] - recentM1[0]
    : 0;

  // Headline insight
  let insight = "";
  let insightColor = "text-[#8B949E]";
  if (m1Trend > 2) {
    insight = `M1 retention trending up +${m1Trend.toFixed(0)}pp over last 3 cohorts — onboarding improving.`;
    insightColor = "text-green-400";
  } else if (m1Trend < -2) {
    insight = `M1 retention declining ${m1Trend.toFixed(0)}pp — investigate early churn signals.`;
    insightColor = "text-red-400";
  } else {
    const jan = COHORTS[0];
    const m5 = jan.retention[5];
    if (m5 !== undefined && m5 < 75) {
      insight = `Jan 2025 cohort dropped to ${m5}% at M5 — long-term retention needs attention.`;
      insightColor = "text-yellow-400";
    } else {
      insight = `${best.month.split(" ")[0]} cohort leads M1 at ${best.val}%. Avg M1 stable at ${avgM1}%.`;
      insightColor = "text-[#8DC647]";
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Grid className="w-4 h-4 text-purple-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Cohort Retention</h2>
        <span className="text-xs text-[#8B949E] ml-auto">Monthly signups · Mock</span>
      </div>

      {/* Headline insight — first thing leadership reads */}
      <div className={`mb-4 p-3 bg-[#0D1117] rounded-lg border border-[#21262D] text-xs font-medium ${insightColor}`}>
        💡 {insight}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-[#0D1117] rounded-lg p-2.5 text-center">
          <div className={`text-lg font-bold ${avgM1 >= 90 ? "text-green-400" : avgM1 >= 80 ? "text-yellow-400" : "text-red-400"}`}>{avgM1}%</div>
          <div className="text-xs text-[#8B949E]">Avg M1</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-2.5 text-center">
          <div className={`text-lg font-bold ${avgM3 && avgM3 >= 80 ? "text-green-400" : "text-yellow-400"}`}>{avgM3 ?? "—"}%</div>
          <div className="text-xs text-[#8B949E]">Avg M3</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-green-400">{best.val}%</div>
          <div className="text-xs text-[#8B949E] truncate">Best ({best.month.split(" ")[0]})</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-2.5 text-center">
          <div className="text-lg font-bold text-red-400">{worst.val}%</div>
          <div className="text-xs text-[#8B949E] truncate">Worst ({worst.month.split(" ")[0]})</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-[#8B949E] font-medium pb-2 pr-3 whitespace-nowrap">Cohort</th>
              <th className="text-center text-[#8B949E] font-medium pb-2 px-1">n</th>
              {Array.from({ length: MAX_MONTHS }).map((_, i) => (
                <th key={i} className="text-center text-[#8B949E] font-medium pb-2 px-1 min-w-[44px]">M{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COHORTS.map((row) => (
              <tr key={row.month}>
                <td className="text-[#E6EDF3] pr-3 py-1 whitespace-nowrap">{row.month}</td>
                <td className="text-center text-[#8B949E] px-1 py-1">{row.startCount}</td>
                {Array.from({ length: MAX_MONTHS }).map((_, mi) => {
                  const val = row.retention[mi];
                  return (
                    <td key={mi} className="px-0.5 py-1">
                      {val !== undefined ? (
                        <div className={`text-center rounded px-1 py-0.5 font-medium ${cellColor(val)}`}>{val}%</div>
                      ) : (
                        <div className="text-center text-[#21262D] text-xs">—</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
