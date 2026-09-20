import { NextResponse } from "next/server";
import { db } from "@/db";
import { clients, profiles, diets } from "@/db/schema";
import { genCode, todayISO } from "@/lib/forja";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(clients).orderBy(desc(clients.createdAt));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

  const code = genCode();
  const inserted = await db.insert(clients).values({ name, code }).returning();
  const client = inserted[0];

  await db.insert(profiles).values({ clientId: client.id, fechaInicio: todayISO() });
  await db.insert(diets).values({ clientId: client.id });

  return NextResponse.json(client, { status: 201 });
}
