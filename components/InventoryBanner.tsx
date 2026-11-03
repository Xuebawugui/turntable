"use client";

export type InventoryRow = {
  id: string;
  label: string;
  grand?: boolean;
  total: number;
  left: number;
  soldOut: boolean;
};

type Props = {
  items: InventoryRow[];
};

export function InventoryBanner({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section
      className="animate-fade-in rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm"
      aria-label="Remaining stock"
    >
      <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Remaining stock · gone when zero
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => (
          <li
            key={item.id}
            className={`rounded-md border px-2.5 py-2 text-center ${
              item.soldOut
                ? "border-white/5 bg-white/[0.02] opacity-50"
                : item.grand
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-white/10 bg-white/[0.03]"
            }`}
          >
            <p
              className={`truncate text-[11px] font-medium sm:text-xs ${
                item.grand ? "text-amber-100" : "text-foreground"
              }`}
            >
              {item.grand ? "★ " : ""}
              {item.label}
            </p>
            <p className="mt-1 font-mono text-sm tabular-nums text-foreground">
              {item.soldOut ? (
                <span className="text-muted-foreground">Sold out</span>
              ) : (
                <>
                  <span className="font-semibold">{item.left}</span>
                  <span className="text-muted-foreground"> left</span>
                </>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
