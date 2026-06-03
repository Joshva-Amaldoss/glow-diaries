import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireSession } from "@/lib/auth";

export const ROLES = { USER: "USER", ADMIN: "ADMIN" } as const;

export async function getUserRole(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role ?? ROLES.USER;
}

export async function isAdmin(userId: string): Promise<boolean> {
  return (await getUserRole(userId)) === ROLES.ADMIN;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (!(await isAdmin(session.userId))) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export function forbiddenResponse() {
  return NextResponse.json({ error: "Admin access required" }, { status: 403 });
}

export async function getSessionWithRole() {
  const session = await getSession();
  if (!session) return null;
  const role = await getUserRole(session.userId);
  return { ...session, role };
}
