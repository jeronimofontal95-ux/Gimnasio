import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Sin sesión" }, { status: 401 });

  const rows = await db.select().from(user).where(eq(user.id, session.user.id));
  return NextResponse.json({
    email: session.user.email,
    isAdmin: rows[0]?.isAdmin ?? false,
  });
}
