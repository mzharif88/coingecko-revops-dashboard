"use client";

import { useState, useEffect } from "react";
import { Plug, RefreshCw, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Deal {
  id: string; company: string; tier: string; value: string; stage: string; nextActionDate: string;
}

interface SyncData {
  source: "hubspot" | "mock";
  deals: Deal[];
  lastSync: string;
  total: number;
}

const STAGE_COLORS: Record<string, string> = {
  "Closed Won": "text-green-400", "Negotiation": "text-orange-400",
  "Proposal": "text-yellow-400", "Demo": "text-purple-400",
  "Outreach": "text-blue-400", "Prospect": "text-gray-400", "Closed Lost": "text-red-400",
};

export default function HubSpotSync() {
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/hubspot")
      .then(r => r.json())
      .then(d => { setSyncData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const isLive = syncData?.source === "hubspot";
  const topDeals = [...(syncData?.deals ?? [])]
    .filter(d => !["Closed Lost"].includes(d.stage))
    .sort((a, b) => (parseFloat(b.value) || 0) - (parseFloat(a.value) || 0))
    .slice(0, 5);
  const totalPipeline = (syncData?.deals ?? [])
    .filter(d => !["Closed Won", "Closed Lost"].includes(d.stage))
    .reduce((s, d) => s + (parseFloat(d.value) || 0), 0);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Plug className="w-4 h-4 text-orange-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">HubSpot Sync</h2>
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${isLive ? "bg-green-900/40 text-green-400" : "bg-[#21262D] text-[#8B949E]"}`}>
          {isLive ? "● Live — HubSpot" : "● Mock Data"}
        </span>
        <button onClick={fetchData} disabled={loading}
          className="ml-auto p-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] transition-colors disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 text-[#8B949E] ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {syncData && (
        <div className="text-xs text-[#8B949E] mb-3">
          Last synced: {format(parseISO(syncData.lastSync), "d MMM yyyy, HH:mm")} · {syncData.total} deals
        </div>
      )}

      {!isLive && (
        <div className="mb-4 bg-[#0D1117] border border-[#21262D] rounded-xl overflow-hidden">
          <div className="p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-yellow-300 font-medium">Showing mock data</div>
              <div className="text-xs text-[#8B949E] mt-0.5">Add HUBSPOT_API_KEY to Vercel env vars to connect live CRM data</div>
            </div>
            <button onClick={() => setShowGuide(!showGuide)} className="text-[#8B949E] hover:text-[#E6EDF3] transition-colors">
              {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {showGuide && (
            <div className="px-4 pb-4 border-t border-[#21262D] pt-3 space-y-2">
              <div className="text-xs font-semibold text-[#E6EDF3] mb-2">How to connect HubSpot:</div>
              {[
                "HubSpot → Settings → Integrations → Private Apps → Create app → copy token",
                "Vercel Dashboard → Project → Settings → Environment Variables",
                "Add variable: HUBSPOT_API_KEY = your_private_app_token",
                "Redeploy project — sync will go live automatically",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#8B949E]">
                  <span className="w-4 h-4 rounded-full bg-[#21262D] text-[#E6EDF3] flex items-center justify-center flex-shrink-0 text-xs font-medium">{i + 1}</span>
                  {step}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isLive && (
        <div className="mb-3 p-2.5 bg-green-900/10 border border-green-800/30 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
          <span className="text-xs text-green-300">Connected to HubSpot CRM — showing live deal data</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#E6EDF3]">{syncData?.deals.filter(d => !["Closed Won","Closed Lost"].includes(d.stage)).length ?? 0}</div>
          <div className="text-xs text-[#8B949E]">Active Deals</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#8DC647]">${(totalPipeline/1000).toFixed(0)}k</div>
          <div className="text-xs text-[#8B949E]">Pipeline ARR</div>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        <div className="text-xs text-[#8B949E] font-medium mb-2">Top deals by value</div>
        {topDeals.map(deal => (
          <div key={deal.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#21262D] transition-colors">
            <div className="flex-1 min-w-0">
              <span className="text-sm text-[#E6EDF3] truncate block">{deal.company}</span>
              <span className={`text-xs ${STAGE_COLORS[deal.stage] ?? "text-[#8B949E]"}`}>{deal.stage}</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-[#8DC647]">${parseInt(deal.value).toLocaleString()}</div>
              {deal.nextActionDate && <div className="text-xs text-[#8B949E]">{deal.nextActionDate}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-[#21262D] text-xs text-[#8B949E]">
        Full view in <span className="text-[#8DC647]">Deal Pipeline ↗</span>
      </div>
    </div>
  );
}
