"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import PostCard from "@/components/PostCard";
import HiddenManager from "./HiddenManager";
import Link from "next/link";

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: { name: string; username: string; avatar?: string };
  createdAt: string;
  tags: string[];
  readingTime: number;
  coverImage?: string;
  status: "draft" | "published" | "hidden";
}

const TABS = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "hidden", label: "Hidden" },
  { key: "draft", label: "Draft" },
] as const;

export default function DashboardPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<"all" | "published" | "hidden" | "draft">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const results = await Promise.all(
        (["published", "draft", "hidden"] as const).map((s) =>
          fetch(`/api/posts?authorId=${session.user.id}&status=${s}&limit=50`).then((r) => r.json())
        )
      );
      const all = results.flatMap((r) => r.posts ?? []);
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(all);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } else {
      setError("Failed to delete post. Please try again.");
    }
  };

  const handleToggleVisibility = async (id: string) => {
    setError("");
    const res = await fetch(`/api/posts/${id}/visibility`, { method: "PATCH" });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Failed to update visibility.");
      return;
    }
    setPosts((prev) => prev.map((p) => p._id === id ? { ...p, status: json.status } : p));
  };

  const counts = {
    all: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    hidden: posts.filter((p) => p.status === "hidden").length,
    draft: posts.filter((p) => p.status === "draft").length,
  };

  const displayed = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-800">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors ${
              filter === key
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {label} <span className="ml-1 text-xs opacity-70">({counts[key]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      ) : filter === "hidden" ? (
        <HiddenManager posts={posts} onToggle={handleToggleVisibility} />
      ) : displayed.length > 0 ? (
        <div>
          {displayed.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              showStatus
              onDelete={handleDelete}
              onToggleVisibility={post.status !== "draft" ? handleToggleVisibility : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400 dark:text-slate-500 mb-4">
            {filter === "all" ? "You haven't written anything yet." : `No ${filter} posts.`}
          </p>
          <Link
            href="/dashboard/create"
            className="inline-flex px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Write your first post
          </Link>
        </div>
      )}
    </div>
  );
}
