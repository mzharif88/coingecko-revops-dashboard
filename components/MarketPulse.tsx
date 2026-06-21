"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Globe, Activity } from "lucide-react";

interface GlobalData {
  data: {
    total_market_cap: { usd: number };
    total_volume: { usd: number };
    market_cap_percentage: { btc: number; eth: number };
    market_cap_change_percentage_24h_usd: number;
    active_cryptocurrencies: number;
  };
}

interface FearGreed {
  data: { value: string; value_classification: string }[];
}

function fmt(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toFixed(0)}`;
}

function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export default function MarketPulse() {
  const [global, setGlobal] = useState<GlobalData | null>(null);
  const [fg, setFg] = useState<FearGreed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/cg?path=%2Fglobal").then((r) => r.json()),
      fetch("https://api.alternative.me/fng/?limit=1").then((r) => r.json()).catch(() => null),
    ]).then(([g, f]) => {
      setGlobal(g);
      setFg(f);
      setLoading(false);
    });
  }, []);

  const fgValue = fg?.data?.[0];
  const fgColor =
    Number(fgValue?.value) >= 60
      ? "text-green-400"
      : Number(fgValue?.value) <= 40
      ? "text-red-400"
      : "text-yellow-400";

  const d = global?.data;
  const change24h = d?.market_cap_change_percentage_24h_usd ?? 0;

  const stats = [
    {
      label: "Total Market Cap",
      value: loading ? "—" : fmt(d?.total_market_cap?.usd ?? 0),
      sub: loading ? "" : fmtPct(change24h),
      subColor: change24h >= 0 ? "text-green-400" : "text-red-400",
      icon: Globe,
    },
    {
      label: "24h Volume",
      value: loading ? "—" : fmt(d?.total_volume?.usd ?? 0),
      sub: "trading volume",
      subColor: "text-[#8B949E]",
      icon: Activity,
    },
    {
      label: "BTC Dominance",
      value: loading ? "—" : `${d?.market_cap_percentage?.btc?.toFixed(1)}%`,
      sub: `ETH ${d?.market_cap_percentage?.eth?.toFixed(1)}%`,
      subColor: "text-[#8B949E]",
      icon: TrendingUp,
    },
    {
      label: "Fear & Greed",
      value: loading ? "—" : fgValue?.value ?? "—",
      sub: fgValue?.value_classification ?? "",
      subColor: fgColor,
      icon: change24h >= 0 ? TrendingUp : TrendingDown,
    },
  ];

  return (
    <div>
      <h2 className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-3">
        Market Pulse
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#8B949E]">{s.label}</span>
              <s.icon className="w-3.5 h-3.5 text-[#8B949E]" />
            </div>
            <div className="text-xl font-bold text-[#E6EDF3]">{s.value}</div>
            <div className={`text-xs mt-1 ${s.subColor}`}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
