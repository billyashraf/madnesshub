"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, PostInput } from "@/lib/validators";
import PostEditor from "./PostEditor";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(initialData?.coverImage ?? "");
  const pendingStatus = useRef<"draft" | "published">("draft");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setServerError("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Upload failed");
        return;
      }

      setValue("coverImage", json.url, { shouldValidate: true });
      setPreview(json.url);
    } catch {
      setServerError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeCover = () => {
    setValue("coverImage", "", { shouldValidate: false });
    setPreview("");
  };

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

      {/* Cover image */}
      <div>
        <input type="hidden" {...register("coverImage")} />
        {preview ? (
          <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            <Image
              src={preview}
              alt="Cover preview"
              width={900}
              height={400}
              className="w-full object-cover max-h-64"
              unoptimized
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1.5 text-xs font-medium bg-white/90 dark:bg-slate-900/90 rounded-lg hover:bg-white dark:hover:bg-slate-900 shadow transition-colors"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={removeCover}
                className="px-3 py-1.5 text-xs font-medium bg-white/90 dark:bg-slate-900/90 text-red-500 rounded-lg hover:bg-white dark:hover:bg-slate-900 shadow transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center gap-2 py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm">Uploading…</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <span className="text-sm font-medium">Add cover image</span>
                <span className="text-xs">JPEG, PNG, GIF, WebP · max 5 MB</span>
              </>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
          className="hidden"
          onChange={handleFileChange}
        />
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
          disabled={saving || uploading}
          onClick={() => { pendingStatus.current = "draft"; }}
          className="px-5 py-2.5 text-sm font-medium border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {saving && pendingStatus.current === "draft" ? "Saving…" : "Save draft"}
        </button>
        <button
          type="submit"
          disabled={saving || uploading}
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
