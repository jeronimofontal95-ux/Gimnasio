import { NextResponse } from "next/server";
import { db } from "@/db";
import { diets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const patch = {
    desayuno: String(body.desayuno ?? ""),
    almuerzo: String(body.almuerzo ?? ""),
    cena: String(body.cena ?? ""),
    snacks: String(body.snacks ?? ""),
    notas: String(body.notas ?? ""),
  };
  const existing = await db.select().from(diets).where(eq(diets.clientId, id));
  if (!existing.length) await db.insert(diets).values({ clientId: id, ...patch });
  else await db.update(diets).set(patch).where(eq(diets.clientId, id));
  return NextResponse.json({ ok: true });
}
