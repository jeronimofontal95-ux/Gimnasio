import { NextResponse } from "next/server";
import { db } from "@/db";
import { workoutLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { todayISO } from "@/lib/forja";
import type { LogExercise } from "@/db/schema";

// Which routines have logged data (weight/reps/done) on a given date.
// Used so the client view jumps straight to the routine that was trained.
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const q = new URL(req.url).searchParams.get("date") ?? "";
  const today = todayISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(q) || q > today) return NextResponse.json({ status: {} });

  const rows = await db
    .select()
    .from(workoutLogs)
    .where(and(eq(workoutLogs.clientId, id), eq(workoutLogs.logDate, q)));

  const status: Record<string, boolean> = {};
  for (const r of rows) {
    const p = (r.payload as LogExercise[]) ?? [];
    status[r.dayId] = p.some((ex) => (ex.sets ?? []).some((s) => s.weight || s.reps || s.done));
  }
  return NextResponse.json({ status });
}
