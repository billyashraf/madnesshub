import Link from "next/link";
import PostCard from "@/components/PostCard";
import { getPosts } from "@/lib/data";

interface SearchParams {
  q?: string;
  tag?: string;
  page?: string;
}

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, tag, page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page));

  const { posts, pages } = await getPosts({ q, tag, page: currentPage, limit: 10 });

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          {tag ? (
            <>Posts tagged <span className="text-indigo-600 dark:text-indigo-400">#{tag}</span></>
          ) : q ? (
            <>Results for &ldquo;<span className="text-indigo-600 dark:text-indigo-400">{q}</span>&rdquo;</>
          ) : (
            <>Welcome to <span className="text-indigo-600 dark:text-indigo-400">madnesshub</span></>
          )}
        </h1>
        {!q && !tag && (
          <p className="text-lg text-slate-600 dark:text-slate-400">
            A minimalist space for ideas. Read freely, write boldly.
          </p>
        )}
      </div>

      {/* Search */}
      <form method="GET" className="mb-10">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            name="q"
            defaultValue={q}
            placeholder="Search posts…"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
          />
        </div>
      </form>

      {/* Active filters */}
      {(q || tag) && (
        <div className="flex items-center gap-2 mb-6 text-sm">
          <span className="text-slate-500">Filtering by:</span>
          {tag && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
              #{tag}
              <Link href="/" className="ml-1 hover:text-indigo-800">×</Link>
            </span>
          )}
          {q && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
              &ldquo;{q}&rdquo;
              <Link href="/" className="ml-1 hover:text-slate-800">×</Link>
            </span>
          )}
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 ? (
        <>
          <div>
            {posts.map((post: Parameters<typeof PostCard>[0]["post"]) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {currentPage > 1 && (
                <Link
                  href={`/?${new URLSearchParams({ ...(q && { q }), ...(tag && { tag }), page: String(currentPage - 1) })}`}
                  className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-slate-500">Page {currentPage} of {pages}</span>
              {currentPage < pages && (
                <Link
                  href={`/?${new URLSearchParams({ ...(q && { q }), ...(tag && { tag }), page: String(currentPage + 1) })}`}
                  className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400 dark:text-slate-500 text-lg mb-4">
            {q || tag ? "No posts found." : "No posts yet. Be the first to write!"}
          </p>
          <Link href="/register" className="inline-flex px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Start writing
          </Link>
        </div>
      )}
    </div>
  );
}
