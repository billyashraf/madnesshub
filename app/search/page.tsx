import { getPosts } from "@/lib/data";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search" };
export const dynamic = "force-dynamic";

interface SearchParams { q?: string; tag?: string; page?: string; }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, tag, page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page));

  const { posts, pages } = q || tag
    ? await getPosts({ q, tag, page: currentPage, limit: 10 })
    : { posts: [], pages: 0 };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-100">Search posts</h1>

      <form method="GET" className="mb-10">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by title or content…"
            autoFocus
            className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
          />
        </div>
      </form>

      {(q || tag) ? (
        posts.length > 0 ? (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              {posts.length} result{posts.length !== 1 ? "s" : ""} for{" "}
              {q && <>&ldquo;<strong className="text-slate-700 dark:text-slate-300">{q}</strong>&rdquo;</>}
              {tag && <>tag <strong className="text-slate-700 dark:text-slate-300">#{tag}</strong></>}
            </p>
            <div>
              {posts.map((post: Parameters<typeof PostCard>[0]["post"]) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {currentPage > 1 && (
                  <Link href={`/search?${new URLSearchParams({ ...(q && { q }), ...(tag && { tag }), page: String(currentPage - 1) })}`} className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    Previous
                  </Link>
                )}
                <span className="text-sm text-slate-500">Page {currentPage} of {pages}</span>
                {currentPage < pages && (
                  <Link href={`/search?${new URLSearchParams({ ...(q && { q }), ...(tag && { tag }), page: String(currentPage + 1) })}`} className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-400 dark:text-slate-500 py-12 text-center">
            No posts found for &ldquo;{q || tag}&rdquo;.
          </p>
        )
      ) : (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <p>Type something above to search posts.</p>
        </div>
      )}
    </div>
  );
}
