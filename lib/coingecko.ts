// All CoinGecko API calls go through our /api/cg proxy
const proxy = (path: string, params?: Record<string, string>) => {
  const base = `/api/cg?path=${encodeURIComponent(path)}`;
  if (!params) return base;
  const q = new URLSearchParams(params).toString();
  return `${base}&${q}`;
};

export async function fetchGlobal() {
  const res = await fetch(proxy("/global"), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error("Failed to fetch global data");
  return res.json();
}

export async function fetchTrending() {
  const res = await fetch(proxy("/search/trending"), { next: { revalidate: 120 } });
  if (!res.ok) throw new Error("Failed to fetch trending");
  return res.json();
}

export async function fetchMarkets(params?: Record<string, string>) {
  const defaults: Record<string, string> = {
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: "100",
    page: "1",
    sparkline: "false",
    price_change_percentage: "1h,24h,7d",
  };
  const res = await fetch(proxy("/coins/markets", { ...defaults, ...params }), {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch markets");
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(
    proxy("/coins/categories", { order: "market_cap_change_24h_desc" }),
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchFearGreed() {
  // Uses alternative.me (not CoinGecko) — open CORS
  const res = await fetch("https://api.alternative.me/fng/?limit=1", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}
