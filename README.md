# CoinGecko RevOps Command Center

Revenue Operations dashboard for tracking crypto market signals, deal pipeline, renewals, and account watchlist.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- CoinGecko Free Public API (no key required to start)
- localStorage for pipeline, watchlist notes, and renewals

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel (one-time setup)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Vercel auto-detects Next.js — click **Deploy**
4. Done. Every `git push` auto-deploys.

## Optional: Add CoinGecko Pro API Key

For higher rate limits, add your key in Vercel → Project → Settings → Environment Variables:

```
COINGECKO_API_KEY = your_key_here
```

The app automatically uses the Pro endpoint when this is set.

## Dashboard Sections

| Section | Data Source | Updates |
|---|---|---|
| Market Pulse | CoinGecko `/global` + Fear & Greed | Every 60s |
| Sector Performance | CoinGecko `/coins/categories` | Every 5min |
| Trending Coins | CoinGecko `/search/trending` | Every 2min |
| Top Movers | CoinGecko `/coins/markets` | Every 60s |
| Watchlist | CoinGecko `/coins/markets` + localStorage | Every 60s |
| Deal Pipeline | localStorage | Persistent |
| Renewal Radar | localStorage | Persistent |
| Quick Notes | localStorage | Persistent |

## Editing on the go (Claude iOS workflow)

1. Open this repo in Claude iOS
2. Make changes via chat
3. Push to GitHub → Vercel auto-deploys in ~30s
