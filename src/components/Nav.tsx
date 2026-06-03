import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assessment", label: "Skin Analysis" },
  { href: "/weekly", label: "Weekly Reports" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export function Nav({ email, isAdmin }: { email?: string; isAdmin?: boolean }) {
  return (
    <header className="border-b border-teal-900/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
       <Link
  href="/"
  className="flex items-center gap-3 text-xl font-semibold text-[var(--brand)]"
>
  <Image
    src="/logo.jpeg"
    alt="Glow Diaries Logo"
    width={50}
    height={50}
    className="rounded-full"
  />
  <span>Glow Diaries</span>
</Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm">
          {email ? (
            <>
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-[var(--muted)] hover:text-[var(--brand)]"
                >
                  {l.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="font-medium text-[var(--brand)] hover:underline"
                >
                  Admin
                </Link>
              )}
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="text-[var(--muted)] hover:text-[var(--brand)]"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/products" className="text-[var(--muted)] hover:text-[var(--brand)]">
                Products
              </Link>
              <Link href="/contact" className="text-[var(--muted)] hover:text-[var(--brand)]">
                Contact
              </Link>
              <Link href="/login" className="btn-primary text-sm">
                Sign in
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
