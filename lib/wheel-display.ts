import { PRIZES } from "@/lib/prizes";

export type WheelPrizeDisplay = {
  id: string;
  label: string;
  color: string;
  grand?: boolean;
  index: number;
};

export type InventoryDisplay = {
  id: string;
  label: string;
  grand?: boolean;
  total: number;
  left: number;
  soldOut: boolean;
};

/** Always available on the client — wheel never renders empty if config loads */
export function getWheelPrizes(): WheelPrizeDisplay[] {
  return PRIZES.map((p, index) => ({
    id: p.id,
    label: p.label,
    color: p.color,
    grand: p.grand,
    index,
  }));
}

export function getDefaultInventory(): InventoryDisplay[] {
  return PRIZES.map((p) => ({
    id: p.id,
    label: p.label,
    grand: p.grand,
    total: p.stockCap,
    left: p.stockCap,
    soldOut: false,
  }));
}
