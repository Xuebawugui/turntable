import { NextRequest, NextResponse } from "next/server";
import { formatE164FrenchDisplay, normalizeFrenchPhone } from "@/lib/phone";
import { getPrizeById } from "@/lib/prizes";
import {
  getDrawByPhone,
  pickCampaignPrize,
  releaseSpinSlot,
  reserveSpinSlot,
  rollbackPrizeReservation,
  saveDraw,
} from "@/lib/redis";

export const runtime = "nodejs";

function prizePayload(prize: {
  id: string;
  label: string;
  description: string;
  grand?: boolean;
}) {
  return {
    id: prize.id,
    label: prize.label,
    description: prize.description,
    grand: prize.grand === true,
  };
}

export async function POST(req: NextRequest) {
  let body: { phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const phone = normalizeFrenchPhone(body.phone ?? "");
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid French mobile number (e.g. 06 12 34 56 78)." },
      { status: 400 }
    );
  }

  const existing = await getDrawByPhone(phone);
  if (existing) {
    const prize = getPrizeById(existing.prizeId);
    return NextResponse.json(
      {
        error: "This phone number has already been used for a spin.",
        alreadyDrawn: true,
        prize: prize
          ? prizePayload(prize)
          : { id: existing.prizeId, label: existing.prizeLabel, description: "" },
        drawnAt: existing.drawnAt,
        phone,
        phoneDisplay: formatE164FrenchDisplay(phone),
      },
      { status: 409 }
    );
  }

  const hasSlot = await reserveSpinSlot();
  if (!hasSlot) {
    return NextResponse.json(
      { error: "This promotion is fully booked. Thanks for your interest!" },
      { status: 403 }
    );
  }

  const prize = await pickCampaignPrize();
  if (!prize) {
    await releaseSpinSlot();
    return NextResponse.json(
      { error: "All rewards are claimed. Thanks for playing!" },
      { status: 403 }
    );
  }

  const record = {
    prizeId: prize.id,
    prizeLabel: prize.label,
    drawnAt: new Date().toISOString(),
  };

  const saved = await saveDraw(phone, record);
  if (!saved) {
    await rollbackPrizeReservation(prize.id);

    if (!process.env.UPSTASH_REDIS_REST_URL) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Storage is not configured. Please try again later." },
          { status: 503 }
        );
      }
      // Local dev without Redis: still return the spin result
    } else {
      const again = await getDrawByPhone(phone);
      if (again) {
        const p = getPrizeById(again.prizeId);
        return NextResponse.json(
          {
            error: "This phone number has already been used for a spin.",
            alreadyDrawn: true,
            prize: p
              ? prizePayload(p)
              : { id: again.prizeId, label: again.prizeLabel, description: "" },
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Could not complete spin. Try again." }, { status: 500 });
    }
  }

  return NextResponse.json({
    prize: prizePayload(prize),
    drawnAt: record.drawnAt,
    phone,
    phoneDisplay: formatE164FrenchDisplay(phone),
  });
}
