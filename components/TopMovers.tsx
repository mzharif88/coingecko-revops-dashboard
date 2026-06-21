"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
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
}

function fmtPrice(n: number) {
  if (n >= 1000) return `$${n.toLocaleString("en", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(5)}`;
}

function fmtVol(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toFixed(0)}`;
}

export default function TopMovers() {
  const [gainers, setGainers] = useState<Coin[]>([]);
  const [losers, setLosers] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"gainers" | "losers">("gainers");

  useEffect(() => {
    const params = new URLSearchParams({
      vs_currency: "usd",
      order: "market_cap_desc",
      per_page: "250",
      page: "1",
      sparkline: "false",
    });
    fetch(`/api/cg?path=%2Fcoins%2Fmarkets&${params}`)
      .then((r) => r.json())
      .then((data: Coin[]) => {
        const sorted = [...data].sort(
          (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
        );
        setGainers(sorted.slice(0, 6));
        setLosers(sorted.slice(-6).reverse());
        setLoading(false);
      });
  }, []);

  const list = tab === "gainers" ? gainers : losers;

  return (
    <div className="card p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex rounded-lg overflow-hidden border border-[#21262D]">
          <button
            onClick={() => setTab("gainers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === "gainers"
                ? "bg-green-900/50 text-green-400"
                : "text-[#8B949E] hover:text-[#E6EDF3]"
            }`}
          >
            <TrendingUp className="w-3 h-3" /> Top Gainers
          </button>
          <button
            onClick={() => setTab("losers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === "losers"
                ? "bg-red-900/50 text-red-400"
                : "text-[#8B949E] hover:text-[#E6EDF3]"
            }`}
          >
            <TrendingDown className="w-3 h-3" /> Top Losers
          </button>
        </div>
        <span className="text-xs text-[#8B949E] ml-auto">24h</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#21262D] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {list.map((coin) => (
            <div
              key={coin.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#21262D] transition-colors"
            >
              <Image
                src={coin.image}
                alt={coin.name}
                width={24}
                height={24}
                className="rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#E6EDF3] truncate">{coin.name}</div>
                <div className="text-xs text-[#8B949E]">{fmtVol(coin.total_volume)} vol</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#E6EDF3]">{fmtPrice(coin.current_price)}</div>
                <div
                  className={`text-xs font-medium ${
                    coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-[#8B949E] mt-3 pt-3 border-t border-[#21262D]">
        High volatility = high API demand from exchanges & data teams
      </p>
    </div>
  );
}
