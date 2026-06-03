"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
};

export function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/contact")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => setError("Could not load messages"));
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
    setMessages((m) => m.filter((x) => x.id !== id));
  }

  return (
    <section className="card">
      <h2 className="font-semibold text-[var(--brand)]">Contact inbox</h2>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <ul className="mt-4 space-y-4">
        {messages.length === 0 && !error && (
          <p className="text-sm text-[var(--muted)]">No messages yet.</p>
        )}
        {messages.map((m) => (
          <li key={m.id} className="rounded-xl border border-teal-900/10 p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-medium">{m.subject}</p>
                <p className="text-sm text-[var(--muted)]">
                  {m.name} · {m.email}
                  {m.phone ? ` · ${m.phone}` : ""}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(m.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
            <p className="mt-2 text-sm whitespace-pre-wrap">{m.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
