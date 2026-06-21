"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2, ChevronDown } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

interface AdsDeal {
  id: string;
  company: string;
  contact: string;
  product: "CoinGecko Ads" | "GeckoTerminal Ads";
  budget: string;
  stage: string;
  campaignStart: string;
  notes: string;
}

const STORAGE_KEY = "revops_ads_pipeline";
const STAGES = ["Prospect", "Outreach", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const PRODUCTS = ["CoinGecko Ads", "GeckoTerminal Ads"];
const STAGE_COLORS: Record<string, string> = {
  Prospect: "bg-gray-700 text-gray-300",
  Outreach: "bg-blue-900/50 text-blue-300",
  Proposal: "bg-yellow-900/50 text-yellow-300",
  Negotiation: "bg-orange-900/50 text-orange-300",
  "Closed Won": "bg-green-900/50 text-green-300",
  "Closed Lost": "bg-red-900/50 text-red-300",
};

const d = (n: number) => new Date(Date.now() + n * 86400000).toISOString().split("T")[0];

const MOCK_ADS: AdsDeal[] = [
  { id: "a1", company: "Ledger",         contact: "Claire Morin",  product: "CoinGecko Ads",    budget: "12000",  stage: "Closed Won",   campaignStart: d(7),   notes: "Hardware wallet campaign. 3-month run. Banner + sponsored listing." },
  { id: "a2", company: "1inch Network",  contact: "Sergej Kunz",   product: "GeckoTerminal Ads",budget: "4800",   stage: "Proposal",     campaignStart: d(14),  notes: "DEX aggregator. Self-serve GeckoTerminal placement at $299/mo." },
  { id: "a3", company: "Tangem",         contact: "Andy Fang",     product: "CoinGecko Ads",    budget: "8500",   stage: "Negotiation",  campaignStart: d(10),  notes: "Cold wallet brand awareness. Targeting DeFi audience segment." },
  { id: "a4", company: "Bitget Wallet",  contact: "Grace Zhou",    product: "CoinGecko Ads",    budget: "15000",  stage: "Proposal",     campaignStart: d(21),  notes: "Enterprise campaign. Negotiated directly. CPM + sponsored search." },
  { id: "a5", company: "Alchemy",        contact: "Nikil Viswanathan", product: "GeckoTerminal Ads", budget: "3600", stage: "Outreach", campaignStart: "",    notes: "Web3 dev platform. GeckoTerminal placement for DeFi dev audience." },
  { id: "a6", company: "Fireblocks",     contact: "Michael Shaulov", product: "CoinGecko Ads", budget: "22000",  stage: "Negotiation",  campaignStart: d(30),  notes: "Institutional custody. Premium placement + research report sponsorship." },
  { id: "a7", company: "Phantom Wallet", contact: "Chris Kalani",  product: "GeckoTerminal Ads",budget: "2400",   stage: "Prospect",     campaignStart: "",     notes: "Solana wallet. Self-serve intro. Target Solana DEX users on GeckoTerminal." },
];

const empty = (): AdsDeal => ({
  id: Date.now().toString(), company: "", contact: "",
  product: "CoinGecko Ads", budget: "", stage: "Prospect", campaignStart: "", notes: "",
});

export default function AdsPipeline() {
  const [deals, setDeals] = useState<AdsDeal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AdsDeal>(empty());
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setDeals(JSON.parse(saved)); }
    else { setDeals(MOCK_ADS); localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ADS)); }
  }, []);

  const save = (u: AdsDeal[]) => { setDeals(u); localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); };
  const add = () => {
    if (!form.company) return;
    save([...deals, { ...form, id: Date.now().toString() }]);
    setForm(empty()); setShowForm(false);
  };
  const remove = (id: string) => save(deals.filter(d => d.id !== id));
  const updateStage = (id: string, stage: string) => save(deals.map(d => d.id === id ? {...d, stage} : d));

  const active = deals.filter(d => !["Closed Won", "Closed Lost"].includes(d.stage));
  const won    = deals.filter(d => d.stage === "Closed Won");
  const cgAds  = deals.filter(d => d.product === "CoinGecko Ads");
  const gtAds  = deals.filter(d => d.product === "GeckoTerminal Ads");

  const totalPipeline = active.reduce((s, d) => s + (parseFloat(d.budget) || 0), 0);
  const wonValue = won.reduce((s, d) => s + (parseFloat(d.budget) || 0), 0);

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone className="w-4 h-4 text-pink-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Ads Pipeline</h2>
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs px-1.5 py-0.5 bg-blue-900/30 text-blue-400 rounded">CG Ads {cgAds.length}</span>
          <span className="text-xs px-1.5 py-0.5 bg-purple-900/30 text-purple-400 rounded">GT Ads {gtAds.length}</span>
        </div>
        <button onClick={() => { setShowForm(!showForm); setForm(empty()); }}
          className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-pink-900/40 text-pink-400 text-xs font-medium rounded-lg hover:bg-pink-900/60 transition-colors border border-pink-800/40">
          <Plus className="w-3 h-3" /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#E6EDF3]">{active.length}</div>
          <div className="text-xs text-[#8B949E]">Active</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-pink-400">${(totalPipeline/1000).toFixed(0)}k</div>
          <div className="text-xs text-[#8B949E]">Ad Pipeline</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-400">${(wonValue/1000).toFixed(0)}k</div>
          <div className="text-xs text-[#8B949E]">Closed Won</div>
        </div>
      </div>

      {showForm && (
        <div className="mb-4 p-3 bg-[#0D1117] border border-pink-500/30 rounded-xl space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Company *" value={form.company} onChange={e => setForm({...form, company: e.target.value})}
              className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-pink-400" />
            <input placeholder="Contact name" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})}
              className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-pink-400" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select value={form.product} onChange={e => setForm({...form, product: e.target.value as any})}
              className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] focus:outline-none focus:border-pink-400">
              {PRODUCTS.map(p => <option key={p}>{p}</option>)}
            </select>
            <input placeholder="Budget ($)" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})}
              className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-pink-400" />
            <select value={form.stage} onChange={e => setForm({...form, stage: e.target.value})}
              className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] focus:outline-none focus:border-pink-400">
              {STAGES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1 text-xs text-[#8B949E]">Cancel</button>
            <button onClick={add} className="px-3 py-1 bg-pink-600 text-white text-xs font-semibold rounded-lg hover:bg-pink-500">Add</button>
          </div>
        </div>
      )}

      <div className="space-y-1.5 max-h-80 overflow-y-auto">
        {deals.map(deal => (
          <div key={deal.id} className="border border-[#21262D] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-[#21262D]/50 transition-colors"
              onClick={() => setExpanded(expanded === deal.id ? null : deal.id)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#E6EDF3] truncate">{deal.company}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${deal.product === "CoinGecko Ads" ? "text-blue-400 bg-blue-900/30" : "text-purple-400 bg-purple-900/30"}`}>
                    {deal.product === "CoinGecko Ads" ? "CG Ads" : "GT Ads"}
                  </span>
                </div>
                {deal.notes && <div className="text-xs text-[#8B949E] truncate mt-0.5">{deal.notes}</div>}
              </div>
              <div className="flex items-center gap-2">
                {deal.budget && <span className="text-xs font-medium text-pink-400">${parseInt(deal.budget).toLocaleString()}</span>}
                <select value={deal.stage} onClick={e => e.stopPropagation()} onChange={e => updateStage(deal.id, e.target.value)}
                  className={`text-xs px-2 py-0.5 rounded-full border-0 focus:outline-none cursor-pointer ${STAGE_COLORS[deal.stage] ?? "bg-gray-700 text-gray-300"}`}>
                  {STAGES.map(s => <option key={s} className="bg-[#161B22] text-[#E6EDF3]">{s}</option>)}
                </select>
                <ChevronDown className={`w-3.5 h-3.5 text-[#8B949E] transition-transform ${expanded === deal.id ? "rotate-180" : ""}`} />
              </div>
            </div>
            {expanded === deal.id && (
              <div className="px-3 pb-3 border-t border-[#21262D] pt-2 bg-[#0D1117]/50">
                {deal.contact && <div className="text-xs text-[#8B949E] mb-1">Contact: <span className="text-[#E6EDF3]">{deal.contact}</span></div>}
                {deal.campaignStart && <div className="text-xs text-[#8B949E] mb-1">Campaign start: <span className="text-[#E6EDF3]">{deal.campaignStart}</span></div>}
                <button onClick={() => remove(deal.id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 mt-1">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-[#21262D] text-xs text-[#8B949E]">
        Tracks CoinGecko Ads ($299+ self-serve) and GeckoTerminal Ads ($99+ self-serve) campaigns
      </div>
    </div>
  );
}
