"use client";

import { useState } from "react";
import { RotateCcw, Check } from "lucide-react";

const STORAGE_KEYS = [
  "revops_pipeline",
  "revops_renewals",
  "revops_qbr",
  "revops_forecast",
  "revops_ads_pipeline",
  "revops_prospect_radar",
  "revops_watchlist",
];

export default function ResetDemoData() {
  const [done, setDone] = useState(false);

  const reset = () => {
    STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    setDone(true);
    setTimeout(() => {
      setDone(false);
      window.location.reload();
    }, 1200);
  };

  return (
    <button
      onClick={reset}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        done
          ? "bg-green-900/40 text-green-400 border border-green-800/40"
          : "bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#30363D] border border-[#21262D]"
      }`}
    >
      {done ? (
        <><Check className="w-3 h-3" /> Reset complete — reloading</>
      ) : (
        <><RotateCcw className="w-3 h-3" /> Reset Demo Data</>
      )}
    </button>
  );
}
