import { NextResponse } from "next/server";
import { db } from "@/db";
import { workoutLogs } from "@/db/schema";
import { lt } from "drizzle-orm";

/*
 * Weekly reset, run by Vercel Cron every Sunday at 00:00 UTC (see vercel.json).
 * Deletes daily workout check-sheets older than 7 days so each week starts
 * fresh. Completed routines (history) and weight records are kept.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 500 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const deleted = await db
    .delete(workoutLogs)
    .where(lt(workoutLogs.logDate, cutoffStr))
    .returning({ id: workoutLogs.id });

  return NextResponse.json({ ok: true, deleted: deleted.length, cutoff: cutoffStr });
}
