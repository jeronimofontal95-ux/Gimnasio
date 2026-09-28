import { NextResponse } from "next/server";
import { db } from "@/db";
import { routineDays, exercises } from "@/db/schema";
import { eq } from "drizzle-orm";

type InExercise = { id?: string; name: string; media?: string[]; sets: string[]; notes?: string };
type InDay = { id?: string; name: string; warmup?: string; weekday?: number | null; exercises: InExercise[] };

const cleanWeekday = (w: unknown) =>
  typeof w === "number" && Number.isInteger(w) && w >= 0 && w <= 6 ? w : null;

// Upsert routine for a client keyed by id. Days are never deleted here on
// purpose: workout_logs cascade on day delete, so full-replace would wipe
// the client's training history every time the trainer saves.
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const days: InDay[] = Array.isArray(body.days) ? body.days : [];

  const existingDays = await db.select().from(routineDays).where(eq(routineDays.clientId, id));
  const existingDayIds = new Set(existingDays.map((d) => d.id));

  for (let i = 0; i < days.length; i++) {
    const d = days[i];
    let dayId: string;
    if (d.id && existingDayIds.has(d.id)) {
      dayId = d.id;
      await db
        .update(routineDays)
        .set({
          position: i,
          name: d.name || "Nuevo día",
          warmup: d.warmup ?? "",
          weekday: cleanWeekday(d.weekday),
        })
        .where(eq(routineDays.id, dayId));
    } else {
      const inserted = await db
        .insert(routineDays)
        .values({ clientId: id, position: i, name: d.name || "Nuevo día", warmup: d.warmup ?? "", weekday: cleanWeekday(d.weekday) })
        .returning();
      dayId = inserted[0].id;
    }

    const existingEx = await db.select().from(exercises).where(eq(exercises.dayId, dayId));
    const existingExIds = new Set(existingEx.map((e) => e.id));
    const seenExIds = new Set<string>();
    for (let j = 0; j < (d.exercises ?? []).length; j++) {
      const ex = d.exercises[j];
      if (!ex.name?.trim() || !(ex.sets ?? []).length) continue;
      const values = {
        position: j,
        name: ex.name.trim(),
        media: (ex.media ?? []).slice(0, 3),
        sets: ex.sets,
        notes: (ex.notes ?? "").trim(),
      };
      if (ex.id && existingExIds.has(ex.id)) {
        seenExIds.add(ex.id);
        await db.update(exercises).set(values).where(eq(exercises.id, ex.id));
      } else {
        const ins = await db.insert(exercises).values({ dayId, ...values }).returning();
        seenExIds.add(ins[0].id);
      }
    }
    // Logs reference the day (not the exercise), so removing an exercise is safe.
    for (const e of existingEx) {
      if (!seenExIds.has(e.id)) await db.delete(exercises).where(eq(exercises.id, e.id));
    }
  }
  return NextResponse.json({ ok: true });
}
