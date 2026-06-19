"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import PostCard from "@/components/PostCard";
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
  status: "draft" | "published";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const statuses = filter === "all" ? ["published", "draft"] : [filter];
      const results = await Promise.all(
        statuses.map((s) =>
          fetch(`/api/posts?authorId=${session.user.id}&status=${s}&limit=50`).then((r) => r.json())
        )
      );
      const all = results.flatMap((r) => r.posts ?? []);
      all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(all);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, filter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  const counts = {
    all: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
  };

  const displayed = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-800">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-sm font-medium capitalize -mb-px border-b-2 transition-colors ${
              filter === f
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {f} <span className="ml-1 text-xs opacity-70">({counts[f]})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading…</div>
      ) : displayed.length > 0 ? (
        <div>
          {displayed.map((post) => (
            <PostCard key={post._id} post={post} showStatus onDelete={handleDelete} />
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
