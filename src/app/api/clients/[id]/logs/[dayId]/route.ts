import { NextResponse } from "next/server";
import { db } from "@/db";
import { workoutLogs, exercises, routineDays } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { todayISO, type TemplateExercise } from "@/lib/forja";
import type { LogExercise } from "@/db/schema";

// YYYY-MM-DD from ?date=, validated and clamped to today
const reqDate = (req: Request) => {
  const q = new URL(req.url).searchParams.get("date") ?? "";
  const today = todayISO();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(q)) return today;
  return q > today ? today : q;
};

// Full-content signature: any trainer edit (names, series text, order, count)
// rebuilds rows with fresh names/targets, keeping logged weight/reps/done.
const contentSig = (list: { name: string; sets: string[] }[]) =>
  list.map((e) => `${e.name}~${e.sets.join("~")}`).join("|");

export async function GET(req: Request, ctx: { params: Promise<{ id: string; dayId: string }> }) {
  const { id, dayId } = await ctx.params;
  const date = reqDate(req);

  const existing = await db
    .select()
    .from(workoutLogs)
    .where(and(eq(workoutLogs.clientId, id), eq(workoutLogs.dayId, dayId), eq(workoutLogs.logDate, date)));

  const dayRows = await db.select().from(routineDays).where(eq(routineDays.id, dayId));
  const exRows = await db.select().from(exercises).where(eq(exercises.dayId, dayId));
  const sig = contentSig(exRows.map((e) => ({ name: e.name, sets: e.sets as string[] })));

  if (existing.length && existing[0].signature === sig) {
    return NextResponse.json(existing[0]);
  }

  const stored = (existing.length ? (existing[0].payload as LogExercise[]) : []) ?? [];
  const payload: LogExercise[] = exRows.map((e) => {
    const prev = stored.find((x) => x.name === e.name);
    const targets = e.sets as string[];
    return {
      name: e.name,
      sets: targets.map((target, i) => ({
        target,
        reps: prev?.sets[i]?.reps ?? "",
        weight: prev?.sets[i]?.weight ?? "",
        done: prev?.sets[i]?.done ?? false,
      })),
    };
  });

  if (existing.length) {
    const updated = await db
      .update(workoutLogs)
      .set({ signature: sig, payload })
      .where(eq(workoutLogs.id, existing[0].id))
      .returning();
    return NextResponse.json(updated[0]);
  }

  const inserted = await db
    .insert(workoutLogs)
    .values({ clientId: id, dayId, logDate: date, signature: sig, payload })
    .returning();
  return NextResponse.json(inserted[0]);
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string; dayId: string }> }) {
  const { id, dayId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const payload = body.payload as LogExercise[];
  if (!Array.isArray(payload)) return NextResponse.json({ error: "payload inválido" }, { status: 400 });

  const date = reqDate(req);
  const existing = await db
    .select()
    .from(workoutLogs)
    .where(and(eq(workoutLogs.clientId, id), eq(workoutLogs.dayId, dayId), eq(workoutLogs.logDate, date)));

  if (!existing.length) {
    const inserted = await db
      .insert(workoutLogs)
      .values({ clientId: id, dayId, logDate: date, signature: contentSig(payload.map((e) => ({ name: e.name, sets: e.sets.map((s) => s.target) }))), payload })
      .returning();
    return NextResponse.json(inserted[0]);
  }
  const updated = await db
    .update(workoutLogs)
    .set({ payload })
    .where(eq(workoutLogs.id, existing[0].id))
    .returning();
  return NextResponse.json(updated[0]);
}

export type { TemplateExercise };
