import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  age: z.coerce.number().int().min(1).max(120),
  gender: z.string().min(1),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  });
  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const profile = await prisma.profile.upsert({
      where: { userId: session.userId },
      update: data,
      create: { userId: session.userId, ...data },
    });

    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
  }
}
