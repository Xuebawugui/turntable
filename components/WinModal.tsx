"use client";

import { useEffect, useRef } from "react";

export type WinModalData = {
  prizeLabel: string;
  prizeDescription: string;
  grand?: boolean;
  phoneDisplay: string;
  drawnAt?: string;
};

type Props = {
  open: boolean;
  data: WinModalData | null;
  onClose: () => void;
};

export function WinModal({ open, data, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !data) return null;

  const dateStr = data.drawnAt
    ? new Date(data.drawnAt).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="win-modal-title"
        className={`relative w-full max-w-md animate-fade-in rounded-xl border bg-zinc-950 p-6 shadow-glow sm:p-8 ${
          data.grand ? "border-amber-500/40" : "border-white/15"
        }`}
      >
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {data.grand ? "Grand prize" : "You won"}
        </p>
        <h2
          id="win-modal-title"
          className={`mt-2 text-2xl font-semibold tracking-tight ${
            data.grand ? "text-amber-100" : "text-foreground"
          }`}
        >
          {data.prizeLabel}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {data.prizeDescription}
        </p>

        <div className="mt-6 space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div>
            <p className="text-xs text-muted-foreground">Mobile number</p>
            <p className="mt-1 font-mono text-lg tracking-tight text-foreground">
              {data.phoneDisplay}
            </p>
          </div>
          {dateStr && (
            <div>
              <p className="text-xs text-muted-foreground">Date & time</p>
              <p className="mt-1 text-sm text-foreground">{dateStr}</p>
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-sm leading-relaxed text-muted-foreground">
          Take a <strong className="font-medium text-foreground">screenshot</strong> of this
          screen and contact us to redeem your prize.
        </p>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition hover:bg-white/90"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
