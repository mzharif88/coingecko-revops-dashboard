"use client";

import { useEffect, useState } from "react";
import { Star, Plus, X, Search } from "lucide-react";
import Image from "next/image";

interface WatchCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  note?: string;
}

const STORAGE_KEY = "revops_watchlist";
const DEFAULT_IDS = ["bitcoin", "ethereum", "binancecoin", "solana"];

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(5)}`;
}

export default function Watchlist() {
  const [ids, setIds] = useState<string[]>([]);
  const [coins, setCoins] = useState<WatchCoin[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [addInput, setAddInput] = useState("");
  const [editNote, setEditNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : { ids: DEFAULT_IDS, notes: {} };
    setIds(parsed.ids ?? DEFAULT_IDS);
    setNotes(parsed.notes ?? {});
  }, []);

  useEffect(() => {
    if (!ids.length) { setLoading(false); return; }
    const params = new URLSearchParams({
      vs_currency: "usd",
      ids: ids.join(","),
      order: "market_cap_desc",
      per_page: "50",
      page: "1",
      sparkline: "false",
      price_change_percentage: "7d",
    });
    fetch(`/api/cg?path=%2Fcoins%2Fmarkets&${params}`)
      .then((r) => r.json())
      .then((data) => { setCoins(data); setLoading(false); });
  }, [ids]);

  const save = (newIds: string[], newNotes: Record<string, string>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ids: newIds, notes: newNotes }));
  };

  const removeId = (id: string) => {
    const newIds = ids.filter((i) => i !== id);
    setIds(newIds);
    save(newIds, notes);
  };

  const addId = () => {
    const cleaned = addInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (!cleaned || ids.includes(cleaned)) { setAddInput(""); return; }
    const newIds = [...ids, cleaned];
    setIds(newIds);
    save(newIds, notes);
    setAddInput("");
  };

  const saveNote = (id: string) => {
    const newNotes = { ...notes, [id]: noteText };
    setNotes(newNotes);
    save(ids, newNotes);
    setEditNote(null);
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-yellow-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">My Watchlist</h2>
        <span className="text-xs text-[#8B949E] ml-auto">Pinned coins</span>
      </div>

      {/* Add coin */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#8B949E]" />
          <input
            value={addInput}
            onChange={(e) => setAddInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addId()}
            placeholder="Add coin by ID (e.g. chainlink)"
            className="w-full pl-8 pr-3 py-1.5 bg-[#0D1117] border border-[#21262D] rounded-lg text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#8DC647]"
          />
        </div>
        <button
          onClick={addId}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#8DC647] text-black text-xs font-semibold rounded-lg hover:bg-[#9fd455] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-[#21262D] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {coins.map((coin) => (
            <div key={coin.id}>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#21262D] group transition-colors">
                <Image src={coin.image} alt={coin.name} width={28} height={28} className="rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#E6EDF3]">{coin.name}</span>
                    <span className="text-xs text-[#8B949E] uppercase">{coin.symbol}</span>
                  </div>
                  {notes[coin.id] ? (
                    <div className="text-xs text-[#8B949E] truncate">{notes[coin.id]}</div>
                  ) : (
                    <button
                      onClick={() => { setEditNote(coin.id); setNoteText(""); }}
                      className="text-xs text-[#8B949E] hover:text-[#8DC647] transition-colors"
                    >
                      + add note
                    </button>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[#E6EDF3]">{fmtPrice(coin.current_price)}</div>
                  <div className="flex gap-2 justify-end">
                    <span className={`text-xs ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(1)}%
                    </span>
                    {coin.price_change_percentage_7d_in_currency !== undefined && (
                      <span className={`text-xs ${coin.price_change_percentage_7d_in_currency >= 0 ? "text-green-400" : "text-red-400"}`}>
                        7d: {coin.price_change_percentage_7d_in_currency >= 0 ? "+" : ""}{coin.price_change_percentage_7d_in_currency?.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeId(coin.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-[#8B949E] transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {editNote === coin.id && (
                <div className="ml-10 mt-1 flex gap-2">
                  <input
                    autoFocus
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveNote(coin.id)}
                    placeholder="e.g. Key client uses this token"
                    className="flex-1 px-2 py-1 bg-[#0D1117] border border-[#8DC647] rounded text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none"
                  />
                  <button onClick={() => saveNote(coin.id)} className="px-2 py-1 bg-[#8DC647] text-black text-xs rounded font-medium">Save</button>
                  <button onClick={() => setEditNote(null)} className="px-2 py-1 text-[#8B949E] text-xs">Cancel</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
