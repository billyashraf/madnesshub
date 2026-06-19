import PostForm from "@/components/PostForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New post" };

export default function CreatePostPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-6">New post</h2>
      <PostForm />
    </div>
  );
}
