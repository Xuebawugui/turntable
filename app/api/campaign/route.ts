import { NextResponse } from "next/server";
import { getCampaignStats, getPrizeInventory } from "@/lib/redis";

export async function GET() {
  const [stats, inventory] = await Promise.all([getCampaignStats(), getPrizeInventory()]);
  return NextResponse.json({ ...stats, inventory });
}
