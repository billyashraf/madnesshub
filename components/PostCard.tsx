import Link from "next/link";
import { formatDate, getExcerpt } from "@/lib/utils";

interface Author {
  name: string;
  username: string;
  avatar?: string;
}

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    slug: string;
    content: string;
    author: Author;
    createdAt: string;
    tags: string[];
    readingTime: number;
    coverImage?: string;
    status?: "draft" | "published" | "hidden";
  };
  showStatus?: boolean;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
}

const STATUS_STYLES = {
  published: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  hidden: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  draft: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function PostCard({ post, showStatus, onDelete, onToggleVisibility }: PostCardProps) {
  const excerpt = getExcerpt(post.content);
  const isHidden = post.status === "hidden";
  const isDraft = post.status === "draft";

  return (
    <article className={`group border-b border-slate-200 dark:border-slate-800 py-8 last:border-0 ${isHidden ? "opacity-60" : ""}`}>
      {post.coverImage && (
        <Link href={`/blog/${post.slug}`}>
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-48 object-cover rounded-xl mb-4"
          />
        </Link>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/?tag=${encodeURIComponent(tag)}`}
            className="text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-full font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            {tag}
          </Link>
        ))}
        {showStatus && post.status && (
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[post.status]}`}>
            {post.status === "published" ? "Published" : post.status === "hidden" ? "Hidden" : "Draft"}
          </span>
        )}
      </div>

      <Link href={`/blog/${post.slug}`}>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
          {post.title}
        </h2>
      </Link>

      <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-3">{excerpt}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <Link
            href={`/profile/${post.author.username}`}
            className="font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {post.author.name}
          </Link>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span>{formatDate(post.createdAt)}</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span>{post.readingTime} min read</span>
        </div>

        {(onDelete || onToggleVisibility) && (
          <div className="flex gap-2">
            {onToggleVisibility && !isDraft && (
              <button
                onClick={() => onToggleVisibility(post._id)}
                title={isHidden ? "Make visible" : "Hide post"}
                className="text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                {isHidden ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                    Show
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
                    </svg>
                    Hide
                  </>
                )}
              </button>
            )}
            {onDelete && (
              <>
                <Link
                  href={`/dashboard/edit/${post._id}`}
                  className="text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(post._id)}
                  className="text-xs px-3 py-1.5 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
