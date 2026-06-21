import MarketPulse from "@/components/MarketPulse";
import TrendingCoins from "@/components/TrendingCoins";
import TopMovers from "@/components/TopMovers";
import SectorPerformance from "@/components/SectorPerformance";
import Watchlist from "@/components/Watchlist";
import PipelineTracker from "@/components/PipelineTracker";
import RenewalRadar from "@/components/RenewalRadar";
import QuickNotes from "@/components/QuickNotes";
import RevenueMetrics from "@/components/RevenueMetrics";
import ApiUsageMonitor from "@/components/ApiUsageMonitor";
import QBRTracker from "@/components/QBRTracker";
import ForecastActual from "@/components/ForecastActual";
import HubSpotSync from "@/components/HubSpotSync";
import CohortRetention from "@/components/CohortRetention";

export default function Dashboard() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kuala_Lumpur" });
  const dateStr = now.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kuala_Lumpur" });

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <header className="border-b border-[#21262D] px-6 py-3 flex items-center justify-between sticky top-0 bg-[#0D1117]/90 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#8DC647] flex items-center justify-center text-black font-bold text-xs">CG</div>
          <div>
            <div className="text-sm font-semibold text-[#E6EDF3]">RevOps Command Center</div>
            <div className="text-xs text-[#8B949E]">Revenue Operations · L2</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-[#E6EDF3]">{timeStr} MYT</div>
          <div className="text-xs text-[#8B949E]">{dateStr}</div>
        </div>
      </header>

      <main className="px-4 py-5 max-w-7xl mx-auto space-y-5">
        {/* Row 1: Market Pulse */}
        <MarketPulse />

        {/* Row 2: Revenue Metrics */}
        <RevenueMetrics />

        {/* Row 3: Forecast + Cohort */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ForecastActual />
          <CohortRetention />
        </div>

        {/* Row 4: Sector Performance */}
        <SectorPerformance />

        {/* Row 5: Trending + Top Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendingCoins />
          <TopMovers />
        </div>

        {/* Row 6: Pipeline + Renewal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PipelineTracker />
          <RenewalRadar />
        </div>

        {/* Row 7: QBR Tracker full width */}
        <QBRTracker />

        {/* Row 8: HubSpot Sync + API Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HubSpotSync />
          <ApiUsageMonitor />
        </div>

        {/* Row 9: Watchlist + Quick Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Watchlist />
          <QuickNotes />
        </div>
      </main>

      <footer className="border-t border-[#21262D] px-6 py-3 text-center text-xs text-[#8B949E]">
        Market data via CoinGecko API · Pipeline, renewals & QBR use mock data · Add HUBSPOT_API_KEY to Vercel env for live CRM sync
      </footer>
    </div>
  );
}
