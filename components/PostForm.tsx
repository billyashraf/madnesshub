"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, PostInput } from "@/lib/validators";
import PostEditor from "./PostEditor";
import { useRouter } from "next/navigation";

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
    coverImage?: string;
    tags: string[];
    status: "draft" | "published";
  };
}

export default function PostForm({ initialData }: PostFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const pendingStatus = useRef<"draft" | "published">("draft");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          content: initialData.content,
          coverImage: initialData.coverImage ?? "",
          tags: initialData.tags.join(", "),
          status: initialData.status,
        }
      : { status: "draft", content: "", tags: "" },
  });

  const content = watch("content", "");

  const onSubmit = async (data: PostInput) => {
    setSaving(true);
    setServerError("");

    const payload = {
      ...data,
      status: pendingStatus.current,
      tags: data.tags ?? "",
    };

    const method = initialData ? "PATCH" : "POST";
    const url = initialData ? `/api/posts/${initialData.id}` : "/api/posts";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const json = await res.json();
        setServerError(json.error ?? "Something went wrong");
      }
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {serverError}
        </div>
      )}

      <div>
        <input
          {...register("title")}
          placeholder="Post title..."
          className="w-full text-2xl sm:text-3xl font-bold bg-transparent border-none focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-100"
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <input
          {...register("coverImage")}
          placeholder="Cover image URL (optional)"
          className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder:text-slate-400"
        />
        {errors.coverImage && <p className="mt-1 text-sm text-red-500">{errors.coverImage.message}</p>}
      </div>

      <div>
        <input
          {...register("tags")}
          placeholder="Tags: javascript, react, web (comma-separated)"
          className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder:text-slate-400"
        />
      </div>

      <div>
        <PostEditor value={content} onChange={(val) => setValue("content", val, { shouldValidate: true })} />
        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          onClick={() => { pendingStatus.current = "draft"; }}
          className="px-5 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {saving && pendingStatus.current === "draft" ? "Saving…" : "Save draft"}
        </button>
        <button
          type="submit"
          disabled={saving}
          onClick={() => { pendingStatus.current = "published"; }}
          className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving && pendingStatus.current === "published" ? "Publishing…" : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="ml-auto text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
