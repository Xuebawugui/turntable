import { Redis } from "@upstash/redis";
import { CAMPAIGN_MAX_SPINS } from "@/lib/campaign";
import {
  getLimitedPrizeIds,
  getStockCap,
  pickPrizeByWeight,
  PRIZES,
  type Prize,
} from "@/lib/prizes";

let redis: Redis | null = null;

/** Vercel Storage may inject KV_* or UPSTASH_REDIS_REST_* — support both */
function getRedisCredentials(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

export function isRedisConfigured(): boolean {
  return getRedisCredentials() !== null;
}

export function getRedis(): Redis | null {
  const creds = getRedisCredentials();
  if (!creds) return null;
  if (!redis) {
    redis = new Redis({ url: creds.url, token: creds.token });
  }
  return redis;
}

const DRAW_KEY_PREFIX = "promo:wheel:draw:";
const TOTAL_SPINS_KEY = "promo:wheel:total_spins";
const STOCK_KEY_PREFIX = "promo:wheel:stock:";

export type DrawRecord = {
  prizeId: string;
  prizeLabel: string;
  drawnAt: string;
};

export type CampaignStats = {
  maxSpins: number;
  spinsUsed: number;
  spotsLeft: number;
};

export type InventoryItem = {
  id: string;
  label: string;
  grand: boolean;
  total: number;
  left: number;
  soldOut: boolean;
};

export async function getDrawByPhone(phoneE164: string): Promise<DrawRecord | null> {
  const client = getRedis();
  if (!client) return null;
  return client.get<DrawRecord>(`${DRAW_KEY_PREFIX}${phoneE164}`);
}

export async function saveDraw(phoneE164: string, record: DrawRecord): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  const ok = await client.set(`${DRAW_KEY_PREFIX}${phoneE164}`, record, {
    nx: true,
  });
  return ok === "OK";
}

export async function getCampaignStats(): Promise<CampaignStats> {
  const client = getRedis();
  const maxSpins = CAMPAIGN_MAX_SPINS;
  if (!client) {
    return { maxSpins, spinsUsed: 0, spotsLeft: maxSpins };
  }
  const spinsUsed = Number((await client.get<number>(TOTAL_SPINS_KEY)) ?? 0);
  return {
    maxSpins,
    spinsUsed,
    spotsLeft: Math.max(0, maxSpins - spinsUsed),
  };
}

export async function getPrizeInventory(): Promise<InventoryItem[]> {
  const items: InventoryItem[] = [];
  for (const prize of PRIZES) {
    const claimed = await getStockClaimed(prize.id);
    const left = Math.max(0, prize.stockCap - claimed);
    items.push({
      id: prize.id,
      label: prize.label,
      grand: prize.grand === true,
      total: prize.stockCap,
      left,
      soldOut: left <= 0,
    });
  }
  return items;
}

export async function reserveSpinSlot(): Promise<boolean> {
  const client = getRedis();
  if (!client) return true;
  const n = await client.incr(TOTAL_SPINS_KEY);
  if (n > CAMPAIGN_MAX_SPINS) {
    await client.decr(TOTAL_SPINS_KEY);
    return false;
  }
  return true;
}

export async function releaseSpinSlot(): Promise<void> {
  const client = getRedis();
  if (!client) return;
  const n = await client.decr(TOTAL_SPINS_KEY);
  if (n < 0) await client.set(TOTAL_SPINS_KEY, 0);
}

async function getStockClaimed(prizeId: string): Promise<number> {
  const client = getRedis();
  if (!client) return 0;
  return Number((await client.get<number>(`${STOCK_KEY_PREFIX}${prizeId}`)) ?? 0);
}

async function tryClaimStock(prizeId: string, cap: number): Promise<boolean> {
  const client = getRedis();
  if (!client) return true;
  const n = await client.incr(`${STOCK_KEY_PREFIX}${prizeId}`);
  if (n > cap) {
    await client.decr(`${STOCK_KEY_PREFIX}${prizeId}`);
    return false;
  }
  return true;
}

async function releaseStock(prizeId: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  const n = await client.decr(`${STOCK_KEY_PREFIX}${prizeId}`);
  if (n < 0) await client.set(`${STOCK_KEY_PREFIX}${prizeId}`, 0);
}

async function getSoldOutLimitedIds(): Promise<string[]> {
  const soldOut: string[] = [];
  for (const id of getLimitedPrizeIds()) {
    const cap = getStockCap(id);
    if (cap == null) continue;
    const claimed = await getStockClaimed(id);
    if (claimed >= cap) soldOut.push(id);
  }
  return soldOut;
}

export async function pickCampaignPrize(): Promise<Prize | null> {
  let soldOut = await getSoldOutLimitedIds();
  if (soldOut.length >= getLimitedPrizeIds().length) return null;

  for (let attempt = 0; attempt < 12; attempt++) {
    const prize = pickPrizeByWeight({ excludeIds: soldOut });
    if (!prize) return null;

    const cap = getStockCap(prize.id);
    if (cap == null) return prize;

    const claimed = await tryClaimStock(prize.id, cap);
    if (claimed) return prize;

    if (!soldOut.includes(prize.id)) soldOut = [...soldOut, prize.id];
    if (soldOut.length >= getLimitedPrizeIds().length) return null;
  }

  return pickPrizeByWeight({ excludeIds: soldOut });
}

export async function rollbackPrizeReservation(prizeId: string): Promise<void> {
  await releaseSpinSlot();
  if (getStockCap(prizeId) != null) {
    await releaseStock(prizeId);
  }
}
