import { NextResponse } from "next/server";
import { db } from "@/db";
import { workoutLogs } from "@/db/schema";
import { lt } from "drizzle-orm";

/*
 * Yearly reset, run by Vercel Cron every January 1st at 00:00 UTC (see vercel.json).
 * Deletes the prior year's daily workout check-sheets so each year starts
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

  const yearStart = `${new Date().getUTCFullYear()}-01-01`;

  const deleted = await db
    .delete(workoutLogs)
    .where(lt(workoutLogs.logDate, yearStart))
    .returning({ id: workoutLogs.id });

  return NextResponse.json({ ok: true, deleted: deleted.length, yearStart });
}
