"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Footer() {
  const { data: session } = useSession();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="font-bold text-indigo-600 dark:text-indigo-400">
          madnesshub
        </Link>
        <p>A minimalist blog platform. Write freely.</p>
        <div className="flex gap-4">
          <Link href="/search" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            Search
          </Link>
          {session ? (
            <>
              {session.user.role === "admin" && (
                <Link href="/admin" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Log in
              </Link>
              <Link href="/register" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
