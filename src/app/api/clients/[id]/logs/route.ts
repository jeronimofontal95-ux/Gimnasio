import { NextResponse } from "next/server";
import { db } from "@/db";
import { workoutLogs, routineDays } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";

// Recent training sessions for the trainer view:
// which routine was done + weight/reps logged per set.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const rows = await db
    .select()
    .from(workoutLogs)
    .where(eq(workoutLogs.clientId, id))
    .orderBy(desc(workoutLogs.logDate))
    .limit(20);

  const dayIds = [...new Set(rows.map((r) => r.dayId).filter((x): x is string => !!x))];
  const names: Record<string, string> = {};
  if (dayIds.length) {
    const days = await db.select().from(routineDays).where(inArray(routineDays.id, dayIds));
    for (const d of days) names[d.id] = d.name;
  }

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      logDate: r.logDate,
      dayId: r.dayId,
      dayName: r.dayId ? (names[r.dayId] ?? null) : null,
      payload: r.payload ?? [],
    }))
  );
}
