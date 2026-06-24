"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface AdminPost {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  createdAt: string;
  tags: string[];
  readingTime: number;
  coverImage?: string;
  author: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setError("Failed to load posts."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (post: AdminPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeleting(post._id);
    setError("");
    try {
      const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Delete failed");
        return;
      }
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const published = posts.filter((p) => p.status === "published").length;

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
          { label: "Total posts", value: posts.length },
          { label: "Published", value: published },
          { label: "Drafts", value: posts.length - published },
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

      {/* Posts list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">All Posts</h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">No posts found.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {posts.map((post) => (
              <div
                key={post._id}
                className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {post.coverImage && (
                  <Image
                    src={post.coverImage}
                    alt=""
                    width={56}
                    height={56}
                    className="hidden sm:block w-14 h-14 rounded-lg object-cover shrink-0"
                    unoptimized
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="font-medium text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                    >
                      {post.title}
                    </Link>
                    <span
                      className={`px-1.5 py-0.5 text-xs font-medium rounded-md ${
                        post.status === "published"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
                    <span>by @{post.author.username}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                    {post.tags.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{post.tags.map((t) => `#${t}`).join(" ")}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(post)}
                  disabled={deleting === post._id}
                  className="shrink-0 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {deleting === post._id ? "…" : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
