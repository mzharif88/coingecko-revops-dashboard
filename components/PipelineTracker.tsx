"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, DollarSign } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

interface Deal {
  id: string;
  company: string;
  contact: string;
  tier: string;
  value: string;
  stage: string;
  nextAction: string;
  nextActionDate: string;
  notes: string;
}

const TIERS = ["Demo", "Analyst", "Lite", "Pro", "Enterprise"];
const STAGES = ["Prospect", "Outreach", "Demo", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const STAGE_COLORS: Record<string, string> = {
  Prospect:       "bg-gray-700 text-gray-300",
  Outreach:       "bg-blue-900/50 text-blue-300",
  Demo:           "bg-purple-900/50 text-purple-300",
  Proposal:       "bg-yellow-900/50 text-yellow-300",
  Negotiation:    "bg-orange-900/50 text-orange-300",
  "Closed Won":   "bg-green-900/50 text-green-300",
  "Closed Lost":  "bg-red-900/50 text-red-300",
};

const STORAGE_KEY = "revops_pipeline";
const d = (n: number) => new Date(Date.now() + n * 86400000).toISOString().split("T")[0];

// Pricing reference (CoinGecko public API tiers):
// Analyst: $129/mo = $1,548/yr | Pro: $499/mo = $5,988/yr
// Enterprise: custom, ~$2k-10k+/mo | values below reflect negotiated/volume deals
const MOCK_DEALS: Deal[] = [
  { id: "m1",  company: "Binance",         contact: "Kevin Lim",     tier: "Enterprise", value: "84000",  stage: "Negotiation",  nextAction: "Send revised contract",              nextActionDate: d(2),  notes: "Custom rate limit SLA + dedicated support. Upgrading from Pro." },
  { id: "m2",  company: "OKX",             contact: "Sarah Chen",    tier: "Enterprise", value: "42000",  stage: "Proposal",     nextAction: "Follow up on pricing deck",          nextActionDate: d(4),  notes: "Evaluating against CMC API. Enterprise tier for data licensing terms." },
  { id: "m3",  company: "Nansen",          contact: "Wei Zhang",     tier: "Pro",        value: "8400",   stage: "Demo",         nextAction: "Product demo call",                  nextActionDate: d(1),  notes: "On-chain analytics team. NFT & DeFi endpoints. Pro tier fits usage." },
  { id: "m4",  company: "Jump Trading",    contact: "Alex Park",     tier: "Enterprise", value: "96000",  stage: "Outreach",     nextAction: "LinkedIn connect + intro email",     nextActionDate: d(3),  notes: "Quant desk. High-freq tick data needs. Custom SLA required." },
  { id: "m5",  company: "Messari",         contact: "Tom Rivera",    tier: "Enterprise", value: "36000",  stage: "Closed Won",   nextAction: "",                                   nextActionDate: "",    notes: "Closed Q1. Research platform — Enterprise for data redistribution rights." },
  { id: "m6",  company: "Delphi Digital",  contact: "Maya Patel",    tier: "Analyst",    value: "3000",   stage: "Prospect",     nextAction: "Research team cold outreach",        nextActionDate: d(7),  notes: "Small research team. Analyst tier fits — ~5 seats, moderate call vol." },
  { id: "m7",  company: "Kaiko",           contact: "Pierre Dubois", tier: "Enterprise", value: "60000",  stage: "Proposal",     nextAction: "Send enterprise pricing + SLA doc",  nextActionDate: d(5),  notes: "Institutional data client. Needs tick-by-tick OHLCV + data licensing." },
  { id: "m8",  company: "Arkham Intel",    contact: "Ryan Moore",    tier: "Pro",        value: "9600",   stage: "Demo",         nextAction: "Technical API walkthrough",          nextActionDate: d(2),  notes: "On-chain surveillance. High endpoint usage, Pro tier call vol fits." },
  { id: "m9",  company: "Chainalysis",     contact: "Lisa Nguyen",   tier: "Enterprise", value: "72000",  stage: "Negotiation",  nextAction: "Legal review of data terms",         nextActionDate: d(6),  notes: "Compliance firm. Data licensing + redistribution rights are critical." },
  { id: "m10", company: "Token Terminal",  contact: "Mikko Lahti",   tier: "Analyst",    value: "2400",   stage: "Outreach",     nextAction: "Cold email + product one-pager",     nextActionDate: d(4),  notes: "DeFi financial metrics team. Small team, moderate usage — Analyst fits." },
  { id: "m11", company: "Glassnode",       contact: "Jan Weber",     tier: "Enterprise", value: "48000",  stage: "Closed Won",   nextAction: "",                                   nextActionDate: "",    notes: "On-chain metrics firm. Enterprise for data redistribution. Closed Q2." },
  { id: "m12", company: "Bitget",          contact: "Cindy Zhao",    tier: "Enterprise", value: "36000",  stage: "Prospect",     nextAction: "Qualify data needs + ICP mapping",   nextActionDate: d(10), notes: "Fast-growing CEX. Exchange-scale API usage warrants Enterprise tier." },
  { id: "m13", company: "Wintermute",      contact: "James Liu",     tier: "Enterprise", value: "96000",  stage: "Closed Won",   nextAction: "",                                   nextActionDate: "",    notes: "Algo trading desk. Custom SLA + priority support. Renewed early." },
];

const empty = (): Deal => ({
  id: Date.now().toString(), company: "", contact: "", tier: "Pro",
  value: "", stage: "Prospect", nextAction: "", nextActionDate: "", notes: "",
});

export default function PipelineTracker() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Deal>(empty());
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setDeals(JSON.parse(saved)); }
    else { setDeals(MOCK_DEALS); localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DEALS)); }
  }, []);

  const save = (updated: Deal[]) => { setDeals(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); };
  const addDeal = () => {
    if (!form.company) return;
    save([...deals, { ...form, id: Date.now().toString() }]);
    setForm(empty()); setShowForm(false);
  };
  const removeDeal = (id: string) => save(deals.filter(d => d.id !== id));
  const updateStage = (id: string, stage: string) => save(deals.map(d => d.id === id ? { ...d, stage } : d));

  const activeDeals = deals.filter(d => !["Closed Won", "Closed Lost"].includes(d.stage));
  const wonDeals    = deals.filter(d => d.stage === "Closed Won");
  const totalPipeline = activeDeals.reduce((s, d) => s + (parseFloat(d.value) || 0), 0);
  const wonValue      = wonDeals.reduce((s, d) => s + (parseFloat(d.value) || 0), 0);
  const winRate       = deals.filter(d => d.stage !== "Prospect").length
    ? Math.round((wonDeals.length / deals.filter(d => d.stage !== "Prospect").length) * 100) : 0;

  const urgentDeals = activeDeals.filter(d => {
    if (!d.nextActionDate) return false;
    return differenceInDays(parseISO(d.nextActionDate), new Date()) <= 3;
  });

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-4 h-4 text-[#8DC647]" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Deal Pipeline</h2>
        <button onClick={() => { setShowForm(!showForm); setForm(empty()); }}
          className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-[#8DC647] text-black text-xs font-semibold rounded-lg hover:bg-[#9fd455] transition-colors">
          <Plus className="w-3 h-3" /> New Deal
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#E6EDF3]">{activeDeals.length}</div>
          <div className="text-xs text-[#8B949E]">Active</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#8DC647]">${(totalPipeline/1000).toFixed(0)}k</div>
          <div className="text-xs text-[#8B949E]">Pipeline ARR</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-400">${(wonValue/1000).toFixed(0)}k</div>
          <div className="text-xs text-[#8B949E]">Closed Won</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-400">{winRate}%</div>
          <div className="text-xs text-[#8B949E]">Win Rate</div>
        </div>
      </div>

      {urgentDeals.length > 0 && (
        <div className="mb-3 p-2 bg-orange-900/20 border border-orange-800/40 rounded-lg">
          <div className="text-xs text-orange-400 font-medium mb-1">⚡ Action needed in ≤3 days</div>
          {urgentDeals.map(d => (
            <div key={d.id} className="text-xs text-[#E6EDF3]">{d.company} — {d.nextAction} ({d.nextActionDate})</div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="mb-4 p-3 bg-[#0D1117] border border-[#8DC647]/30 rounded-xl space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Company *" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#8DC647]" />
            <input placeholder="Contact name" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#8DC647]" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select value={form.tier} onChange={e => setForm({...form, tier: e.target.value})} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] focus:outline-none focus:border-[#8DC647]">
              {TIERS.map(t => <option key={t}>{t}</option>)}
            </select>
            <input placeholder="ARR value ($)" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#8DC647]" />
            <select value={form.stage} onChange={e => setForm({...form, stage: e.target.value})} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] focus:outline-none focus:border-[#8DC647]">
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Next action" value={form.nextAction} onChange={e => setForm({...form, nextAction: e.target.value})} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#8DC647]" />
            <input type="date" value={form.nextActionDate} onChange={e => setForm({...form, nextActionDate: e.target.value})} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] focus:outline-none focus:border-[#8DC647]" />
          </div>
          <textarea placeholder="Notes..." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
            className="w-full px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#8DC647] resize-none" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1 text-xs text-[#8B949E]">Cancel</button>
            <button onClick={addDeal} className="px-3 py-1 bg-[#8DC647] text-black text-xs font-semibold rounded-lg">Add Deal</button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {deals.length === 0 && !showForm && (
          <div className="text-center text-xs text-[#8B949E] py-8">No deals yet.</div>
        )}
        {deals.map(deal => (
          <div key={deal.id} className="border border-[#21262D] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-[#21262D]/50 transition-colors"
              onClick={() => setExpanded(expanded === deal.id ? null : deal.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#E6EDF3] truncate">{deal.company}</span>
                  <span className="text-xs text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded">{deal.tier}</span>
                </div>
                {deal.nextAction && (
                  <div className="text-xs text-[#8B949E] truncate mt-0.5">
                    Next: {deal.nextAction}{deal.nextActionDate && ` · ${deal.nextActionDate}`}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {deal.value && <span className="text-xs font-medium text-[#8DC647]">${parseInt(deal.value).toLocaleString()}</span>}
                <select value={deal.stage} onClick={e => e.stopPropagation()} onChange={e => updateStage(deal.id, e.target.value)}
                  className={`text-xs px-2 py-0.5 rounded-full border-0 focus:outline-none cursor-pointer ${STAGE_COLORS[deal.stage] ?? "bg-gray-700 text-gray-300"}`}>
                  {STAGES.map(s => <option key={s} className="bg-[#161B22] text-[#E6EDF3]">{s}</option>)}
                </select>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8B949E] transition-transform ${expanded === deal.id ? "rotate-180" : ""}`} />
              </div>
            </div>
            {expanded === deal.id && (
              <div className="px-3 pb-3 border-t border-[#21262D] pt-2 bg-[#0D1117]/50">
                <div className="grid grid-cols-2 gap-x-4 text-xs text-[#8B949E] mb-2">
                  {deal.contact && <div>Contact: <span className="text-[#E6EDF3]">{deal.contact}</span></div>}
                  {deal.value && <div>ARR: <span className="text-[#8DC647]">${parseInt(deal.value).toLocaleString()}/yr</span></div>}
                </div>
                {deal.notes && <p className="text-xs text-[#8B949E] mb-2">{deal.notes}</p>}
                <button onClick={() => removeDeal(deal.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
