import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminMessages } from "@/components/AdminMessages";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await isAdmin(session.userId))) redirect("/dashboard");

  const [userCount, assessmentCount, reportCount, messageCount, recentUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.assessment.count(),
      prisma.weeklyReport.count(),
      prisma.contactMessage.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          profile: { select: { name: true } },
        },
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin dashboard</h1>
        <p className="text-[var(--muted)]">
          Manage products, view contact messages, and monitor platform activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Users", value: userCount },
          { label: "Assessments", value: assessmentCount },
          { label: "Weekly reports", value: reportCount },
          { label: "Contact messages", value: messageCount },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-2xl font-bold text-[var(--brand)]">{s.value}</p>
            <p className="text-sm text-[var(--muted)]">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="card">
        <h2 className="font-semibold text-[var(--brand)]">Quick links</h2>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm">
          <li>
            <a href="/products/manage" className="text-[var(--brand)] hover:underline">
              Product CRUD
            </a>
          </li>
          <li>
            <a href="/products" className="text-[var(--brand)] hover:underline">
              Public catalog
            </a>
          </li>
        </ul>
      </section>

      <section className="card">
        <h2 className="font-semibold">Recent users</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="text-[var(--muted)]">
              <th className="pb-2">Email</th>
              <th className="pb-2">Name</th>
              <th className="pb-2">Role</th>
              <th className="pb-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((u) => (
              <tr key={u.id} className="border-t border-teal-900/10">
                <td className="py-2">{u.email}</td>
                <td className="py-2">{u.profile?.name ?? "—"}</td>
                <td className="py-2">{u.role}</td>
                <td className="py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <AdminMessages />
    </div>
  );
}
