import { NextResponse } from "next/server";
import { db } from "@/db";
import { measurements } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { MEASURE_FIELDS, MEASURE_KEYS, closestTo, todayLocalISO } from "@/lib/forja";

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

// Body measurement history + comparison against the take closest to a month ago.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const rows = await db
    .select()
    .from(measurements)
    .where(eq(measurements.clientId, id))
    .orderBy(asc(measurements.date));

  const snapshots = rows.map((r) => ({ date: r.date, values: r.values ?? {} }));
  if (!snapshots.length) return NextResponse.json({ snapshots: [], comparison: [] });

  const last = snapshots[snapshots.length - 1];
  const before = closestTo(snapshots.slice(0, -1), last.date, 30);

  const comparison = MEASURE_FIELDS.map(([key, label]) => {
    const now = last.values?.[key] ?? "";
    const prev = before?.values?.[key] ?? "";
    const nNow = num(now);
    const nPrev = num(prev);
    const diff = nNow !== null && nPrev !== null ? Math.round((nNow - nPrev) * 100) / 100 : null;
    return {
      key,
      label,
      current: now,
      previous: prev,
      diff,
      previousDate: before?.date ?? null,
      daysAgo: before ? Math.round((new Date(`${last.date}T00:00:00Z`).getTime() - new Date(`${before.date}T00:00:00Z`).getTime()) / 86400000) : null,
    };
  }).filter((r) => r.current || r.previous);

  return NextResponse.json({
    snapshots,
    comparison,
    currentDate: last.date,
    today: todayLocalISO(),
    fields: MEASURE_KEYS,
  });
}
