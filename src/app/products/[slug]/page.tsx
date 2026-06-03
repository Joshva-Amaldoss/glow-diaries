import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid gap-8 lg:grid-cols-2 items-center">

        <Image
          src={`/products/${product.slug}.png`}
          alt={product.name}
          width={800}
          height={800}
          className="rounded-2xl shadow-lg"
        />

        <div>
          <p className="text-sm uppercase tracking-wide text-[var(--accent)]">
            Glow Diaries Product
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[var(--brand)]">
            {product.name}
          </h1>

          <p className="mt-4 text-lg">
            {product.description}
          </p>

          <div className="mt-6 card">
            <h2 className="text-xl font-semibold">
              Benefits
            </h2>

            <p className="mt-2">
              {product.benefits}
            </p>
          </div>

          <div className="mt-4 card">
            <h2 className="text-xl font-semibold">
              Suitable For
            </h2>

            <p className="mt-2">
              {product.skinTypes}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}