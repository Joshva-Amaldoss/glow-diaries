import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const products = [
  {
    slug: "cleanser",
    name: " Facial Cleanser ",
    description:
      "Gentle daily cleanser that removes impurities without stripping natural moisture.",
    benefits: "Deep cleanse, balanced pH, preps skin for treatment",
    skinTypes: "oily,combination,normal,sensitive",
    concerns: "acne,dullness,clogged pores,oiliness",
  },
  {
    slug: "toner",
    name: " Facial Toner ",
    description:
      "Refreshing toner that refines pores and restores skin balance after cleansing.",
    benefits: "Pore refinement, hydration boost, even tone",
    skinTypes: "oily,combination,dry,normal",
    concerns: "large pores,dullness,uneven tone,dehydration",
  },
  {
    slug: "serum",
    name: " Facial Serum ",
    description:
      "Concentrated active serum targeting texture, brightness, and early signs of aging.",
    benefits: "Brightening, fine-line support, antioxidant protection",
    skinTypes: "dry,normal,combination,mature",
    concerns: "wrinkles,dullness,hyperpigmentation,texture",
  },
  {
    slug: "moisturizer",
    name: " Moisturizer ",
    description:
      "Lightweight moisturizer that locks in hydration and strengthens the skin barrier.",
    benefits: "Long-lasting hydration, barrier repair, soft finish",
    skinTypes: "dry,normal,sensitive,combination",
    concerns: "dryness,flakiness,sensitivity,redness",
  },
];

async function main() {
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log("Seeded Glow Diaries products.");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@Glow Diaries.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin user: ${adminEmail} (password from ADMIN_PASSWORD or default Admin123!)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
