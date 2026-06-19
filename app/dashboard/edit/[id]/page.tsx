import { getPostById } from "@/lib/data";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import PostForm from "@/components/PostForm";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: Props) {
  const [session, { id }] = await Promise.all([auth(), params]);

  if (!session) redirect("/login");

  const post = await getPostById(id);
  if (!post) notFound();
  if (post.author._id.toString() !== session.user.id) redirect("/dashboard");

  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-6">Edit post</h2>
      <PostForm
        initialData={{
          id: post._id.toString(),
          title: post.title,
          content: post.content,
          coverImage: post.coverImage,
          tags: post.tags,
          status: post.status,
        }}
      />
    </div>
  );
}
