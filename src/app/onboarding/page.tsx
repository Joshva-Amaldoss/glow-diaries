"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(GENDERS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age: Number(age), gender }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not save profile");
      return;
    }
    router.push("/assessment");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="card">
        <h1 className="text-2xl font-bold">Your profile</h1>
        <p className="mt-1 text-[var(--muted)]">
          After login, tell us your name, age, and gender so we can personalize recommendations.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="age">
              Age
            </label>
            <input
              id="age"
              type="number"
              min={1}
              max={120}
              className="input"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              className="input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Saving…" : "Continue to skin analysis"}
          </button>
        </form>
      </div>
    </div>
  );
}
