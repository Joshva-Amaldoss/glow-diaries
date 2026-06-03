import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";

export default async function ProductsPage() {
  const session = await getSession();
  const admin = session ? await isAdmin(session.userId) : false;
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  const routineOrder = ["cleanser", "toner", "serum", "moisturizer"];
  const ordered = routineOrder
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean) as typeof products;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Glow Diaries products</h1>
          <p className="text-[var(--muted)]">
            Cleanser, facial toner, serum, and moisturizer for your daily routine.
          </p>
        </div>
        {admin && (
          <Link href="/products/manage" className="btn-secondary text-sm">
            Manage products (CRUD)
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
  {ordered.map((p, i) => (
  <Link
    key={p.id}
    href={`/products/${p.slug}`}
    className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg block"
  >
      <Image
        src={`/products/${p.slug}.png`}
        alt={p.name}
        width={500}
        height={500}
        className="h-64 w-full object-cover"
      />

      <div className="p-5">
        <span className="text-xs font-medium uppercase text-[var(--accent)]">
          Step {i + 1}
        </span>

        <h2 className="mt-2 text-xl font-semibold text-[var(--brand)]">
          {p.name}
        </h2>

        <p className="mt-3 text-sm text-gray-600">
          {p.description}
        </p>

        <p className="mt-3 text-sm text-[var(--muted)]">
          <strong>Benefits:</strong> {p.benefits}
        </p>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Suitable for: {p.skinTypes}
        </p>
      </div>
    </Link>
  ))}
</div>
    </div>
  );
}
