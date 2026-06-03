"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Report = {
  id: string;
  weekNumber: number;
  imagePath: string | null;
  skinScore: number;
  hydrationScore: number;
  clarityScore: number;
  notes: string | null;
  comparisonNotes: string | null;
  createdAt: string;
};

export default function WeeklyReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/weekly")
      .then((r) => r.json())
      .then((d) => setReports(d.reports ?? []));
  }

  useEffect(() => {
    load();
  }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) {
      setError("Please upload a progress photo");
      return;
    }
    setError("");
    setLoading(true);
    const form = new FormData();
    form.append("image", image);
    if (notes) form.append("notes", notes);
    const res = await fetch("/api/weekly", { method: "POST", body: form });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save report");
      return;
    }
    setImage(null);
    setPreview(null);
    setNotes("");
    load();
  }

  async function deleteReport(id: string) {
    await fetch(`/api/weekly?id=${id}`, { method: "DELETE" });
    setReports((r) => r.filter((x) => x.id !== id));
  }

  const maxScore = 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Weekly reports</h1>
        <p className="text-[var(--muted)]">
          Upload a face photo each week. We compare hydration, clarity, and overall skin
          scores to track improvement over time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label" htmlFor="weekPhoto">
            This week&apos;s photo
          </label>
          <input
            id="weekPhoto"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="input"
            onChange={onFileChange}
            required
          />
          {preview && (
            <div className="relative mt-3 h-40 w-40 overflow-hidden rounded-xl">
              <Image src={preview} alt="Week preview" fill className="object-cover" unoptimized />
            </div>
          )}
        </div>
        <div>
          <label className="label" htmlFor="notes">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            className="input min-h-[80px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How does your skin feel this week?"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save weekly report"}
        </button>
      </form>

      {reports.length > 0 && (
        <>
          <section className="card">
            <h2 className="font-semibold text-[var(--brand)]">Progress comparison</h2>
            <div className="mt-6 space-y-6">
              {["skinScore", "hydrationScore", "clarityScore"].map((key) => (
                <div key={key}>
                  <p className="mb-2 text-sm font-medium capitalize">
                    {key.replace("Score", " score")}
                  </p>
                  <div className="flex items-end gap-2 h-32">
                    {reports.map((r) => {
                      const value = r[key as keyof Report] as number;
                      const height = `${(value / maxScore) * 100}%`;
                      return (
                        <div
                          key={`${r.id}-${key}`}
                          className="flex flex-1 flex-col items-center gap-1"
                        >
                          <div className="flex h-24 w-full items-end justify-center">
                            <div
                              className="w-full max-w-[48px] rounded-t-lg bg-[var(--brand)] transition-all"
                              style={{ height }}
                              title={`${value}`}
                            />
                          </div>
                          <span className="text-xs text-[var(--muted)]">W{r.weekNumber}</span>
                          <span className="text-xs font-medium">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Report history</h2>
            {reports
              .slice()
              .reverse()
              .map((r) => (
                <article key={r.id} className="card flex flex-col gap-4 md:flex-row">
                  {r.imagePath && (
                    <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={r.imagePath}
                        alt={`Week ${r.weekNumber}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">Week {r.weekNumber}</h3>
                    <p className="text-sm text-[var(--muted)]">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                    <p className="mt-2 text-sm">
                      Skin {r.skinScore} · Hydration {r.hydrationScore} · Clarity{" "}
                      {r.clarityScore}
                    </p>
                    {r.comparisonNotes && (
                      <p className="mt-2 text-sm text-[var(--brand)]">{r.comparisonNotes}</p>
                    )}
                    {r.notes && (
                      <p className="mt-1 text-sm italic text-[var(--muted)]">{r.notes}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteReport(r.id)}
                    className="text-sm text-red-600 hover:underline self-start"
                  >
                    Delete
                  </button>
                </article>
              ))}
          </section>
        </>
      )}
    </div>
  );
}
