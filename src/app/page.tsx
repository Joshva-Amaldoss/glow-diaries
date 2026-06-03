import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="space-y-12">
      <section className="card relative overflow-hidden bg-gradient-to-br from-[var(--brand-light)] to-white">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="relative z-10 max-w-2xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--brand)]">
            AI Powered Ayurvedic Skincare
          </p>
          <h1 className="text-5xl font-bold leading-tight text-[var(--text)]">
            Discover Your Natural Glow
          </h1>
         <p className="text-lg text-[var(--muted)]">
            Personalized Ayurvedic skincare powered by AI. Analyze your skin,
            discover the perfect routine, and track your progress with Glow Diaries.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {session ? (
              <Link href="/dashboard" className="btn-primary">
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn-primary">
                  Create account
                </Link>
                <Link href="/login" className="btn-secondary">
                  Sign in
                </Link>
              </>
            )}
            <Link href="/products" className="btn-secondary">
              Explore Products
            </Link>

            <Link href="/contact" className="btn-secondary">
              Contact us
            </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
  {["cleanser", "toner", "serum", "moisturizer"].map((product) => (
    <div
      key={product}
      className="overflow-hidden rounded-2xl bg-white shadow-md"
    >
      <img
        src={`/products/${product}.png`}
        alt={product}
        className="h-40 w-full object-cover"
      />
    </div>
  ))}
</div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Skin analysis",
            text: "Describe your face type or upload a photo for automated analysis and product matching.",
          },
          {
            title: "Glow Diaries routine",
            text: "Cleanser, toner, serum, and moisturizer tailored to oily, dry, sensitive, or combination skin.",
          },
          {
            title: "Weekly reports",
            text: "Upload progress photos each week and compare hydration, clarity, and overall skin scores.",
          },
        ].map((item) => (
          <article key={item.title} className="card">
            <h2 className="text-lg font-semibold text-[var(--brand)]">{item.title}</h2>
            <p className="mt-2 text-[var(--muted)]">{item.text}</p>
          </article>
        ))}
      </section>
      <section className="space-y-6">
        <h2 className="text-center text-3xl font-bold text-[var(--brand)]">
          Our Skincare Routine
        </h2>

        <p className="text-center text-[var(--muted)]">
          Four simple steps for healthier, glowing skin.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            "cleanser",
            "toner",
            "serum",
            "moisturizer",
          ].map((product) => (
      <div
        key={product}
        className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-lg"
      >
        <img
          src={`/products/${product}.png`}
          alt={product}
          className="h-56 w-full object-cover"
        />

        <div className="p-4">
          <h3 className="text-lg font-semibold capitalize">
            {product}
          </h3>
        </div>
      </div>
    ))}
  </div>
</section>
<footer className="rounded-2xl bg-gradient-to-br from-[var(--brand-light)] to-white p-8 shadow-sm">
  <div className="grid gap-8 md:grid-cols-3">
    
    <div>
      <h3 className="text-xl font-bold text-[var(--brand)]">
        Glow Diaries
      </h3>
      <p className="mt-2 text-[var(--muted)]">
        AI-powered Ayurvedic skincare designed to help you
        discover your natural glow.
      </p>
    </div>

    <div>
      <h3 className="font-semibold text-[var(--brand)]">
        Quick Links
      </h3>

      <ul className="mt-2 space-y-2 text-[var(--muted)]">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/products">Products</Link></li>
        <li><Link href="/assessment">Skin Analysis</Link></li>
        <li><Link href="/contact">Contact </Link></li>
      </ul>
    </div>

    <div>
      <h3 className="font-semibold text-[var(--brand)]">
        Contact us
      </h3>

      {/*<p className="mt-2 text-[var(--muted)]">
        jozva2005@gmail.com
      </p>*/}

      <p className="text-[var(--muted)]">
        Glow Diaries Skincare
      </p>
      <div className="mt-4 flex gap-4">
  <a
    href="mailto:jozva2005@gmail.com"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      src="/emaillogo.jpg"
      alt="Email"
      className="h-8 w-8"
    />
  </a>

  <a
    href="https://instagram.com/iam_jozva"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      src="/instalogo.jpeg"
      alt="Instagram"
      className="h-8 w-8"
    />
  </a>

  <a
    href="https://wa.me/919976054047"
    target="_blank"
    rel="noopener noreferrer"
  >
    <img
      src="/whatsapplogo.jpeg"
      alt="WhatsApp"
      className="h-8 w-8"
    />
  </a>
</div>
    </div>
  </div>

  <div className="mt-8 border-t pt-4 text-center text-sm text-[var(--muted)]">
    © 2026 Glow Diaries. All rights reserved.
  </div>
</footer>
<a
  href="https://wa.me/919976054047"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-6 right-6 z-50"
>
  <img
    src="/whatsapplogo.jpeg"
    alt="WhatsApp"
    className="h-14 w-14 hover:scale-110 transition"
  />
</a>
    </div>
  );
}
