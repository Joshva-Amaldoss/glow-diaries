export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-[var(--brand)]">
          About Glow Diaries
        </h1>

        <p className="mt-4 text-lg text-[var(--muted)]">
          Where Ayurvedic wisdom meets AI-powered skincare.
        </p>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold text-[var(--brand)]">
          Our Mission
        </h2>

        <p className="mt-4">
          Glow Diaries helps people discover personalized skincare
          routines using artificial intelligence and natural
          Ayurvedic products.
        </p>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold text-[var(--brand)]">
          Why Glow Diaries?
        </h2>

        <p className="mt-4">
          We combine technology, skin analysis, and carefully
          selected skincare products to help users achieve
          healthier and more radiant skin.
        </p>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold text-[var(--brand)]">
          Our Products
        </h2>

        <p className="mt-4">
          Our skincare routine includes Facial Cleanser,
          Facial Toner, Facial Serum, and Moisturizer,
          designed for different skin types and concerns.
        </p>
      </div>
    </div>
  );
}