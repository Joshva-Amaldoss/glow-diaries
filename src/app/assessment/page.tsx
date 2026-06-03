"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Product = { slug: string; name: string; description: string };
type AssessmentResult = {
  assessment: {
    id: string;
    faceTypeResult: string;
    analysisSummary: string;
    imagePath?: string;
    analysisSource?: string;
  };
  products: Product[];
  analysis: {
    faceType: string;
    summary: string;
    metrics?: Record<string, number>;
    analysisSource?: string;
    aiInsight?: { confidence?: string; concerns?: string[] };
  };
};

const FACE_TYPES = [
  "Oily",
  "Dry",
  "Combination",
  "Sensitive",
  "Normal",
  "Not sure",
];

const PROBLEM_OPTIONS = [
  "acne",
  "oiliness",
  "dryness",
  "dullness",
  "wrinkles",
  "redness",
  "large pores",
  "uneven tone",
  "sensitivity",
];

export default function AssessmentPage() {
  const router = useRouter();
  const [facialType, setFacialType] = useState("");
  const [problems, setProblems] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [history, setHistory] = useState<{ id: string; faceTypeResult: string; createdAt: string }[]>([]);

  useEffect(() => {
    fetch("/api/assessment")
      .then((r) => r.json())
      .then((d) => setHistory(d.assessments ?? []))
      .catch(() => {});
  }, [result]);

  function toggleProblem(p: string) {
    setProblems((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData();
    if (facialType && facialType !== "Not sure") form.append("facialType", facialType);
    if (problems.length) form.append("problems", problems.join(", "));
    if (image) form.append("image", image);

    const res = await fetch("/api/assessment", { method: "POST", body: form });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Analysis failed");
      return;
    }
    const data = await res.json();
    setResult(data);
    router.refresh();
  }

  async function deleteAssessment(id: string) {
    await fetch(`/api/assessment?id=${id}`, { method: "DELETE" });
    setHistory((h) => h.filter((a) => a.id !== id));
    if (result?.assessment.id === id) setResult(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Skin & face analysis</h1>
        <p className="text-[var(--muted)]">
          Describe your facial type and concerns, or upload a face photo for analysis and
          Glow Diaries product suggestions.
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          With <code className="rounded bg-[var(--brand-light)] px-1">OPENAI_API_KEY</code> set,
          photos use AI vision plus local metrics. Otherwise local analysis applies.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="label">Facial / skin type (if you know)</label>
          <select
            className="input"
            value={facialType}
            onChange={(e) => setFacialType(e.target.value)}
          >
            <option value="">Select optional</option>
            {FACE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="label">Problems or concerns (optional)</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROBLEM_OPTIONS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => toggleProblem(p)}
                className={`rounded-full px-3 py-1 text-sm capitalize ${
                  problems.includes(p)
                    ? "bg-[var(--brand)] text-white"
                    : "bg-[var(--brand-light)] text-[var(--text)]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="photo">
            Or upload a face photo
          </label>
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="input"
            onChange={onFileChange}
          />
          {preview && (
            <div className="relative mt-3 h-48 w-48 overflow-hidden rounded-xl">
              <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Analyzing…" : "Analyze & get recommendations"}
        </button>
      </form>

      {result && (
        <section className="card border-2 border-[var(--brand)]/20">
          <h2 className="text-xl font-semibold text-[var(--brand)]">Your results</h2>
          {result.analysis.analysisSource && (
            <span className="mt-2 inline-block rounded-full bg-[var(--brand-light)] px-3 py-1 text-xs font-medium text-[var(--brand)]">
              Analysis: {result.analysis.analysisSource === "ai+local" ? "AI + local" : result.analysis.analysisSource}
              {result.analysis.aiInsight?.confidence &&
                ` · ${result.analysis.aiInsight.confidence} confidence`}
            </span>
          )}
          <p className="mt-2">
            <strong>Face type:</strong> {result.analysis.faceType}
          </p>
          {result.analysis.aiInsight?.concerns && result.analysis.aiInsight.concerns.length > 0 && (
            <p className="mt-1 text-sm text-[var(--muted)]">
              AI-detected concerns: {result.analysis.aiInsight.concerns.join(", ")}
            </p>
          )}
          <p className="mt-2 text-[var(--muted)]">
            {result.analysis.summary.replace(/\*\*/g, "")}
          </p>
          {result.analysis.metrics && (
            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-lg bg-[var(--brand-light)] p-2">
                <dt className="text-[var(--muted)]">Brightness</dt>
                <dd className="font-semibold">{result.analysis.metrics.averageBrightness}</dd>
              </div>
              <div className="rounded-lg bg-[var(--brand-light)] p-2">
                <dt className="text-[var(--muted)]">Evenness</dt>
                <dd className="font-semibold">{result.analysis.metrics.evennessScore}</dd>
              </div>
              <div className="rounded-lg bg-[var(--brand-light)] p-2">
                <dt className="text-[var(--muted)]">Redness index</dt>
                <dd className="font-semibold">{result.analysis.metrics.rednessIndex}</dd>
              </div>
            </dl>
          )}
          <h3 className="mt-6 font-semibold">Suggested Glow Diaries routine</h3>
          <ul className="mt-3 space-y-3">
            {result.products.map((p) => (
              <li key={p.slug} className="rounded-xl border border-teal-900/10 p-4">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-[var(--muted)]">{p.description}</p>
              </li>
            ))}
          </ul>
          <Link href="/weekly" className="btn-primary mt-6 inline-block text-sm">
            Start weekly tracking
          </Link>
        </section>
      )}

      {history.length > 0 && (
        <section className="card">
          <h2 className="font-semibold">Past analyses</h2>
          <ul className="mt-4 divide-y divide-teal-900/10">
            {history.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  {a.faceTypeResult} — {new Date(a.createdAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => deleteAssessment(a.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
