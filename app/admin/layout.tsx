import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AdminTabs from "./AdminTabs";

export const metadata: Metadata = { title: "Admin Panel" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Panel</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage users and content
        </p>
      </div>
      <AdminTabs />
      <div className="mt-6">{children}</div>
    </div>
  );
}
