# CoinGecko RevOps Command Center

A Revenue Operations dashboard built as a portfolio project for the CoinGecko RevOps Associate (L2) role. Designed to give sales teams, CS, and leadership a single pane of glass across pipeline, renewals, market intelligence, and revenue forecasting.

**Live demo:** https://coingecko-revops-dashboard.vercel.app

---

## What it does

The dashboard is structured around 4 RevOps workflows:

| Section | Components | Purpose |
|---|---|---|
| Leadership View | LeadershipSummary | 10-second KPI snapshot — quota attainment, at-risk ARR, overdue QBRs, open pipeline |
| Revenue & Forecast | RevenueTargets, ForecastActual, CohortRetention | Quarterly targets, forecast vs actual with editable quarters, API tier cohort retention |
| Pipeline & Deals | PipelineTracker, HubSpotSync, ApiUsageMonitor, ProspectRadar, AdsPipeline | Full deal lifecycle — API subscription deals, HubSpot sync, usage-signal upsells, exchange coverage gaps, CG Ads campaigns |
| Renewals & Retention | RenewalRadar, QBRTracker | At-risk ARR tracking, renewal timeline buckets, QBR health scores and overdue alerts |
| Market Context | MarketPulse, TrendingCoins, TopMovers, SectorPerformance, Watchlist | Live CoinGecko market data as sales context — collapsed by default |

---

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Data:** CoinGecko Public API (via internal proxy at `/api/cg`)
- **CRM:** HubSpot (mock → live when `HUBSPOT_API_KEY` added)
- **Persistence:** localStorage for all RevOps data
- **Deployment:** Vercel

---

## Live data vs mock data

| Component | Data source |
|---|---|
| MarketPulse, TrendingCoins, TopMovers, SectorPerformance, Watchlist | **Live** — CoinGecko API |
| ProspectRadar | **Live** — CoinGecko `/exchanges` endpoint |
| PipelineTracker, RenewalRadar, QBRTracker, AdsPipeline | Mock (localStorage) — connect HubSpot for live |
| HubSpotSync | Mock → **live** when `HUBSPOT_API_KEY` is set |
| ForecastActual | Mock (localStorage, fully editable) |
| CohortRetention, RevenueTargets, ApiUsageMonitor | Mock (hardcoded targets) |
| LeadershipSummary | Computed from all localStorage keys |

---

## Setup

```bash
npm install
npm run dev
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `COINGECKO_API_KEY` | Optional | CoinGecko Demo key (free at coingecko.com/en/api) — increases rate limit from 30/min to higher threshold |
| `HUBSPOT_API_KEY` | Optional | HubSpot Private App token — switches HubSpotSync from mock to live CRM data |

Add both to Vercel: **Project → Settings → Environment Variables**

---

## Design decisions

**RevOps-first layout** — Leadership Summary is pinned at the top. Market context is collapsed at the bottom. A VP can read the dashboard in 10 seconds without scrolling.

**Mock data that reflects real CoinGecko customers** — pipeline deals reference Binance, OKX, Kaiko, Chainalysis, Glassnode. Renewal accounts reference Coinbase, Wintermute, Kraken. Realistic enough to demo CoinGecko API tier structure (Demo → Analyst → Pro → Enterprise).

**HubSpot-ready architecture** — the `/api/hubspot` route normalises HubSpot deal data into the same shape as mock deals. Switching from mock to live requires only adding an env var — no code changes.

**LeadershipSummary reads from localStorage** — all RevOps components write to keyed localStorage stores (`revops_pipeline`, `revops_renewals`, `revops_qbr`, `revops_forecast`). LeadershipSummary reads and computes KPIs client-side, so changes in any component instantly update the summary strip.

---

## CoinGecko API tier structure (referenced in mock data)

| Tier | Monthly calls | Use case |
|---|---|---|
| Demo | 10,000 | Evaluation / small projects |
| Analyst | 500,000 | Research teams, data analysts |
| Pro | 2,000,000 | Mid-size exchanges, trading desks |
| Enterprise | Custom | Large exchanges, institutional clients |

---

Built by [Zarif](https://github.com/mzharif88) · Stack: Next.js · Tailwind · CoinGecko API · HubSpot
