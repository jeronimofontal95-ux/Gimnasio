import { NextResponse } from "next/server";
import { db } from "@/db";
import { routineDays, exercises, workoutLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

type InExercise = { id?: string; name: string; media?: string[]; sets: string[]; notes?: string };
type InDay = { id?: string; name: string; warmup?: string; weekday?: number | null; exercises: InExercise[] };

const cleanWeekday = (w: unknown) =>
  typeof w === "number" && Number.isInteger(w) && w >= 0 && w <= 6 ? w : null;

// Saves the routine keeping the exact order the trainer typed in.
//
// Rules that guarantee a stable order:
//  - days and exercises are always written with contiguous positions (0,1,2…)
//    following the order of the incoming array;
//  - a day without id reuses the existing row with the same weekday (no
//    duplicated days);
//  - an exercise without id reuses the existing row with the same name, so
//    re-adding an exercise does not lose its history nor jump to the end;
//  - days are never deleted here: workout_logs cascade on day delete, so
//    deleting would erase the client's training history.
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const days: InDay[] = Array.isArray(body.days) ? body.days : [];

  const existingDays = await db.select().from(routineDays).where(eq(routineDays.clientId, id));
  const usedDayIds = new Set<string>();
  // weekday → existing row not used yet (for days arriving without id)
  const byWeekday = new Map<number, string>();
  for (const d of existingDays) {
    if (d.weekday != null && !byWeekday.has(d.weekday)) byWeekday.set(d.weekday, d.id);
  }
  const existingDayIds = new Set(existingDays.map((d) => d.id));

  for (let i = 0; i < days.length; i++) {
    const d = days[i];
    const wd = cleanWeekday(d.weekday);
    let dayId: string;

    if (d.id && existingDayIds.has(d.id) && !usedDayIds.has(d.id)) {
      dayId = d.id;
    } else if (wd !== null && byWeekday.has(wd) && !usedDayIds.has(byWeekday.get(wd)!)) {
      dayId = byWeekday.get(wd)!;
    } else {
      const inserted = await db
        .insert(routineDays)
        .values({ clientId: id, position: i, name: d.name || "Nuevo día", warmup: d.warmup ?? "", weekday: wd })
        .returning();
      dayId = inserted[0].id;
    }
    usedDayIds.add(dayId);

    await db
      .update(routineDays)
      .set({
        position: i,
        name: d.name || "Nuevo día",
        warmup: d.warmup ?? "",
        weekday: wd,
      })
      .where(eq(routineDays.id, dayId));

    const existingEx = await db.select().from(exercises).where(eq(exercises.dayId, dayId));
    const existingExIds = new Set(existingEx.map((e) => e.id));
    const byName = new Map<string, string>();
    for (const e of existingEx) if (!byName.has(e.name)) byName.set(e.name, e.id);
    const usedExIds = new Set<string>();

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

      let exId: string | null = null;
      if (ex.id && existingExIds.has(ex.id) && !usedExIds.has(ex.id)) {
        exId = ex.id;
      } else if (byName.has(ex.name.trim()) && !usedExIds.has(byName.get(ex.name.trim())!)) {
        exId = byName.get(ex.name.trim())!;
      }
      if (exId) {
        usedExIds.add(exId);
        await db.update(exercises).set(values).where(eq(exercises.id, exId));
      } else {
        const ins = await db.insert(exercises).values({ dayId, ...values }).returning();
        usedExIds.add(ins[0].id);
      }
    }
    // Exercises removed by the trainer (logs point to the day, not the
    // exercise, so this is safe).
    for (const e of existingEx) {
      if (!usedExIds.has(e.id)) await db.delete(exercises).where(eq(exercises.id, e.id));
    }
  }

  // Leftover duplicated day rows: move their logs to the surviving day with
  // the same weekday and drop the duplicate so the client never sees it twice.
  for (const leftover of existingDays) {
    if (usedDayIds.has(leftover.id)) continue;
    const twin = leftover.weekday != null ? byWeekday.get(leftover.weekday) : undefined;
    const survivor = twin && twin !== leftover.id ? twin : [...usedDayIds][0];
    if (survivor) {
      await db.update(workoutLogs).set({ dayId: survivor }).where(eq(workoutLogs.dayId, leftover.id));
    }
    await db.delete(routineDays).where(eq(routineDays.id, leftover.id));
  }

  return NextResponse.json({ ok: true });
}
