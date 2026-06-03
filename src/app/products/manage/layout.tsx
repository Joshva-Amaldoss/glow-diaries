import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { getSession } from "@/lib/auth";

export default async function ManageProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await isAdmin(session.userId))) redirect("/dashboard");
  return children;
}
