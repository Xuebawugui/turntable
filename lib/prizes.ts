export type Prize = {
  id: string;
  label: string;
  description: string;
  color: string;
  weight: number;
  grand?: boolean;
  /** Coupon / item count — when 0 left, prize is removed from the wheel */
  stockCap: number;
};

/**
 * 折 → % off: 9.5折=5% · 9折=10% · 8.5折=15% · 8折=20% · 7.5折=25% · 7折=30%
 * Edit stockCap per row to match your real inventory.
 */
export const PRIZES: Prize[] = [
  {
    id: "5off",
    label: "5% OFF",
    description: "9.5折 — 5% off your order (eligible items).",
    color: "#3f3f46",
    weight: 195,
    stockCap: 350,
  },
  {
    id: "10off",
    label: "10% OFF",
    description: "九折 — 10% off your order.",
    color: "#52525b",
    weight: 175,
    stockCap: 280,
  },
  {
    id: "15off",
    label: "15% OFF",
    description: "8.5折 — 15% off when you checkout.",
    color: "#4f46e5",
    weight: 125,
    stockCap: 180,
  },
  {
    id: "20off",
    label: "20% OFF",
    description: "八折 — 20% off sitewide on eligible items.",
    color: "#6366f1",
    weight: 115,
    stockCap: 120,
  },
  {
    id: "25off",
    label: "25% OFF",
    description: "7.5折 — 25% off while stocks last.",
    color: "#7c3aed",
    weight: 60,
    stockCap: 50,
  },
  {
    id: "30off",
    label: "30% OFF",
    description: "七折 — 30% off — one of our best discounts.",
    color: "#6d28d9",
    weight: 50,
    stockCap: 25,
  },
  {
    id: "brazil-jacket",
    label: "Brazil Jacket",
    description: "One Brazil jacket — yours to keep. Limited stock.",
    color: "#059669",
    weight: 2,
    grand: true,
    stockCap: 3,
  },
  {
    id: "nike-mesh",
    label: "Nike Mesh",
    description: "One Nike mesh-style piece from our collection. Limited stock.",
    color: "#ca8a04",
    weight: 2,
    grand: true,
    stockCap: 2,
  },
];

export function getLimitedPrizeIds(): string[] {
  return PRIZES.map((p) => p.id);
}

export function getStockCap(prizeId: string): number | undefined {
  return PRIZES.find((p) => p.id === prizeId)?.stockCap;
}

export function pickPrizeByWeight(options?: { excludeIds?: string[] }): Prize | null {
  const exclude = new Set(options?.excludeIds ?? []);
  const pool = PRIZES.filter((p) => !exclude.has(p.id));
  if (pool.length === 0) return null;

  const total = pool.reduce((s, p) => s + p.weight, 0);
  let r = Math.random() * total;
  for (const prize of pool) {
    r -= prize.weight;
    if (r <= 0) return prize;
  }
  return pool[pool.length - 1];
}

export function getPrizeById(id: string): Prize | undefined {
  return PRIZES.find((p) => p.id === id);
}
