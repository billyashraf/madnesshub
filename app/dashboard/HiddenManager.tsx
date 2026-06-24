"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Post {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "hidden";
  createdAt: string;
  readingTime: number;
  tags: string[];
  coverImage?: string;
}

interface HiddenManagerProps {
  posts: Post[];
  onToggle: (id: string) => Promise<void>;
}

export default function HiddenManager({ posts, onToggle }: HiddenManagerProps) {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const hiddenPosts = posts.filter((p) => p.status === "hidden");
  const publishedPosts = posts.filter((p) => p.status === "published");

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = () =>
    setSelected(
      selected.size === publishedPosts.length
        ? new Set()
        : new Set(publishedPosts.map((p) => p._id))
    );

  const hideSelected = async () => {
    setBusy(new Set(selected));
    for (const id of selected) {
      await onToggle(id);
    }
    setBusy(new Set());
    setSelected(new Set());
    setSelecting(false);
  };

  const handleToggle = async (id: string) => {
    setBusy((prev) => new Set(prev).add(id));
    await onToggle(id);
    setBusy((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  return (
    <div className="space-y-8">
      {/* ── Selector panel ───────────────────────────────────────── */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900/60">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Select posts to hide
          </h3>
          {selecting ? (
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                {selected.size === publishedPosts.length ? "Deselect all" : "Select all"}
              </button>
              <button
                onClick={hideSelected}
                disabled={selected.size === 0 || busy.size > 0}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-lg hover:bg-slate-700 dark:hover:bg-white transition-colors disabled:opacity-40"
              >
                {busy.size > 0 ? "Hiding…" : `Hide ${selected.size > 0 ? `${selected.size} ` : ""}selected`}
              </button>
              <button
                onClick={() => { setSelecting(false); setSelected(new Set()); }}
                className="px-3 py-1.5 text-xs font-medium border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSelecting(true)}
              disabled={publishedPosts.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
              </svg>
              Select posts to hide
            </button>
          )}
        </div>

        {selecting && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {publishedPosts.length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400 text-center">No published posts to hide.</p>
            ) : (
              publishedPosts.map((post) => {
                const checked = selected.has(post._id);
                return (
                  <label
                    key={post._id}
                    className={`flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${checked ? "bg-slate-50 dark:bg-slate-800/40" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSelect(post._id)}
                      className="w-4 h-4 rounded accent-indigo-600"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{post.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatDate(post.createdAt)} · {post.readingTime} min read
                      </p>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ── Hidden posts list ─────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
          Hidden posts ({hiddenPosts.length})
        </h3>

        {hiddenPosts.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <p className="text-slate-400 dark:text-slate-500 text-sm">No hidden posts yet.</p>
          </div>
        ) : (
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {hiddenPosts.map((post) => (
              <div key={post._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                {post.coverImage && (
                  <img src={post.coverImage} alt="" className="hidden sm:block w-12 h-12 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
                  >
                    {post.title}
                  </Link>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {formatDate(post.createdAt)} · {post.readingTime} min read
                    {post.tags.length > 0 && ` · ${post.tags.map((t) => `#${t}`).join(" ")}`}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(post._id)}
                  disabled={busy.has(post._id)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  {busy.has(post._id) ? "…" : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                      Unhide
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
