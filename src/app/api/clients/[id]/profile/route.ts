import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, weights, measurements } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { todayISO, todayLocalISO, MEASURE_KEYS } from "@/lib/forja";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const allowed = [
    "edad", "sexo", "peso", "altura", "cuello", "pecho", "cintura", "cadera",
    "bicepsD", "bicepsI", "antebrazoD", "antebrazoI", "cuadricepsD",
    "cuadricepsI", "gemeloD", "gemeloI", "telefono", "fechaInicio", "notas", "photo",
  ] as const;

  const patch: Record<string, string> = {};
  for (const k of allowed) if (body[k] !== undefined) patch[k] = String(body[k] ?? "");

  const existing = await db.select().from(profiles).where(eq(profiles.clientId, id));
  if (!existing.length) {
    await db.insert(profiles).values({ clientId: id, ...patch });
  } else {
    if (Object.keys(patch).length) {
      await db.update(profiles).set(patch).where(eq(profiles.clientId, id));
    }
    if (patch.peso && patch.peso !== existing[0].peso) {
      await db.insert(weights).values({ clientId: id, date: todayISO(), kg: patch.peso });
    }
  }

  // Snapshot of the body measurements for this date, so the trainer can
  // compare this take against the one taken a month ago.
  const current: Record<string, string> = { ...(existing[0] ?? {}), ...patch } as Record<string, string>;
  const values: Record<string, string> = {};
  for (const k of MEASURE_KEYS) {
    const v = (current[k] ?? "").toString().trim();
    if (v) values[k] = v;
  }
  if (Object.keys(values).length) {
    const date = todayLocalISO();
    const rows = await db
      .select()
      .from(measurements)
      .where(and(eq(measurements.clientId, id), eq(measurements.date, date)));
    if (rows.length) {
      await db
        .update(measurements)
        .set({ values: { ...rows[0].values, ...values } })
        .where(eq(measurements.id, rows[0].id));
    } else {
      await db.insert(measurements).values({ clientId: id, date, values });
    }
  }

  return NextResponse.json({ ok: true });
}
