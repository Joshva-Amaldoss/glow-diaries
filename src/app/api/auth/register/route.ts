import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { ROLES } from "@/lib/admin";
import { notifyWelcome } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const role =
      adminEmail && email.toLowerCase() === adminEmail ? ROLES.ADMIN : ROLES.USER;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
        role,
      },
    });

    await createSession({ userId: user.id, email: user.email, role: user.role });
    void notifyWelcome(user.email);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
