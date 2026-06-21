import { NextRequest, NextResponse } from "next/server";

const MOCK_DEALS = [
  { id: "m1", company: "Binance",       contact: "Kevin Lim",   tier: "Enterprise", value: "120000", stage: "Negotiation",  nextAction: "Send revised contract",       nextActionDate: "", notes: "Upgrading from Pro. Need custom rate limit SLA." },
  { id: "m2", company: "OKX",           contact: "Sarah Chen",  tier: "Pro",        value: "42000",  stage: "Proposal",     nextAction: "Follow up on pricing",        nextActionDate: "", notes: "Evaluating against CMC API." },
  { id: "m3", company: "Nansen",        contact: "Wei Zhang",   tier: "Analyst",    value: "18000",  stage: "Demo",         nextAction: "Product demo call",           nextActionDate: "", notes: "Interested in NFT & DeFi endpoints." },
  { id: "m4", company: "Jump Trading",  contact: "Alex Park",   tier: "Enterprise", value: "95000",  stage: "Outreach",     nextAction: "LinkedIn connect + intro email", nextActionDate: "", notes: "Quant desk. High-freq data needs." },
  { id: "m5", company: "Messari",       contact: "Tom Rivera",  tier: "Pro",        value: "36000",  stage: "Closed Won",   nextAction: "",                            nextActionDate: "", notes: "Closed Q1. Upsell opportunity at renewal." },
  { id: "m6", company: "Delphi Digital",contact: "Maya Patel",  tier: "Analyst",    value: "14400",  stage: "Prospect",     nextAction: "Research team outreach",      nextActionDate: "", notes: "Good fit for Analyst tier." },
];

function normalizeHubSpot(deals: any[]) {
  const stageMap: Record<string, string> = {
    appointmentscheduled: "Demo",
    qualifiedtobuy: "Proposal",
    presentationscheduled: "Demo",
    decisionmakerboughtin: "Negotiation",
    contractsent: "Negotiation",
    closedwon: "Closed Won",
    closedlost: "Closed Lost",
  };
  return deals.map((d: any) => ({
    id: d.id,
    company: d.properties?.dealname ?? "Unknown",
    contact: "",
    tier: "Pro",
    value: d.properties?.amount ?? "0",
    stage: stageMap[d.properties?.dealstage] ?? "Prospect",
    nextAction: "",
    nextActionDate: d.properties?.closedate?.split("T")[0] ?? "",
    notes: "",
  }));
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.HUBSPOT_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      source: "mock",
      deals: MOCK_DEALS,
      lastSync: new Date().toISOString(),
      total: MOCK_DEALS.length,
    });
  }

  try {
    const res = await fetch(
      "https://api.hubapi.com/crm/v3/objects/deals?limit=50&properties=dealname,amount,dealstage,closedate,hubspot_owner_id",
      { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
    );

    if (!res.ok) {
      return NextResponse.json({ source: "mock", deals: MOCK_DEALS, lastSync: new Date().toISOString(), total: MOCK_DEALS.length });
    }

    const data = await res.json();
    const deals = normalizeHubSpot(data.results ?? []);
    return NextResponse.json({ source: "hubspot", deals, lastSync: new Date().toISOString(), total: deals.length });
  } catch {
    return NextResponse.json({ source: "mock", deals: MOCK_DEALS, lastSync: new Date().toISOString(), total: MOCK_DEALS.length });
  }
}
