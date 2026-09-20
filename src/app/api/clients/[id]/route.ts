import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  clients,
  profiles,
  routineDays,
  exercises,
  diets,
  weights,
  history,
  workoutLogs,
} from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const clientRows = await db.select().from(clients).where(eq(clients.id, id));
  if (!clientRows.length) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const [profileRows, dayRows, dietRows, weightRows, historyRows] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.clientId, id)),
    db.select().from(routineDays).where(eq(routineDays.clientId, id)).orderBy(asc(routineDays.position)),
    db.select().from(diets).where(eq(diets.clientId, id)),
    db.select().from(weights).where(eq(weights.clientId, id)).orderBy(desc(weights.date)),
    db.select().from(history).where(eq(history.clientId, id)).orderBy(desc(history.date)),
  ]);

  const daysWithExercises = await Promise.all(
    dayRows.map(async (d) => {
      const exs = await db
        .select()
        .from(exercises)
        .where(eq(exercises.dayId, d.id))
        .orderBy(asc(exercises.position));
      return { ...d, exercises: exs };
    })
  );

  return NextResponse.json({
    client: clientRows[0],
    profile: profileRows[0] ?? null,
    days: daysWithExercises,
    diet: dietRows[0] ?? null,
    weights: weightRows,
    history: historyRows,
  });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  // manual cascade for logs that may reference days
  await db.delete(workoutLogs).where(eq(workoutLogs.clientId, id));
  await db.delete(clients).where(eq(clients.id, id));
  return NextResponse.json({ ok: true });
}
