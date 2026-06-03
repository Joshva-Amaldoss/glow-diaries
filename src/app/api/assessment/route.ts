import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { runFullAnalysis } from "@/lib/analysis-pipeline";
import { saveUpload } from "@/lib/upload";
import { notifyAssessment } from "@/lib/email";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assessments = await prisma.assessment.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return NextResponse.json({ assessments });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) {
    return NextResponse.json(
      { error: "Complete your profile first" },
      { status: 400 }
    );
  }

  const form = await request.formData();
  const facialType = (form.get("facialType") as string) || undefined;
  const problems = (form.get("problems") as string) || undefined;
  const file = form.get("image") as File | null;

  let imagePath: string | undefined;
  let imageBuffer: Buffer | undefined;

  if (file && file.size > 0) {
    imagePath = await saveUpload(file, "assessments");
    const bytes = await file.arrayBuffer();
    imageBuffer = Buffer.from(bytes);
  }

  if (!facialType?.trim() && !problems?.trim() && !imageBuffer) {
    return NextResponse.json(
      { error: "Provide face type, problems, or upload a photo" },
      { status: 400 }
    );
  }

  const analysis = await runFullAnalysis(
    {
      facialType,
      problems,
      age: profile.age,
      gender: profile.gender,
    },
    imageBuffer
  );

  const products = await prisma.product.findMany({
    where: { slug: { in: analysis.recommendedSlugs }, active: true },
  });

  const assessment = await prisma.assessment.create({
    data: {
      userId: session.userId,
      facialType: facialType ?? null,
      problems: problems ?? null,
      imagePath: imagePath ?? null,
      faceTypeResult: analysis.faceType,
      analysisSummary: analysis.summary,
      recommendations: JSON.stringify(
        products.map((p) => ({
          slug: p.slug,
          name: p.name,
          description: p.description,
        }))
      ),
      imageMetrics: analysis.metrics ? JSON.stringify(analysis.metrics) : null,
      aiInsight: analysis.aiInsight ? JSON.stringify(analysis.aiInsight) : null,
      analysisSource: analysis.analysisSource,
    },
  });

  void notifyAssessment(
    session.email,
    profile.name,
    analysis.faceType,
    products.map((p) => p.name)
  );

  return NextResponse.json({
    assessment,
    products,
    analysis,
  });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const existing = await prisma.assessment.findFirst({
    where: { id, userId: session.userId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.assessment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
