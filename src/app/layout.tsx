import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Glow Diaries Care | Personalized Skincare",
  description:
    "Healthcare skincare portal with face analysis, product recommendations, and weekly progress tracking.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  const admin =
    session?.role === "ADMIN" || (session ? await isAdmin(session.userId) : false);

  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Nav email={session?.email} isAdmin={admin} />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        {/*<footer className="mt-16 border-t border-teal-900/10 bg-white py-8 text-center text-sm text-[var(--muted)]">
          <p>© {new Date().getFullYear()} Glow Diaries Healthcare Skincare</p>
          <p className="mt-1">
            <a href="/contact" className="text-[var(--brand)] hover:underline">
              Contact support
            </a>
          </p>
        </footer>*/}
      </body>
    </html>
  );
}
