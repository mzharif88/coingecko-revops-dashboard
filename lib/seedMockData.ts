const d = (n: number) => new Date(Date.now() + n * 86400000).toISOString().split("T")[0];

const MOCK_PIPELINE = [
  { id: "m1",  company: "Binance",        contact: "Kevin Lim",     tier: "Enterprise", value: "84000",  stage: "Negotiation",  nextAction: "Send revised contract",             nextActionDate: d(2),  notes: "Custom rate limit SLA + dedicated support. Upgrading from Pro." },
  { id: "m2",  company: "OKX",            contact: "Sarah Chen",    tier: "Enterprise", value: "42000",  stage: "Proposal",     nextAction: "Follow up on pricing deck",         nextActionDate: d(4),  notes: "Evaluating against CMC API. Enterprise tier for data licensing terms." },
  { id: "m3",  company: "Nansen",         contact: "Wei Zhang",     tier: "Pro",        value: "8400",   stage: "Demo",         nextAction: "Product demo call",                 nextActionDate: d(1),  notes: "On-chain analytics. NFT & DeFi endpoints. Pro tier fits." },
  { id: "m4",  company: "Jump Trading",   contact: "Alex Park",     tier: "Enterprise", value: "96000",  stage: "Outreach",     nextAction: "LinkedIn connect + intro email",    nextActionDate: d(3),  notes: "Quant desk. High-freq tick data needs. Custom SLA required." },
  { id: "m5",  company: "Messari",        contact: "Tom Rivera",    tier: "Enterprise", value: "36000",  stage: "Closed Won",   nextAction: "",                                  nextActionDate: "",    notes: "Enterprise for data redistribution rights. Closed Q1." },
  { id: "m6",  company: "Delphi Digital", contact: "Maya Patel",    tier: "Analyst",    value: "3000",   stage: "Prospect",     nextAction: "Research team cold outreach",       nextActionDate: d(7),  notes: "Small research team. Analyst tier fits." },
  { id: "m7",  company: "Kaiko",          contact: "Pierre Dubois", tier: "Enterprise", value: "60000",  stage: "Proposal",     nextAction: "Send enterprise pricing + SLA doc", nextActionDate: d(5),  notes: "Institutional data client. OHLCV + data licensing." },
  { id: "m8",  company: "Arkham Intel",   contact: "Ryan Moore",    tier: "Pro",        value: "9600",   stage: "Demo",         nextAction: "Technical API walkthrough",         nextActionDate: d(2),  notes: "On-chain surveillance. Pro tier call vol fits." },
  { id: "m9",  company: "Chainalysis",    contact: "Lisa Nguyen",   tier: "Enterprise", value: "72000",  stage: "Negotiation",  nextAction: "Legal review of data terms",        nextActionDate: d(6),  notes: "Compliance firm. Data licensing rights critical." },
  { id: "m10", company: "Token Terminal", contact: "Mikko Lahti",   tier: "Analyst",    value: "2400",   stage: "Outreach",     nextAction: "Cold email + product one-pager",    nextActionDate: d(4),  notes: "DeFi metrics team. Analyst fits." },
  { id: "m11", company: "Glassnode",      contact: "Jan Weber",     tier: "Enterprise", value: "48000",  stage: "Closed Won",   nextAction: "",                                  nextActionDate: "",    notes: "Enterprise for data redistribution. Closed Q2." },
  { id: "m12", company: "Bitget",         contact: "Cindy Zhao",    tier: "Enterprise", value: "36000",  stage: "Prospect",     nextAction: "Qualify data needs + ICP mapping",  nextActionDate: d(10), notes: "Fast-growing CEX. Exchange-scale usage = Enterprise." },
  { id: "m13", company: "Wintermute",     contact: "James Liu",     tier: "Enterprise", value: "96000",  stage: "Closed Won",   nextAction: "",                                  nextActionDate: "",    notes: "Algo trading desk. Custom SLA. Renewed early." },
];

const MOCK_RENEWALS = [
  { id: "r1", company: "Coinbase",       tier: "Enterprise", arr: "180000", renewalDate: d(12),  health: "green",  notes: "Strong usage. Exec relationship solid." },
  { id: "r2", company: "Kraken",         tier: "Enterprise", arr: "48000",  renewalDate: d(18),  health: "yellow", notes: "API call vol dropped 30% last 60 days. QBR needed." },
  { id: "r3", company: "Bybit",          tier: "Enterprise", arr: "36000",  renewalDate: d(27),  health: "red",    notes: "Champion left. New team unresponsive. High churn risk." },
  { id: "r4", company: "CryptoQuant",    tier: "Pro",        arr: "7200",   renewalDate: d(45),  health: "green",  notes: "Heavy users. Upsell to Enterprise at renewal." },
  { id: "r5", company: "The Block",      tier: "Analyst",    arr: "2400",   renewalDate: d(52),  health: "yellow", notes: "Budget review Q3. Needs value reaffirmation." },
  { id: "r6", company: "Wintermute",     tier: "Enterprise", arr: "96000",  renewalDate: d(71),  health: "green",  notes: "Algo trading desk. Critical data dependency." },
  { id: "r7", company: "Galaxy Digital", tier: "Enterprise", arr: "42000",  renewalDate: d(88),  health: "green",  notes: "Asset management + trading desk. Renewed early." },
  { id: "r8", company: "Arkham Intel",   tier: "Pro",        arr: "9600",   renewalDate: d(105), health: "yellow", notes: "Exploring DexScreener. Competitive response needed." },
];

const MOCK_QBR = [
  { id: "q1", company: "Coinbase",    tier: "Enterprise", arr: "180000", csm: "Sarah", healthScore: 91, lastQBR: d(-90),  nextQBR: d(0),   lastTouchDate: d(-3),  openActions: "Review expanded endpoint usage, propose custom SLA upgrade" },
  { id: "q2", company: "Wintermute",  tier: "Enterprise", arr: "96000",  csm: "James", healthScore: 85, lastQBR: d(-45),  nextQBR: d(45),  lastTouchDate: d(-7),  openActions: "Share WebSocket beta access, schedule tech deep-dive" },
  { id: "q3", company: "OKX",         tier: "Enterprise", arr: "42000",  csm: "Sarah", healthScore: 62, lastQBR: d(-95),  nextQBR: d(-5),  lastTouchDate: d(-21), openActions: "OVERDUE — re-engage contact, send monthly usage report" },
  { id: "q4", company: "CryptoQuant", tier: "Pro",        arr: "7200",   csm: "James", healthScore: 78, lastQBR: d(-30),  nextQBR: d(60),  lastTouchDate: d(-2),  openActions: "Approaching Pro call limit — upsell to Enterprise at renewal" },
  { id: "q5", company: "Bybit",       tier: "Enterprise", arr: "36000",  csm: "Sarah", healthScore: 34, lastQBR: d(-120), nextQBR: d(-30), lastTouchDate: d(-45), openActions: "CRITICAL — champion left, find new exec sponsor urgently" },
  { id: "q6", company: "The Block",   tier: "Analyst",    arr: "2400",   csm: "James", healthScore: 55, lastQBR: d(-60),  nextQBR: d(30),  lastTouchDate: d(-14), openActions: "Budget review Q3 — prepare ROI case study for editorial team" },
];

const MOCK_FORECAST = [
  { quarter: "Q3 2024", target: 180000, actual: 171000, pipeline: 0 },
  { quarter: "Q4 2024", target: 200000, actual: 214000, pipeline: 0 },
  { quarter: "Q1 2025", target: 220000, actual: 198000, pipeline: 0 },
  { quarter: "Q2 2025", target: 240000, actual: 142000, pipeline: 87000 },
];

export function seedMockData() {
  if (typeof window === "undefined") return;
  const seeds: Record<string, unknown> = {
    revops_pipeline: MOCK_PIPELINE,
    revops_renewals: MOCK_RENEWALS,
    revops_qbr:      MOCK_QBR,
    revops_forecast: MOCK_FORECAST,
  };
  Object.entries(seeds).forEach(([key, val]) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(val));
    }
  });
}
