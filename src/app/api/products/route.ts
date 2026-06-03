import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { requireAdmin, forbiddenResponse } from "@/lib/admin";

const productSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  benefits: z.string().min(1),
  skinTypes: z.string().min(1),
  concerns: z.string().min(1),
  active: z.boolean().optional(),
});

export async function GET(request: Request) {
  const session = await getSession();
  const all = new URL(request.url).searchParams.get("all") === "1";
  const products = await prisma.product.findMany({
    where: all && session ? undefined : { active: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return forbiddenResponse();
  }

  try {
    const body = await request.json();
    const data = productSchema.parse(body);
    const product = await prisma.product.create({ data });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
  }
}
