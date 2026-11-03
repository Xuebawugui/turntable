import { NextResponse } from "next/server";
import { PRIZES } from "@/lib/prizes";

/** 仅返回展示字段，不暴露权重 */
export async function GET() {
  return NextResponse.json({
    prizes: PRIZES.map((p, index) => ({
      id: p.id,
      label: p.label,
      color: p.color,
      grand: p.grand === true,
      index,
    })),
  });
}
