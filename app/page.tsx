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
import LeadershipSummary from "@/components/LeadershipSummary";
import ProspectRadar from "@/components/ProspectRadar";
import AdsPipeline from "@/components/AdsPipeline";
import ResetDemoData from "@/components/ResetDemoData";
import ChainActivityMonitor from "@/components/ChainActivityMonitor";

export default function Dashboard() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kuala_Lumpur" });
  const dateStr = now.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kuala_Lumpur" });

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <header className="border-b border-[#21262D] px-6 py-3 flex items-center justify-between sticky top-0 bg-[#0D1117]/95 backdrop-blur z-10">
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

        {/* ── SECTION 1: LEADERSHIP VIEW ─────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#8DC647] rounded-full" />
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">Leadership View</span>
          </div>
          <LeadershipSummary />
        </div>

        {/* ── SECTION 2: REVENUE & FORECAST ──────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-yellow-400 rounded-full" />
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">Revenue & Forecast</span>
          </div>
          <RevenueMetrics />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <ForecastActual />
            <CohortRetention />
          </div>
        </div>

        {/* ── SECTION 3: PIPELINE & DEALS ────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-blue-400 rounded-full" />
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">Pipeline & Deals</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PipelineTracker />
            <HubSpotSync />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <ApiUsageMonitor />
            <ProspectRadar />
          </div>
          <div className="mt-4">
            <AdsPipeline />
          </div>
        </div>

        {/* ── SECTION 4: RENEWALS & RETENTION ────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-red-400 rounded-full" />
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">Renewals & Retention</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RenewalRadar />
            <QBRTracker />
          </div>
        </div>

        {/* ── SECTION 5: ON-CHAIN INTELLIGENCE ───────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-cyan-400 rounded-full" />
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">On-Chain Intelligence</span>
          </div>
          <ChainActivityMonitor />
        </div>

        {/* ── SECTION 6: MARKET CONTEXT (collapsed) ──────────────────────── */}
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer list-none mb-3 select-none">
            <div className="w-1 h-4 bg-orange-400 rounded-full" />
            <span className="text-xs font-semibold text-[#8B949E] uppercase tracking-wider">Market Context</span>
            <span className="text-xs text-[#8B949E] ml-1">(Live CoinGecko data)</span>
            <svg className="w-4 h-4 text-[#8B949E] ml-auto transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="space-y-4">
            <MarketPulse />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TrendingCoins />
              <TopMovers />
            </div>
            <SectorPerformance />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Watchlist />
              <QuickNotes />
            </div>
          </div>
        </details>

      </main>

      <footer className="border-t border-[#21262D] px-6 py-4 flex items-center justify-between">
        <span className="text-xs text-[#8B949E]">
          CoinGecko RevOps Command Center · Add <code className="text-[#8DC647]">HUBSPOT_API_KEY</code> + <code className="text-[#8DC647]">COINGECKO_API_KEY</code> for live CRM & API sync
        </span>
        <ResetDemoData />
      </footer>
    </div>
  );
}
