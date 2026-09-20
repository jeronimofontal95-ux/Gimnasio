import { NextResponse } from "next/server";
import { db } from "@/db";
import { routineDays, exercises } from "@/db/schema";
import { eq } from "drizzle-orm";

type InExercise = { id?: string; name: string; media?: string[]; sets: string[] };
type InDay = { id?: string; name: string; warmup?: string; weekday?: number | null; exercises: InExercise[] };

const cleanWeekday = (w: unknown) =>
  typeof w === "number" && Number.isInteger(w) && w >= 0 && w <= 6 ? w : null;

// Full-replace routine for a client (simple + matches original HTML editor).
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const days: InDay[] = Array.isArray(body.days) ? body.days : [];

  const existingDays = await db.select().from(routineDays).where(eq(routineDays.clientId, id));
  for (const d of existingDays) {
    await db.delete(exercises).where(eq(exercises.dayId, d.id));
  }
  await db.delete(routineDays).where(eq(routineDays.clientId, id));

  for (let i = 0; i < days.length; i++) {
    const d = days[i];
    const inserted = await db
      .insert(routineDays)
      .values({ clientId: id, position: i, name: d.name || "Nuevo día", warmup: d.warmup ?? "", weekday: cleanWeekday(d.weekday) })
      .returning();
    const dayId = inserted[0].id;
    for (let j = 0; j < (d.exercises ?? []).length; j++) {
      const ex = d.exercises[j];
      if (!ex.name?.trim() || !(ex.sets ?? []).length) continue;
      await db.insert(exercises).values({
        dayId,
        position: j,
        name: ex.name.trim(),
        media: (ex.media ?? []).slice(0, 3),
        sets: ex.sets,
      });
    }
  }
  return NextResponse.json({ ok: true });
}
