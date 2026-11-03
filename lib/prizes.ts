export type Prize = {
  id: string;
  label: string;
  description: string;
  color: string;
  weight: number;
  grand?: boolean;
  stockCap: number;
};

/** Edit stockCap per row to match your real inventory. */
export const PRIZES: Prize[] = [
  {
    id: "5off",
    label: "5% OFF",
    description: "5% off your order on eligible items.",
    color: "#78716c",
    weight: 195,
    stockCap: 355,
  },
  {
    id: "10off",
    label: "10% OFF",
    description: "10% off your order.",
    color: "#64748b",
    weight: 175,
    stockCap: 280,
  },
  {
    id: "15off",
    label: "15% OFF",
    description: "15% off when you checkout.",
    color: "#6366f1",
    weight: 125,
    stockCap: 180,
  },
  {
    id: "20off",
    label: "20% OFF",
    description: "20% off sitewide on eligible items.",
    color: "#8b5cf6",
    weight: 115,
    stockCap: 120,
  },
  {
    id: "25off",
    label: "25% OFF",
    description: "25% off while stocks last.",
    color: "#a855f7",
    weight: 60,
    stockCap: 50,
  },
  {
    id: "30off",
    label: "30% OFF",
    description: "30% off — one of our best discounts.",
    color: "#7e22ce",
    weight: 50,
    stockCap: 20,
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
    color: "#d97706",
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
