import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin, forbiddenResponse } from "@/lib/admin";
import {
  notifyContactAdmin,
  notifyContactConfirmation,
} from "@/lib/email";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const message = await prisma.contactMessage.create({ data });

    void notifyContactAdmin(data);
    void notifyContactConfirmation(data.email, data.name);

    return NextResponse.json({ ok: true, id: message.id });
  } catch {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return forbiddenResponse();
  }

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ messages });
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return forbiddenResponse();
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
