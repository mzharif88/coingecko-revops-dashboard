"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Plus, Trash2, AlertTriangle } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

interface Account {
  id: string;
  company: string;
  tier: string;
  arr: string;
  renewalDate: string;
  health: "green" | "yellow" | "red";
  notes: string;
}

const STORAGE_KEY = "revops_renewals";
const TIERS = ["Demo", "Analyst", "Lite", "Pro", "Enterprise"];
const HEALTH_OPTIONS = [
  { value: "green", label: "Healthy", color: "text-green-400 bg-green-900/30" },
  { value: "yellow", label: "At Risk", color: "text-yellow-400 bg-yellow-900/30" },
  { value: "red", label: "Churn Risk", color: "text-red-400 bg-red-900/30" },
];

const today = new Date();
const daysFromNow = (n: number) => new Date(today.getTime() + n * 86400000).toISOString().split("T")[0];

const MOCK_ACCOUNTS: Account[] = [
  { id: "r1", company: "Coinbase", tier: "Enterprise", arr: "180000", renewalDate: daysFromNow(12), health: "green", notes: "Strong usage. Exec relationship solid." },
  { id: "r2", company: "Kraken", tier: "Pro", arr: "42000", renewalDate: daysFromNow(18), health: "yellow", notes: "API call vol dropped 30% last 60 days. Needs QBR." },
  { id: "r3", company: "Bybit", tier: "Pro", arr: "38000", renewalDate: daysFromNow(27), health: "red", notes: "Champion left. New team unresponsive. High churn risk." },
  { id: "r4", company: "CryptoQuant", tier: "Analyst", arr: "16800", renewalDate: daysFromNow(45), health: "green", notes: "Heavy users. Likely upsell to Pro at renewal." },
  { id: "r5", company: "The Block", tier: "Analyst", arr: "14400", renewalDate: daysFromNow(52), health: "yellow", notes: "Budget review in Q3. Needs value reaffirmation." },
  { id: "r6", company: "Wintermute", tier: "Enterprise", arr: "96000", renewalDate: daysFromNow(71), health: "green", notes: "Market maker. Critical data dependency." },
  { id: "r7", company: "Galaxy Digital", tier: "Pro", arr: "44000", renewalDate: daysFromNow(88), health: "green", notes: "Renewed early last year. Satisfied." },
  { id: "r8", company: "Arkham Intel", tier: "Analyst", arr: "18000", renewalDate: daysFromNow(105), health: "yellow", notes: "Exploring DexScreener. Need competitive response." },
];

const emptyAccount = (): Account => ({
  id: Date.now().toString(),
  company: "",
  tier: "Pro",
  arr: "",
  renewalDate: "",
  health: "green",
  notes: "",
});

export default function RenewalRadar() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Account>(emptyAccount());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAccounts(JSON.parse(saved));
    } else {
      setAccounts(MOCK_ACCOUNTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ACCOUNTS));
    }
  }, []);

  const save = (updated: Account[]) => {
    setAccounts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addAccount = () => {
    if (!form.company || !form.renewalDate) return;
    save([...accounts, { ...form, id: Date.now().toString() }]);
    setForm(emptyAccount());
    setShowForm(false);
  };

  const remove = (id: string) => save(accounts.filter((a) => a.id !== id));

  const toggleHealth = (id: string) => {
    save(accounts.map((a) => {
      if (a.id !== id) return a;
      const next = a.health === "green" ? "yellow" : a.health === "yellow" ? "red" : "green";
      return { ...a, health: next };
    }));
  };

  const sorted = [...accounts].sort((a, b) => {
    if (!a.renewalDate) return 1;
    if (!b.renewalDate) return -1;
    return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime();
  });

  const buckets: Record<string, Account[]> = {
    "≤30 days": sorted.filter((a) => { const d = differenceInDays(parseISO(a.renewalDate), new Date()); return d >= 0 && d <= 30; }),
    "31–60 days": sorted.filter((a) => { const d = differenceInDays(parseISO(a.renewalDate), new Date()); return d > 30 && d <= 60; }),
    "61–90 days": sorted.filter((a) => { const d = differenceInDays(parseISO(a.renewalDate), new Date()); return d > 60 && d <= 90; }),
    "90+ days": sorted.filter((a) => { const d = differenceInDays(parseISO(a.renewalDate), new Date()); return d > 90; }),
  };

  const atRiskArr = accounts
    .filter((a) => a.health !== "green")
    .reduce((s, a) => s + (parseFloat(a.arr.replace(/[^0-9.]/g, "")) || 0), 0);

  const totalArr = accounts.reduce((s, a) => s + (parseFloat(a.arr.replace(/[^0-9.]/g, "")) || 0), 0);
  const nrr = totalArr > 0 ? Math.round(((totalArr - atRiskArr * 0.3) / totalArr) * 100) : 100;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="w-4 h-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Renewal Radar</h2>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyAccount()); }}
          className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-[#21262D] text-[#E6EDF3] text-xs font-medium rounded-lg hover:bg-[#30363D] transition-colors"
        >
          <Plus className="w-3 h-3" /> Add Account
        </button>
      </div>

      {/* NRR summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#E6EDF3]">{accounts.length}</div>
          <div className="text-xs text-[#8B949E]">Accounts</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className={`text-lg font-bold ${atRiskArr > 0 ? "text-red-400" : "text-green-400"}`}>${(atRiskArr/1000).toFixed(0)}k</div>
          <div className="text-xs text-[#8B949E]">At-Risk ARR</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className={`text-lg font-bold ${nrr >= 100 ? "text-green-400" : "text-yellow-400"}`}>{nrr}%</div>
          <div className="text-xs text-[#8B949E]">Est. NRR</div>
        </div>
      </div>

      {atRiskArr > 0 && (
        <div className="mb-3 p-2.5 bg-red-900/20 border border-red-800/40 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-300">
            ${atRiskArr.toLocaleString()} ARR at churn risk — prioritize retention outreach
          </span>
        </div>
      )}

      {showForm && (
        <div className="mb-4 p-3 bg-[#0D1117] border border-blue-500/30 rounded-xl space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Company *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-blue-400" />
            <select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] focus:outline-none focus:border-blue-400">
              {TIERS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="ARR ($)" value={form.arr} onChange={(e) => setForm({ ...form, arr: e.target.value })} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-blue-400" />
            <input type="date" value={form.renewalDate} onChange={(e) => setForm({ ...form, renewalDate: e.target.value })} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] focus:outline-none focus:border-blue-400" />
          </div>
          <div className="flex gap-2">
            {HEALTH_OPTIONS.map((h) => (
              <button key={h.value} onClick={() => setForm({ ...form, health: h.value as Account["health"] })} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${form.health === h.value ? h.color : "text-[#8B949E] bg-[#161B22]"}`}>{h.label}</button>
            ))}
          </div>
          <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-blue-400" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1 text-xs text-[#8B949E]">Cancel</button>
            <button onClick={addAccount} className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500">Add</button>
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(buckets).map(([label, accs]) => {
          if (accs.length === 0) return null;
          return (
            <div key={label}>
              <div className={`text-xs font-semibold mb-2 ${label === "≤30 days" ? "text-orange-400" : "text-[#8B949E]"}`}>
                {label === "≤30 days" && "🔥 "}{label} ({accs.length})
              </div>
              <div className="space-y-1">
                {accs.map((acc) => {
                  const days = differenceInDays(parseISO(acc.renewalDate), new Date());
                  return (
                    <div key={acc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#21262D] group transition-colors">
                      <button onClick={() => toggleHealth(acc.id)} className={`w-2 h-2 rounded-full flex-shrink-0 ${acc.health === "green" ? "bg-green-400" : acc.health === "yellow" ? "bg-yellow-400" : "bg-red-400"}`} title="Click to cycle health" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#E6EDF3] truncate">{acc.company}</span>
                          <span className="text-xs text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded">{acc.tier}</span>
                        </div>
                        {acc.notes && <div className="text-xs text-[#8B949E] truncate">{acc.notes}</div>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {acc.arr && <div className="text-xs font-medium text-[#8DC647]">${parseInt(acc.arr).toLocaleString()}</div>}
                        <div className={`text-xs ${days <= 30 ? "text-orange-400" : "text-[#8B949E]"}`}>
                          {format(parseISO(acc.renewalDate), "d MMM yy")}
                        </div>
                      </div>
                      <button onClick={() => remove(acc.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[#8B949E] hover:text-red-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {accounts.length === 0 && !showForm && (
          <div className="text-center text-xs text-[#8B949E] py-6">No accounts tracked. Add one to monitor renewals.</div>
        )}
      </div>
    </div>
  );
}
