"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface AdminUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: "user" | "admin";
  postCount: number;
  createdAt: string;
}

function Avatar({ user }: { user: AdminUser }) {
  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.name}
        width={36}
        height={36}
        className="w-9 h-9 rounded-full object-cover"
        unoptimized
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(() => setError("Failed to load users."))
      .finally(() => setLoading(false));
  }, []);

  const toggleRole = async (user: AdminUser) => {
    setToggling(user._id);
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to update role");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setToggling(null);
    }
  };

  const totalPosts = users.reduce((s, u) => s + u.postCount, 0);

  return (
    <div>
      {error && (
        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total users", value: users.length },
          { label: "Total posts", value: totalPosts },
          { label: "Admins", value: users.filter((u) => u.role === "admin").length },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
          >
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Users</h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading…</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No users found.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => {
              const isSelf = user._id === session?.user?.id;
              return (
                <div
                  key={user._id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Avatar user={user} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                        {user.name}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-xs">
                        @{user.username}
                      </span>
                      {user.role === "admin" && (
                        <span className="px-1.5 py-0.5 text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-md">
                          admin
                        </span>
                      )}
                      {isSelf && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md">
                          you
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {user.postCount} {user.postCount === 1 ? "post" : "posts"}
                  </div>

                  <button
                    onClick={() => toggleRole(user)}
                    disabled={isSelf || toggling === user._id}
                    className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      user.role === "admin"
                        ? "border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                    title={isSelf ? "You cannot change your own role" : undefined}
                  >
                    {toggling === user._id
                      ? "…"
                      : user.role === "admin"
                      ? "Demote"
                      : "Make admin"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
