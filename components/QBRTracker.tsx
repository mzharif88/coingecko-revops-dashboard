"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Plus, Trash2, AlertTriangle } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

interface QBRAccount {
  id: string;
  company: string;
  tier: string;
  arr: string;
  csm: string;
  healthScore: number;
  lastQBR: string;
  nextQBR: string;
  lastTouchDate: string;
  openActions: string;
}

const STORAGE_KEY = "revops_qbr";
const TIERS = ["Demo", "Analyst", "Lite", "Pro", "Enterprise"];
const d = (n: number) => new Date(Date.now() + n * 86400000).toISOString().split("T")[0];

// ARR aligned with CoinGecko tier pricing
const MOCK: QBRAccount[] = [
  { id: "q1", company: "Coinbase",     tier: "Enterprise", arr: "180000", csm: "Sarah", healthScore: 91, lastQBR: d(-90),  nextQBR: d(0),   lastTouchDate: d(-3),  openActions: "Review expanded endpoint usage, propose custom SLA upgrade" },
  { id: "q2", company: "Wintermute",   tier: "Enterprise", arr: "96000",  csm: "James", healthScore: 85, lastQBR: d(-45),  nextQBR: d(45),  lastTouchDate: d(-7),  openActions: "Share WebSocket beta access, schedule tech deep-dive" },
  { id: "q3", company: "OKX",          tier: "Enterprise", arr: "42000",  csm: "Sarah", healthScore: 62, lastQBR: d(-95),  nextQBR: d(-5),  lastTouchDate: d(-21), openActions: "OVERDUE — re-engage contact, send monthly usage report" },
  { id: "q4", company: "CryptoQuant",  tier: "Pro",        arr: "7200",   csm: "James", healthScore: 78, lastQBR: d(-30),  nextQBR: d(60),  lastTouchDate: d(-2),  openActions: "Approaching Pro call limit — upsell to Enterprise at renewal" },
  { id: "q5", company: "Bybit",        tier: "Enterprise", arr: "36000",  csm: "Sarah", healthScore: 34, lastQBR: d(-120), nextQBR: d(-30), lastTouchDate: d(-45), openActions: "CRITICAL — champion left, find new exec sponsor urgently" },
  { id: "q6", company: "The Block",    tier: "Analyst",    arr: "2400",   csm: "James", healthScore: 55, lastQBR: d(-60),  nextQBR: d(30),  lastTouchDate: d(-14), openActions: "Budget review Q3 — prepare ROI case study for editorial team" },
];

const emptyAccount = (): QBRAccount => ({
  id: Date.now().toString(), company: "", tier: "Pro", arr: "", csm: "",
  healthScore: 75, lastQBR: "", nextQBR: "", lastTouchDate: "", openActions: "",
});

function getStatus(nextQBR: string): "overdue" | "due-soon" | "on-track" {
  if (!nextQBR) return "on-track";
  const days = differenceInDays(parseISO(nextQBR), new Date());
  if (days < 0) return "overdue";
  if (days <= 30) return "due-soon";
  return "on-track";
}

const STATUS_STYLES = {
  overdue:    "bg-red-900/40 text-red-400",
  "due-soon": "bg-yellow-900/40 text-yellow-400",
  "on-track": "bg-green-900/40 text-green-400",
};
const STATUS_LABELS = { overdue: "Overdue", "due-soon": "Due Soon", "on-track": "On Track" };

export default function QBRTracker() {
  const [accounts, setAccounts] = useState<QBRAccount[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<QBRAccount>(emptyAccount());

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { setAccounts(JSON.parse(saved)); }
    else { setAccounts(MOCK); localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK)); }
  }, []);

  const save = (u: QBRAccount[]) => { setAccounts(u); localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); };
  const remove = (id: string) => save(accounts.filter(a => a.id !== id));
  const add = () => {
    if (!form.company) return;
    save([...accounts, { ...form, id: Date.now().toString() }]);
    setForm(emptyAccount()); setShowForm(false);
  };

  const sorted = [...accounts].sort((a, b) => {
    const order = { overdue: 0, "due-soon": 1, "on-track": 2 };
    return order[getStatus(a.nextQBR)] - order[getStatus(b.nextQBR)];
  });

  const overdue  = accounts.filter(a => getStatus(a.nextQBR) === "overdue").length;
  const dueSoon  = accounts.filter(a => getStatus(a.nextQBR) === "due-soon").length;
  const avgHealth = accounts.length ? Math.round(accounts.reduce((s, a) => s + a.healthScore, 0) / accounts.length) : 0;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-4 h-4 text-blue-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">QBR Tracker</h2>
        <button onClick={() => { setShowForm(!showForm); setForm(emptyAccount()); }}
          className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-[#21262D] text-[#E6EDF3] text-xs font-medium rounded-lg hover:bg-[#30363D] transition-colors">
          <Plus className="w-3 h-3" /> Add Account
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-[#E6EDF3]">{accounts.length}</div>
          <div className="text-xs text-[#8B949E]">Accounts</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className={`text-lg font-bold ${overdue > 0 ? "text-red-400" : "text-green-400"}`}>{overdue}</div>
          <div className="text-xs text-[#8B949E]">Overdue</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className={`text-lg font-bold ${dueSoon > 0 ? "text-yellow-400" : "text-[#E6EDF3]"}`}>{dueSoon}</div>
          <div className="text-xs text-[#8B949E]">Due This Month</div>
        </div>
        <div className="bg-[#0D1117] rounded-lg p-3 text-center">
          <div className={`text-lg font-bold ${avgHealth >= 70 ? "text-green-400" : avgHealth >= 40 ? "text-yellow-400" : "text-red-400"}`}>{avgHealth}</div>
          <div className="text-xs text-[#8B949E]">Avg Health</div>
        </div>
      </div>

      {overdue > 0 && (
        <div className="mb-3 p-2.5 bg-red-900/20 border border-red-800/40 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-300">{overdue} account{overdue > 1 ? "s" : ""} overdue for QBR — schedule immediately</span>
        </div>
      )}

      {showForm && (
        <div className="mb-4 p-3 bg-[#0D1117] border border-blue-500/30 rounded-xl space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Company *" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-blue-400" />
            <input placeholder="CSM owner" value={form.csm} onChange={e => setForm({...form, csm: e.target.value})} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-blue-400" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select value={form.tier} onChange={e => setForm({...form, tier: e.target.value})} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] focus:outline-none focus:border-blue-400">
              {TIERS.map(t => <option key={t}>{t}</option>)}
            </select>
            <input placeholder="ARR ($)" value={form.arr} onChange={e => setForm({...form, arr: e.target.value})} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-blue-400" />
            <input type="number" min="1" max="100" placeholder="Health (1-100)" value={form.healthScore} onChange={e => setForm({...form, healthScore: Number(e.target.value)})} className="px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-blue-400" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><div className="text-xs text-[#8B949E] mb-1">Last QBR</div><input type="date" value={form.lastQBR} onChange={e => setForm({...form, lastQBR: e.target.value})} className="w-full px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] focus:outline-none focus:border-blue-400" /></div>
            <div><div className="text-xs text-[#8B949E] mb-1">Next QBR</div><input type="date" value={form.nextQBR} onChange={e => setForm({...form, nextQBR: e.target.value})} className="w-full px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] focus:outline-none focus:border-blue-400" /></div>
            <div><div className="text-xs text-[#8B949E] mb-1">Last Touch</div><input type="date" value={form.lastTouchDate} onChange={e => setForm({...form, lastTouchDate: e.target.value})} className="w-full px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] focus:outline-none focus:border-blue-400" /></div>
          </div>
          <input placeholder="Open actions..." value={form.openActions} onChange={e => setForm({...form, openActions: e.target.value})} className="w-full px-2.5 py-1.5 bg-[#161B22] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-blue-400" />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="px-3 py-1 text-xs text-[#8B949E]">Cancel</button>
            <button onClick={add} className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500">Add</button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[480px] overflow-y-auto">
        {sorted.map(acc => {
          const status    = getStatus(acc.nextQBR);
          const touchDays = acc.lastTouchDate ? differenceInDays(new Date(), parseISO(acc.lastTouchDate)) : 0;
          const isStale   = touchDays > 30;
          const h         = acc.healthScore;
          const healthColor = h >= 70 ? "bg-green-400" : h >= 40 ? "bg-yellow-400" : "bg-red-400";
          const healthText  = h >= 70 ? "text-green-400" : h >= 40 ? "text-yellow-400" : "text-red-400";
          return (
            <div key={acc.id} className="border border-[#21262D] rounded-lg p-3 hover:bg-[#21262D]/30 group transition-colors">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-medium text-[#E6EDF3]">{acc.company}</span>
                    <span className="text-xs text-[#8B949E] bg-[#21262D] px-1.5 py-0.5 rounded">{acc.tier}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${healthColor}`} style={{ width: `${h}%` }} />
                    </div>
                    <span className={`text-xs font-medium w-8 text-right ${healthText}`}>{h}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#8B949E]">
                    <div>CSM: <span className="text-[#E6EDF3]">{acc.csm}</span></div>
                    {acc.arr && <div>ARR: <span className="text-[#8DC647]">${parseInt(acc.arr).toLocaleString()}</span></div>}
                    <div>Last QBR: <span className="text-[#E6EDF3]">{acc.lastQBR ? format(parseISO(acc.lastQBR), "d MMM yy") : "—"}</span></div>
                    <div>Next QBR: <span className={status === "overdue" ? "text-red-400 font-medium" : "text-[#E6EDF3]"}>{acc.nextQBR ? format(parseISO(acc.nextQBR), "d MMM yy") : "—"}</span></div>
                    <div>Last Touch: <span className={isStale ? "text-red-400 font-medium" : "text-[#E6EDF3]"}>{acc.lastTouchDate ? `${touchDays}d ago` : "—"}{isStale ? " ⚠" : ""}</span></div>
                  </div>
                  {acc.openActions && <div className="text-xs text-[#8B949E] mt-2 truncate">→ {acc.openActions}</div>}
                </div>
                <button onClick={() => remove(acc.id)} className="opacity-0 group-hover:opacity-100 p-1 text-[#8B949E] hover:text-red-400 transition-all flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {accounts.length === 0 && !showForm && (
          <div className="text-center text-xs text-[#8B949E] py-6">No accounts tracked.</div>
        )}
      </div>
    </div>
  );
}
