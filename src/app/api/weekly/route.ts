import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  analyzeImageBuffer,
  scoresFromMetrics,
  type ImageMetrics,
} from "@/lib/face-analysis";
import { saveUpload } from "@/lib/upload";
import { notifyWeekly } from "@/lib/email";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reports = await prisma.weeklyReport.findMany({
    where: { userId: session.userId },
    orderBy: { weekNumber: "asc" },
  });
  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const notes = (form.get("notes") as string) || undefined;
  const file = form.get("image") as File | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Weekly photo is required" }, { status: 400 });
  }

  const last = await prisma.weeklyReport.findFirst({
    where: { userId: session.userId },
    orderBy: { weekNumber: "desc" },
  });
  const weekNumber = (last?.weekNumber ?? 0) + 1;

  const imagePath = await saveUpload(file, "weekly");
  const bytes = await file.arrayBuffer();
  const metrics = await analyzeImageBuffer(Buffer.from(bytes));

  let previousMetrics: ImageMetrics | undefined;
  if (last) {
    previousMetrics = {
      averageBrightness: (last.hydrationScore / 100) * 180,
      rednessIndex: Math.max(0, (100 - last.skinScore) / 500),
      evennessScore: last.clarityScore / 100,
    };
  }

  const scores = scoresFromMetrics(metrics, previousMetrics);

  const report = await prisma.weeklyReport.create({
    data: {
      userId: session.userId,
      weekNumber,
      imagePath,
      skinScore: scores.skinScore,
      hydrationScore: scores.hydrationScore,
      clarityScore: scores.clarityScore,
      notes: notes ?? null,
      comparisonNotes: scores.comparisonNotes ?? null,
    },
  });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  });
  if (profile) {
    void notifyWeekly(
      session.email,
      profile.name,
      weekNumber,
      scores.skinScore,
      scores.comparisonNotes
    );
  }

  return NextResponse.json({ report });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.weeklyReport.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.weeklyReport.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
