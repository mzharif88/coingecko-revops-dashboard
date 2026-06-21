"use client";

import { useState, useEffect } from "react";
import { Target, Edit2, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

interface QuarterData {
  quarter: string;
  target: number;
  actual: number;
  pipeline: number;
}

const STORAGE_KEY = "revops_forecast";

const DEFAULT_DATA: QuarterData[] = [
  { quarter: "Q3 2024", target: 180000, actual: 171000, pipeline: 0 },
  { quarter: "Q4 2024", target: 200000, actual: 214000, pipeline: 0 },
  { quarter: "Q1 2025", target: 220000, actual: 198000, pipeline: 0 },
  { quarter: "Q2 2025", target: 240000, actual: 142000, pipeline: 87000 },
];

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-3 text-xs space-y-1">
      <div className="font-semibold text-[#E6EDF3] mb-1">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex gap-3 justify-between">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-[#E6EDF3] font-medium">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function ForecastActual() {
  const [data, setData] = useState<QuarterData[]>(DEFAULT_DATA);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setData(JSON.parse(saved));
  }, []);

  const save = (u: QuarterData[]) => { setData(u); localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); };

  const current = data[data.length - 1];
  const covered = current.actual + current.pipeline;
  const coverageRatio = Math.round((covered / current.target) * 100);
  const coverageColor = coverageRatio >= 100 ? "text-green-400" : coverageRatio >= 80 ? "text-yellow-400" : "text-red-400";
  const pctClosed = Math.round((current.actual / current.target) * 100);

  const saveTarget = () => {
    const val = parseFloat(targetInput.replace(/[^0-9.]/g, ""));
    if (!val) { setEditingTarget(false); return; }
    const updated = data.map((d, i) => i === data.length - 1 ? { ...d, target: val } : d);
    save(updated);
    setEditingTarget(false);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-yellow-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Forecast vs Actual</h2>
        <span className="text-xs text-[#8B949E] ml-auto">Quarterly ARR</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-base font-bold text-yellow-400">{fmt(current.target)}</div>
          <div className="text-xs text-[#8B949E]">Q Target</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-base font-bold text-[#8DC647]">{fmt(current.actual)}</div>
          <div className="text-xs text-[#8B949E]">Closed ({pctClosed}%)</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-base font-bold text-blue-400">{fmt(current.pipeline)}</div>
          <div className="text-xs text-[#8B949E]">Wtd Pipeline</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className={`text-base font-bold ${coverageColor}`}>{coverageRatio}%</div>
          <div className="text-xs text-[#8B949E]">Coverage</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap="30%">
            <XAxis dataKey="quarter" tick={{ fill: "#8B949E", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8B949E", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={45} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <ReferenceLine y={current.target} stroke="#EAB308" strokeDasharray="4 4" strokeWidth={1.5} />
            <Bar dataKey="target" name="Target" fill="#30363D" radius={[3, 3, 0, 0]} />
            <Bar dataKey="actual" name="Actual" fill="#8DC647" radius={[3, 3, 0, 0]} />
            <Bar dataKey="pipeline" name="Pipeline" fill="#60A5FA" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Editable target */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#21262D]">
        <span className="text-xs text-[#8B949E]">Current quarter target:</span>
        {editingTarget ? (
          <div className="flex items-center gap-1">
            <input autoFocus value={targetInput} onChange={e => setTargetInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveTarget()}
              placeholder={fmt(current.target)}
              className="px-2 py-0.5 bg-[#0D1117] border border-yellow-400 rounded text-xs text-[#E6EDF3] w-24 focus:outline-none" />
            <button onClick={saveTarget} className="p-1 text-yellow-400 hover:text-yellow-300"><Check className="w-3.5 h-3.5" /></button>
          </div>
        ) : (
          <button onClick={() => { setEditingTarget(true); setTargetInput(""); }} className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300">
            {fmt(current.target)} <Edit2 className="w-3 h-3" />
          </button>
        )}
        <span className="text-xs text-[#8B949E] ml-auto">Pipeline weighted at 60%</span>
      </div>
    </div>
  );
}
