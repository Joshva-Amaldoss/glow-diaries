import { Suspense } from "react";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<p className="text-center text-[var(--muted)]">Loading…</p>}>{children}</Suspense>;
}
