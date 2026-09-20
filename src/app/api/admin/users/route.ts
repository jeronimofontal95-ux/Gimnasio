import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const rows = await db.select().from(user).where(eq(user.id, session.user.id));
  if (!rows[0]?.isAdmin) return null;
  return session;
}

// Admin-only: list accounts so the single admin can see who has access.
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Solo administradores" }, { status: 403 });

  const rows = await db.select().from(user);
  return NextResponse.json(
    rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
    }))
  );
}
