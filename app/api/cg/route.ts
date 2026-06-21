import { NextRequest, NextResponse } from "next/server";

const CG_BASE     = "https://api.coingecko.com/api/v3";
const CG_PRO_BASE = "https://pro-api.coingecko.com/api/v3";

const CG_API_KEY     = process.env.COINGECKO_API_KEY;      // Demo key
const CG_PRO_API_KEY = process.env.COINGECKO_PRO_API_KEY;  // Pro/Analyst/Enterprise key (optional)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const params = new URLSearchParams();
  searchParams.forEach((val, key) => {
    if (key !== "path") params.append(key, val);
  });

  const headers: Record<string, string> = { Accept: "application/json" };
  let base = CG_BASE;

  if (CG_PRO_API_KEY) {
    // Paid Pro/Analyst/Enterprise key — use pro-api base + pro header
    base = CG_PRO_BASE;
    headers["x-cg-pro-api-key"] = CG_PRO_API_KEY;
  } else if (CG_API_KEY) {
    // Demo key — stays on public base URL, uses demo header
    base = CG_BASE;
    headers["x-cg-demo-api-key"] = CG_API_KEY;
  }
  // No key — public API, no header

  const url = `${base}${path}${params.toString() ? "?" + params.toString() : ""}`;

  try {
    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `CoinGecko error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
