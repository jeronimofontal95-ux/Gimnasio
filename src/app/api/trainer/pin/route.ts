import { NextResponse } from "next/server";
import { db } from "@/db";
import { trainerSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const ROW = "local-trainer";

export async function GET() {
  const rows = await db.select().from(trainerSettings).where(eq(trainerSettings.userId, ROW));
  return NextResponse.json({ pin: rows[0]?.pin ?? "1234" });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const pin = String(body.pin ?? "").trim();
  // body.pinToCheck -> verify mode (client never learns the real PIN)
  if (body.pinToCheck !== undefined) {
    const rows = await db.select().from(trainerSettings).where(eq(trainerSettings.userId, ROW));
    const real = rows[0]?.pin ?? "1234";
    return NextResponse.json({ ok: String(body.pinToCheck) === real });
  }
  if (pin.length < 4) return NextResponse.json({ error: "PIN mínimo 4 dígitos" }, { status: 400 });
  const rows = await db.select().from(trainerSettings).where(eq(trainerSettings.userId, ROW));
  if (!rows.length) await db.insert(trainerSettings).values({ userId: ROW, pin });
  else await db.update(trainerSettings).set({ pin }).where(eq(trainerSettings.userId, ROW));
  return NextResponse.json({ ok: true });
}
