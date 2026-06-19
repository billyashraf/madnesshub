import { getPostBySlug, getPosts } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.content.slice(0, 160).replace(/[#*`]/g, ""),
    openGraph: { images: post.coverImage ? [post.coverImage] : [] },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Cover image */}
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-56 sm:h-72 object-cover rounded-2xl mb-8"
        />
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {post.tags.map((tag: string) => (
            <Link
              key={tag}
              href={`/?tag=${encodeURIComponent(tag)}`}
              className="text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-full font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5 text-slate-900 dark:text-slate-100">
        {post.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 pb-8 mb-8 border-b border-slate-200 dark:border-slate-800">
        <Link
          href={`/profile/${post.author.username}`}
          className="font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {post.author.name}
        </Link>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <span>{formatDate(post.createdAt)}</span>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <span>{post.readingTime} min read</span>
      </div>

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Author card */}
      <div className="mt-16 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Written by
        </p>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg shrink-0">
            {post.author.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <Link
              href={`/profile/${post.author.username}`}
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {post.author.name}
            </Link>
            {post.author.bio && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{post.author.bio}</p>
            )}
            <Link
              href={`/profile/${post.author.username}`}
              className="mt-2 inline-block text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View profile →
            </Link>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link
          href="/"
          className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          ← Back to all posts
        </Link>
      </div>
    </div>
  );
}
