import { getUserByUsername } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import type { Metadata } from "next";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const data = await getUserByUsername(username);
  if (!data) return { title: "User not found" };
  return {
    title: data.user.name,
    description: data.user.bio ?? `Posts by ${data.user.name} on madnesshub`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const data = await getUserByUsername(username);
  if (!data) notFound();

  const { user, posts } = data;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div className="flex items-start gap-5 mb-10 pb-10 border-b border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-2xl shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">@{user.username}</p>
          {user.bio && (
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{user.bio}</p>
          )}
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Member since {formatDate(user.createdAt)} · {posts.length} post{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Posts */}
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
        Posts by {user.name}
      </h2>

      {posts.length > 0 ? (
        <div>
          {posts.map((post: Parameters<typeof PostCard>[0]["post"]) => (
            <PostCard key={post._id} post={{ ...post, author: { name: user.name, username: user.username, avatar: user.avatar } }} />
          ))}
        </div>
      ) : (
        <p className="text-slate-400 dark:text-slate-500 py-8 text-center">
          No published posts yet.
        </p>
      )}

      <div className="mt-8">
        <Link href="/" className="text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          ← Back to all posts
        </Link>
      </div>
    </div>
  );
}
