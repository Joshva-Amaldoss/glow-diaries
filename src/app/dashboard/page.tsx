import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  });

  if (!profile) redirect("/onboarding");

  const latestAssessment = await prisma.assessment.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  const weeklyCount = await prisma.weeklyReport.count({
    where: { userId: session.userId },
  });

  const latestWeekly = await prisma.weeklyReport.findFirst({
    where: { userId: session.userId },
    orderBy: { weekNumber: "desc" },
  });

  let recommendations: { name: string; slug: string }[] = [];
  if (latestAssessment?.recommendations) {
    try {
      recommendations = JSON.parse(latestAssessment.recommendations);
    } catch {
      recommendations = [];
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {profile.name}</h1>
        <p className="text-[var(--muted)]">
          Age {profile.age} · {profile.gender}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article className="card">
          <h2 className="font-semibold text-[var(--brand)]">Skin analysis</h2>
          {latestAssessment ? (
            <>
              <p className="mt-2 text-sm">
                Face type: <strong>{latestAssessment.faceTypeResult}</strong>
              </p>
              <p className="mt-2 text-sm text-[var(--muted)] line-clamp-3">
                {latestAssessment.analysisSummary.replace(/\*\*/g, "")}
              </p>
              <Link href="/assessment" className="btn-secondary mt-4 text-sm">
                New analysis
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Complete your first face assessment.
              </p>
              <Link href="/assessment" className="btn-primary mt-4 text-sm">
                Start analysis
              </Link>
            </>
          )}
        </article>

        <article className="card">
          <h2 className="font-semibold text-[var(--brand)]">Recommended products</h2>
          {recommendations.length > 0 ? (
            <ul className="mt-2 list-inside list-disc text-sm">
              {recommendations.map((p) => (
                <li key={p.slug}>{p.name}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">Run an analysis to see products.</p>
          )}
          <Link href="/products" className="btn-secondary mt-4 text-sm">
            View all products
          </Link>
        </article>

        <article className="card">
          <h2 className="font-semibold text-[var(--brand)]">Weekly progress</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {weeklyCount} week{weeklyCount !== 1 ? "s" : ""} logged
          </p>
          {latestWeekly && (
            <p className="mt-2 text-sm">
              Latest skin score: <strong>{latestWeekly.skinScore}/100</strong>
            </p>
          )}
          <Link href="/weekly" className="btn-primary mt-4 text-sm">
            Weekly reports
          </Link>
        </article>
      </div>
    </div>
  );
}
