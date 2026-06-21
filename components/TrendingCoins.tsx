"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import Image from "next/image";

interface TrendingCoin {
  item: {
    id: string;
    name: string;
    symbol: string;
    thumb: string;
    market_cap_rank: number;
    data?: {
      price_change_percentage_24h?: { usd: number };
      price?: string;
    };
  };
}

export default function TrendingCoins() {
  const [coins, setCoins] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cg?path=%2Fsearch%2Ftrending")
      .then((r) => r.json())
      .then((d) => {
        setCoins(d.coins?.slice(0, 7) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="card p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-4 h-4 text-orange-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Trending on CoinGecko</h2>
        <span className="text-xs text-[#8B949E] ml-auto">Live</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-8 bg-[#21262D] rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {coins.map((c, i) => {
            const pct = c.item.data?.price_change_percentage_24h?.usd;
            return (
              <div
                key={c.item.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#21262D] transition-colors"
              >
                <span className="text-xs text-[#8B949E] w-4 text-right">{i + 1}</span>
                <Image
                  src={c.item.thumb}
                  alt={c.item.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-[#E6EDF3] truncate block">
                    {c.item.name}
                  </span>
                </div>
                <span className="text-xs text-[#8B949E] uppercase">{c.item.symbol}</span>
                {pct !== undefined && (
                  <span
                    className={`text-xs font-medium w-16 text-right ${
                      pct >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {pct >= 0 ? "+" : ""}
                    {pct.toFixed(1)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-[#8B949E] mt-3 pt-3 border-t border-[#21262D]">
        Use trending coins as conversation starters with prospects
      </p>
    </div>
  );
}
