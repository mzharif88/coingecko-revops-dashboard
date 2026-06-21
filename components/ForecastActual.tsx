"use client";

import { useState, useEffect } from "react";
import { Target, Edit2, Check, Plus, Trash2, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

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
    <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-3 text-xs space-y-1 shadow-xl">
      <div className="font-semibold text-[#E6EDF3] mb-1">{label}</div>
      {payload.filter((p: any) => p.value > 0).map((p: any) => (
        <div key={p.name} className="flex gap-3 justify-between">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-[#E6EDF3] font-medium">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const emptyQ = (): QuarterData => ({ quarter: "", target: 0, actual: 0, pipeline: 0 });

export default function ForecastActual() {
  const [data, setData] = useState<QuarterData[]>(DEFAULT_DATA);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<QuarterData>(emptyQ());
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<QuarterData>(emptyQ());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setData(JSON.parse(saved));
  }, []);

  const save = (u: QuarterData[]) => {
    setData(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditForm({ ...data[idx] });
  };

  const saveEdit = () => {
    if (editingIdx === null) return;
    const updated = data.map((d, i) => i === editingIdx ? { ...editForm, target: Number(editForm.target), actual: Number(editForm.actual), pipeline: Number(editForm.pipeline) } : d);
    save(updated);
    setEditingIdx(null);
  };

  const removeQuarter = (idx: number) => {
    if (data.length <= 1) return;
    save(data.filter((_, i) => i !== idx));
  };

  const addQuarter = () => {
    if (!addForm.quarter) return;
    save([...data, { ...addForm, target: Number(addForm.target), actual: Number(addForm.actual), pipeline: Number(addForm.pipeline) }]);
    setAddForm(emptyQ());
    setShowAddForm(false);
  };

  const current = data[data.length - 1];
  const covered = current.actual + current.pipeline;
  const coverageRatio = Math.round((covered / current.target) * 100);
  const coverageColor = coverageRatio >= 100 ? "text-green-400" : coverageRatio >= 80 ? "text-yellow-400" : "text-red-400";
  const pctClosed = Math.round((current.actual / current.target) * 100);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-yellow-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Forecast vs Actual</h2>
        <button onClick={() => { setShowAddForm(!showAddForm); setAddForm(emptyQ()); }}
          className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-[#21262D] text-[#E6EDF3] text-xs font-medium rounded-lg hover:bg-[#30363D] transition-colors">
          <Plus className="w-3 h-3" /> Add Quarter
        </button>
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
      <div className="h-48 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={3} barCategoryGap="28%">
            <XAxis dataKey="quarter" tick={{ fill: "#8B949E", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8B949E", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} width={42} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <ReferenceLine y={current.target} stroke="#EAB308" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Target", fill: "#EAB308", fontSize: 10, position: "insideTopRight" }} />
            <Bar dataKey="target" name="Target" fill="#30363D" radius={[3, 3, 0, 0]} />
            <Bar dataKey="actual" name="Actual" fill="#8DC647" radius={[3, 3, 0, 0]} />
            <Bar dataKey="pipeline" name="Pipeline" fill="#60A5FA" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Add quarter form */}
      {showAddForm && (
        <div className="mb-3 p-3 bg-[#0D1117] border border-yellow-500/30 rounded-xl space-y-2">
          <div className="text-xs font-medium text-[#E6EDF3] mb-1">Add Quarter</div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Quarter (e.g. Q3 2025)" value={addForm.quarter} onChange={e => setAddForm({...addForm, quarter: e.target.value})}
              className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-yellow-400 col-span-2" />
            <input placeholder="Target ARR ($)" value={addForm.target || ""} onChange={e => setAddForm({...addForm, target: e.target.value as any})}
              className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-yellow-400" />
            <input placeholder="Actual closed ($)" value={addForm.actual || ""} onChange={e => setAddForm({...addForm, actual: e.target.value as any})}
              className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-yellow-400" />
            <input placeholder="Weighted pipeline ($)" value={addForm.pipeline || ""} onChange={e => setAddForm({...addForm, pipeline: e.target.value as any})}
              className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-yellow-400 col-span-2" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAddForm(false)} className="px-3 py-1 text-xs text-[#8B949E]">Cancel</button>
            <button onClick={addQuarter} className="px-3 py-1 bg-yellow-600 text-black text-xs font-semibold rounded-lg hover:bg-yellow-500">Add</button>
          </div>
        </div>
      )}

      {/* Editable quarter table */}
      <div className="space-y-1 pt-3 border-t border-[#21262D]">
        <div className="text-xs text-[#8B949E] font-medium mb-2">Edit quarters</div>
        {data.map((q, idx) => (
          editingIdx === idx ? (
            <div key={idx} className="p-2 bg-[#0D1117] border border-yellow-400/30 rounded-lg space-y-2">
              <div className="grid grid-cols-4 gap-2">
                <input value={editForm.quarter} onChange={e => setEditForm({...editForm, quarter: e.target.value})}
                  className="px-2 py-1 bg-[#161B22] border border-[#21262D] rounded text-xs text-[#E6EDF3] focus:outline-none focus:border-yellow-400" />
                <input value={editForm.target} onChange={e => setEditForm({...editForm, target: e.target.value as any})} placeholder="Target"
                  className="px-2 py-1 bg-[#161B22] border border-[#21262D] rounded text-xs text-[#E6EDF3] focus:outline-none focus:border-yellow-400" />
                <input value={editForm.actual} onChange={e => setEditForm({...editForm, actual: e.target.value as any})} placeholder="Actual"
                  className="px-2 py-1 bg-[#161B22] border border-[#21262D] rounded text-xs text-[#E6EDF3] focus:outline-none focus:border-yellow-400" />
                <input value={editForm.pipeline} onChange={e => setEditForm({...editForm, pipeline: e.target.value as any})} placeholder="Pipeline"
                  className="px-2 py-1 bg-[#161B22] border border-[#21262D] rounded text-xs text-[#E6EDF3] focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingIdx(null)} className="px-2 py-0.5 text-xs text-[#8B949E]">Cancel</button>
                <button onClick={saveEdit} className="flex items-center gap-1 px-2 py-0.5 bg-yellow-600 text-black text-xs font-semibold rounded">
                  <Check className="w-3 h-3" /> Save
                </button>
              </div>
            </div>
          ) : (
            <div key={idx} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-[#21262D] group transition-colors">
              <span className="text-xs text-[#8B949E] w-20">{q.quarter}</span>
              <span className="text-xs text-yellow-400 w-16">{fmt(q.target)}</span>
              <span className="text-xs text-[#8DC647] w-16">{fmt(q.actual)}</span>
              <span className="text-xs text-blue-400 w-16">{fmt(q.pipeline)}</span>
              <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(idx)} className="p-1 text-[#8B949E] hover:text-yellow-400">
                  <Edit2 className="w-3 h-3" />
                </button>
                {data.length > 1 && (
                  <button onClick={() => removeQuarter(idx)} className="p-1 text-[#8B949E] hover:text-red-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )
        ))}
        <div className="flex gap-4 px-2 pt-1">
          <span className="text-xs text-[#8B949E] w-20">Quarter</span>
          <span className="text-xs text-[#8B949E] w-16">Target</span>
          <span className="text-xs text-[#8B949E] w-16">Actual</span>
          <span className="text-xs text-[#8B949E] w-16">Pipeline</span>
        </div>
      </div>
      <div className="text-xs text-[#8B949E] mt-2">Pipeline weighted at 60% probability</div>
    </div>
  );
}
