"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, subject, message }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Could not send message. Check all fields.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold">Contact us</h1>
        <p className="mt-2 text-[var(--muted)]">
          Reach Glow Diaries Healthcare Skincare for product questions, consultations, or
          technical support.
        </p>
        <div className="card mt-6 space-y-3 text-sm">
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:support@Glow Diaries.com" className="text-[var(--brand)]">
              support@Glow Diaries.com
            </a>
          </p>
          <p>
            <strong>Phone:</strong> +1 (800) 555-0142
          </p>
          <p>
            <strong>Hours:</strong> Mon–Fri, 9:00 AM – 6:00 PM
          </p>
          <p>
            <strong>Address:</strong> 120 Wellness Drive, Suite 400, Boston, MA 02108
          </p>
        </div>
      </div>

      <div className="card">
        {sent ? (
          <p className="text-[var(--brand)] font-medium">
            Thank you. We received your message and will respond within 1–2 business days.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">
                Name
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
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="phone">
                Phone (optional)
              </label>
              <input
                id="phone"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                className="input min-h-[120px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                minLength={10}
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
