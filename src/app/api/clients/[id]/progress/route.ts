import { NextResponse } from "next/server";
import { db } from "@/db";
import { weights, history } from "@/db/schema";
import { eq } from "drizzle-orm";
import { todayISO } from "@/lib/forja";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  if (body.kind === "history") {
    const dayName = String(body.dayName ?? "").trim();
    if (!dayName) return NextResponse.json({ error: "dayName requerido" }, { status: 400 });
    await db.insert(history).values({ clientId: id, date: todayISO(), dayName });
    return NextResponse.json({ ok: true });
  }

  const kg = String(body.kg ?? "").trim();
  if (!kg) return NextResponse.json({ error: "kg requerido" }, { status: 400 });
  await db.insert(weights).values({ clientId: id, date: todayISO(), kg });
  return NextResponse.json({ ok: true });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const [w, h] = await Promise.all([
    db.select().from(weights).where(eq(weights.clientId, id)),
    db.select().from(history).where(eq(history.clientId, id)),
  ]);
  return NextResponse.json({ weights: w, history: h });
}
