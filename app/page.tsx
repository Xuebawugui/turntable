"use client";

import { FrameCorners } from "@/components/FrameCorners";
import { InventoryBanner, type InventoryRow } from "@/components/InventoryBanner";
import { LuckyWheel } from "@/components/LuckyWheel";
import { WinModal, type WinModalData } from "@/components/WinModal";
import {
  formatE164FrenchDisplay,
  formatFrenchNationalDisplay,
  formatNationalInput,
  isFrenchPhoneComplete,
  normalizeFrenchPhone,
} from "@/lib/phone";
import { useCallback, useEffect, useState } from "react";

type WheelPrize = {
  id: string;
  label: string;
  color: string;
  grand?: boolean;
  index: number;
};

type ResultPrize = {
  id: string;
  label: string;
  description: string;
  grand?: boolean;
};

export default function HomePage() {
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [campaignClosed, setCampaignClosed] = useState(false);
  const [phoneNational, setPhoneNational] = useState("");
  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [pendingResult, setPendingResult] = useState<{
    prize: ResultPrize;
    phoneDisplay: string;
    drawnAt?: string;
  } | null>(null);
  const [modalData, setModalData] = useState<WinModalData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [hasSpun, setHasSpun] = useState(false);

  const phoneValid = isFrenchPhoneComplete(phoneNational);

  const openWinModal = useCallback(
    (prize: ResultPrize, phoneDisplay: string, drawnAt?: string) => {
      setModalData({
        prizeLabel: prize.label,
        prizeDescription: prize.description,
        grand: prize.grand,
        phoneDisplay,
        drawnAt,
      });
      setModalOpen(true);
    },
    []
  );

  const applyCampaignPayload = useCallback((cData: {
    spotsLeft?: number;
    inventory?: InventoryRow[];
  }) => {
    const rows = cData.inventory ?? [];
    setInventory(rows);
    const allSoldOut = rows.length > 0 && rows.every((i) => i.soldOut);
    setCampaignClosed((cData.spotsLeft ?? 0) <= 0 || allSoldOut);
  }, []);

  useEffect(() => {
    Promise.all([fetch("/api/prizes"), fetch("/api/campaign")])
      .then(async ([pRes, cRes]) => {
        const pData = await pRes.json();
        const cData = await cRes.json();
        setPrizes(pData.prizes ?? []);
        applyCampaignPayload(cData);
      })
      .catch(() => setError("Could not load the wheel. Refresh to try again."));
  }, [applyCampaignPayload]);

  const refreshCampaign = useCallback(() => {
    fetch("/api/campaign")
      .then((r) => r.json())
      .then(applyCampaignPayload)
      .catch(() => {});
  }, [applyCampaignPayload]);

  const handleSpinEnd = useCallback(() => {
    setSpinning(false);
    setLoading(false);
    setHasSpun(true);
    refreshCampaign();
    if (pendingResult) {
      openWinModal(
        pendingResult.prize,
        pendingResult.phoneDisplay,
        pendingResult.drawnAt
      );
      setPendingResult(null);
    }
  }, [pendingResult, openWinModal, refreshCampaign]);

  function handlePhoneChange(raw: string) {
    const digits = formatNationalInput(raw);
    setPhoneNational(formatFrenchNationalDisplay(digits));
  }

  async function handleDraw(e: React.FormEvent) {
    e.preventDefault();
    if (loading || spinning || hasSpun || !phoneValid || campaignClosed) return;
    setError("");
    setPendingResult(null);
    setLoading(true);

    const phone = normalizeFrenchPhone(phoneNational);
    if (!phone) {
      setError("Enter a valid French mobile number (e.g. 06 12 34 56 78).");
      setLoading(false);
      return;
    }

    const phoneDisplay =
      formatE164FrenchDisplay(phone) || `+33 ${phoneNational}`;

    try {
      const res = await fetch("/api/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyDrawn && data.prize) {
          setHasSpun(true);
          openWinModal(
            data.prize,
            data.phoneDisplay ?? phoneDisplay,
            data.drawnAt
          );
        }
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        if (res.status === 403) setCampaignClosed(true);
        return;
      }

      const idx = prizes.findIndex((p) => p.id === data.prize.id);
      setPendingResult({
        prize: data.prize,
        phoneDisplay: data.phoneDisplay ?? phoneDisplay,
        drawnAt: data.drawnAt,
      });
      setTargetIndex(idx >= 0 ? idx : 0);
      setSpinning(true);
    } catch {
      setError("Network error. Check your connection and retry.");
      setLoading(false);
    }
  }

  const buttonLabel = campaignClosed
    ? "Promotion ended"
    : hasSpun
      ? "Spin complete"
      : spinning
        ? "Spinning…"
        : loading
          ? "Hold on…"
          : "Spin the wheel";

  return (
    <>
      <main className="relative flex min-h-dvh flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col sm:max-w-lg">
          <header className="animate-fade-in text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              11.11 Sale · France
            </div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Spin for your discount
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Up to 30% off, plus limited{" "}
              <span className="text-amber-200/90">Brazil jackets</span> and{" "}
              <span className="text-amber-200/90">Nike mesh</span> pieces — one item per winner
              while stock lasts.
            </p>
          </header>

          <div className="mt-6">
            <InventoryBanner items={inventory} />
          </div>

          <section className="relative mt-6 flex flex-1 flex-col animate-fade-in">
            <div className="relative rounded-xl border border-white/10 bg-card/80 p-5 shadow-glow backdrop-blur-md sm:p-8">
              <FrameCorners />

              <LuckyWheel
                prizes={prizes}
                spinning={spinning}
                targetIndex={targetIndex}
                onSpinEnd={handleSpinEnd}
              />

              <form onSubmit={handleDraw} className="mt-8 space-y-3">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-foreground">
                    Mobile number
                  </label>
                  <div className="flex h-12 overflow-hidden rounded-md border border-white/10 bg-black/50 ring-ring focus-within:ring-2 sm:h-11">
                    <span className="flex shrink-0 items-center border-r border-white/10 bg-white/[0.03] px-3 font-mono text-sm text-muted-foreground">
                      +33
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="6 12 34 56 78"
                      value={phoneNational}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      disabled={hasSpun || spinning || campaignClosed}
                      aria-describedby="phone-hint"
                      className="min-w-0 flex-1 bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                    />
                  </div>
                  <p id="phone-hint" className="text-xs text-muted-foreground">
                    French mobile only (without the leading 0). One spin per number.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || spinning || hasSpun || !phoneValid || campaignClosed}
                  className="inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-white/90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 sm:h-11"
                >
                  {buttonLabel}
                </button>
              </form>

              {error && (
                <p className="mt-4 text-center text-sm text-red-400/90" role="alert">
                  {error}
                </p>
              )}

              {hasSpun && !spinning && !modalOpen && (
                <button
                  type="button"
                  onClick={() =>
                    modalData && setModalOpen(true)
                  }
                  className="mt-6 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  View your prize again
                </button>
              )}
            </div>
          </section>

          <footer className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
            Discounts from 9.5折 to 7折 (5%–30% off). One spin per mobile number.
          </footer>
        </div>
      </main>

      <WinModal
        open={modalOpen}
        data={modalData}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
