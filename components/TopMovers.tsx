"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import Image from "next/image";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  market_cap_rank: number;
}

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(5)}`;
}

function fmtLarge(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toFixed(0)}`;
}

export default function TopMovers() {
  const [gainers, setGainers] = useState<Coin[]>([]);
  const [losers, setLosers]   = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<"gainers" | "losers">("gainers");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({
      vs_currency: "usd", order: "market_cap_desc",
      per_page: "250", page: "1", sparkline: "false",
    });
    fetch(`/api/cg?path=%2Fcoins%2Fmarkets&${params}`)
      .then(r => r.json())
      .then((data: Coin[]) => {
        const sorted = [...data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        setGainers(sorted.slice(0, 15));
        setLosers(sorted.slice(-15).reverse());
        setLoading(false);
      });
  }, []);

  const list = tab === "gainers" ? gainers : losers;

  return (
    <div className="card p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex rounded-lg overflow-hidden border border-[#21262D]">
          <button onClick={() => { setTab("gainers"); setSelected(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${tab === "gainers" ? "bg-green-900/50 text-green-400" : "text-[#8B949E] hover:text-[#E6EDF3]"}`}>
            <TrendingUp className="w-3 h-3" /> Top Gainers
          </button>
          <button onClick={() => { setTab("losers"); setSelected(null); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${tab === "losers" ? "bg-red-900/50 text-red-400" : "text-[#8B949E] hover:text-[#E6EDF3]"}`}>
            <TrendingDown className="w-3 h-3" /> Top Losers
          </button>
        </div>
        <span className="text-xs text-[#8B949E] ml-auto">24h · Live</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#21262D] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {list.map(coin => {
            const isSelected = selected === coin.id;
            const pct = coin.price_change_percentage_24h;
            return (
              <div key={coin.id}>
                <div
                  onClick={() => setSelected(isSelected ? null : coin.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-[#21262D] transition-colors ${isSelected ? "bg-[#21262D] ring-1 ring-[#8DC647]/30" : ""}`}>
                  <Image src={coin.image} alt={coin.name} width={22} height={22} className="rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#E6EDF3] truncate">{coin.name}</div>
                    <div className="text-xs text-[#8B949E] uppercase">{coin.symbol}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#E6EDF3]">{fmtPrice(coin.current_price)}</div>
                    <div className={`text-xs font-medium ${pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {pct >= 0 ? "+" : ""}{pct?.toFixed(2)}%
                    </div>
                  </div>
                  <a href={`https://www.coingecko.com/en/coins/${coin.id}`} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-0.5 text-[#8B949E] hover:text-[#E6EDF3] flex-shrink-0">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {isSelected && (
                  <div className="mx-1 mb-1 px-3 py-2 bg-[#0D1117] border border-[#21262D] rounded-b-lg border-t-0">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div><div className="text-[#8B949E]">Market Cap</div><div className="text-[#E6EDF3]">{fmtLarge(coin.market_cap)}</div></div>
                      <div><div className="text-[#8B949E]">24h Volume</div><div className="text-[#E6EDF3]">{fmtLarge(coin.total_volume)}</div></div>
                      <div><div className="text-[#8B949E]">MC Rank</div><div className="text-[#E6EDF3]">#{coin.market_cap_rank}</div></div>
                    </div>
                    <div className="mt-1.5 text-xs text-[#8B949E]">
                      {tab === "gainers"
                        ? "High volatility = high API demand from trading desks & data teams"
                        : "Downward movement increases demand for risk analytics & monitoring APIs"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-[#8B949E] mt-3 pt-3 border-t border-[#21262D]">
        Click any coin for details · High volatility = high API demand from exchanges & data teams
      </p>
    </div>
  );
}
