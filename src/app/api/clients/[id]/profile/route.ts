import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, weights } from "@/db/schema";
import { eq } from "drizzle-orm";
import { todayISO } from "@/lib/forja";

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
  return NextResponse.json({ ok: true });
}
