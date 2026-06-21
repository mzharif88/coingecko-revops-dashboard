"use client";

import { useEffect, useState } from "react";
import { TrendingUp, AlertTriangle, ClipboardList, DollarSign, RefreshCw, ChevronRight } from "lucide-react";

interface SummaryData {
  quotaAttainment: number;      // %
  quotaTarget: number;
  quotaClosed: number;
  atRiskArr: number;
  totalRenewalArr: number;
  overdueQBRs: number;
  totalAccounts: number;
  openPipeline: number;
  openDeals: number;
  coverageRatio: number;
}

// Reads from localStorage keys set by other components
function computeSummary(): SummaryData {
  // Forecast
  let quotaTarget = 240000, quotaClosed = 142000, pipeline = 87000;
  try {
    const f = localStorage.getItem("revops_forecast");
    if (f) {
      const data = JSON.parse(f);
      const current = data[data.length - 1];
      quotaTarget = current.target;
      quotaClosed = current.actual;
      pipeline = current.pipeline;
    }
  } catch {}

  // Renewals
  let atRiskArr = 0, totalRenewalArr = 0;
  try {
    const r = localStorage.getItem("revops_renewals");
    if (r) {
      const accounts = JSON.parse(r);
      totalRenewalArr = accounts.reduce((s: number, a: any) => s + (parseFloat(a.arr) || 0), 0);
      atRiskArr = accounts.filter((a: any) => a.health !== "green").reduce((s: number, a: any) => s + (parseFloat(a.arr) || 0), 0);
    }
  } catch {}

  // QBR overdue
  let overdueQBRs = 0, totalAccounts = 0;
  try {
    const q = localStorage.getItem("revops_qbr");
    if (q) {
      const accounts = JSON.parse(q);
      totalAccounts = accounts.length;
      overdueQBRs = accounts.filter((a: any) => {
        if (!a.nextQBR) return false;
        return new Date(a.nextQBR) < new Date();
      }).length;
    }
  } catch {}

  // Pipeline
  let openPipeline = 0, openDeals = 0;
  try {
    const p = localStorage.getItem("revops_pipeline");
    if (p) {
      const deals = JSON.parse(p);
      const active = deals.filter((d: any) => !["Closed Won", "Closed Lost"].includes(d.stage));
      openDeals = active.length;
      openPipeline = active.reduce((s: number, d: any) => s + (parseFloat(d.value) || 0), 0);
    }
  } catch {}

  const quotaAttainment = Math.round((quotaClosed / quotaTarget) * 100);
  const coverageRatio = Math.round(((quotaClosed + pipeline) / quotaTarget) * 100);

  return { quotaAttainment, quotaTarget, quotaClosed, atRiskArr, totalRenewalArr, overdueQBRs, totalAccounts, openPipeline, openDeals, coverageRatio };
}

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}

export default function LeadershipSummary() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [refreshed, setRefreshed] = useState(false);

  const refresh = () => {
    setData(computeSummary());
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 800);
  };

  useEffect(() => { setData(computeSummary()); }, []);

  if (!data) return null;

  const attainColor = data.quotaAttainment >= 100 ? "text-green-400" : data.quotaAttainment >= 75 ? "text-yellow-400" : "text-red-400";
  const coverColor  = data.coverageRatio >= 100 ? "text-green-400" : data.coverageRatio >= 80 ? "text-yellow-400" : "text-red-400";
  const riskColor   = data.atRiskArr > 0 ? "text-red-400" : "text-green-400";
  const qbrColor    = data.overdueQBRs > 0 ? "text-red-400" : "text-green-400";

  const attainPct = Math.min(data.quotaAttainment, 100);

  return (
    <div className="card p-5 border border-[#8DC647]/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-[#E6EDF3]">Leadership Summary</h2>
          <p className="text-xs text-[#8B949E] mt-0.5">Revenue Operations · Real-time view</p>
        </div>
        <button onClick={refresh} className="p-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 text-[#8B949E] ${refreshed ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* Quota Attainment */}
        <div className="bg-[#0D1117] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-[#8DC647]" />
            <span className="text-xs text-[#8B949E]">Quota Attainment</span>
          </div>
          <div className={`text-3xl font-bold mb-1 ${attainColor}`}>{data.quotaAttainment}%</div>
          <div className="text-xs text-[#8B949E] mb-2">{fmt(data.quotaClosed)} of {fmt(data.quotaTarget)}</div>
          <div className="h-1.5 bg-[#21262D] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${data.quotaAttainment >= 100 ? "bg-green-400" : data.quotaAttainment >= 75 ? "bg-yellow-400" : "bg-red-400"}`}
              style={{ width: `${attainPct}%` }} />
          </div>
          <div className="text-xs text-[#8B949E] mt-1.5">Coverage: <span className={coverColor}>{data.coverageRatio}%</span></div>
        </div>

        {/* At-Risk ARR */}
        <div className="bg-[#0D1117] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-[#8B949E]">At-Risk ARR</span>
          </div>
          <div className={`text-3xl font-bold mb-1 ${riskColor}`}>{fmt(data.atRiskArr)}</div>
          <div className="text-xs text-[#8B949E] mb-2">of {fmt(data.totalRenewalArr)} renewal ARR</div>
          <div className="h-1.5 bg-[#21262D] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-red-400 transition-all"
              style={{ width: data.totalRenewalArr > 0 ? `${Math.min((data.atRiskArr / data.totalRenewalArr) * 100, 100)}%` : "0%" }} />
          </div>
          <div className="text-xs text-[#8B949E] mt-1.5">
            {data.atRiskArr > 0
              ? <span className="text-red-400">Prioritise retention outreach</span>
              : <span className="text-green-400">All accounts healthy</span>}
          </div>
        </div>

        {/* Overdue QBRs */}
        <div className="bg-[#0D1117] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-[#8B949E]">Overdue QBRs</span>
          </div>
          <div className={`text-3xl font-bold mb-1 ${qbrColor}`}>{data.overdueQBRs}</div>
          <div className="text-xs text-[#8B949E] mb-2">of {data.totalAccounts} accounts tracked</div>
          <div className="h-1.5 bg-[#21262D] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-blue-400 transition-all"
              style={{ width: data.totalAccounts > 0 ? `${Math.min(((data.totalAccounts - data.overdueQBRs) / data.totalAccounts) * 100, 100)}%` : "0%" }} />
          </div>
          <div className="text-xs text-[#8B949E] mt-1.5">
            {data.overdueQBRs > 0
              ? <span className="text-red-400">{data.overdueQBRs} need immediate scheduling</span>
              : <span className="text-green-400">All QBRs on schedule</span>}
          </div>
        </div>

        {/* Open Pipeline */}
        <div className="bg-[#0D1117] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-3.5 h-3.5 text-[#8DC647]" />
            <span className="text-xs text-[#8B949E]">Open Pipeline</span>
          </div>
          <div className="text-3xl font-bold mb-1 text-[#8DC647]">{fmt(data.openPipeline)}</div>
          <div className="text-xs text-[#8B949E] mb-2">{data.openDeals} active deals</div>
          <div className="h-1.5 bg-[#21262D] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-[#8DC647] transition-all"
              style={{ width: data.quotaTarget > 0 ? `${Math.min((data.openPipeline / data.quotaTarget) * 100, 100)}%` : "0%" }} />
          </div>
          <div className="text-xs text-[#8B949E] mt-1.5">
            {fmt(Math.max(data.quotaTarget - data.quotaClosed, 0))} gap to target
          </div>
        </div>
      </div>

      {/* Status ribbon */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-[#21262D]">
        {data.quotaAttainment < 75 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/20 border border-red-800/40 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-xs text-red-300">Quota below 75% — accelerate pipeline</span>
          </div>
        )}
        {data.quotaAttainment >= 75 && data.quotaAttainment < 100 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-900/20 border border-yellow-800/40 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span className="text-xs text-yellow-300">On track — {100 - data.quotaAttainment}% to close</span>
          </div>
        )}
        {data.quotaAttainment >= 100 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/20 border border-green-800/40 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-green-300">Quota attained ✓</span>
          </div>
        )}
        {data.atRiskArr > 50000 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/20 border border-red-800/40 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-xs text-red-300">{fmt(data.atRiskArr)} ARR at churn risk</span>
          </div>
        )}
        {data.overdueQBRs > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-900/20 border border-orange-800/40 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            <span className="text-xs text-orange-300">{data.overdueQBRs} QBR{data.overdueQBRs > 1 ? "s" : ""} overdue</span>
          </div>
        )}
        {data.coverageRatio < 80 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/20 border border-red-800/40 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="text-xs text-red-300">Pipeline coverage {data.coverageRatio}% — below 80% threshold</span>
          </div>
        )}
        <div className="flex items-center gap-1 ml-auto text-xs text-[#8B949E]">
          <span>Computed from Pipeline · Renewals · QBR · Forecast</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
