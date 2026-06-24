"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Users" },
  { href: "/admin/posts", label: "Posts" },
];

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
      {TABS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors ${
              active
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
