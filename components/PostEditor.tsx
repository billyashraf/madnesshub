"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface PostEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PostEditor({ value, onChange }: PostEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
            tab === "write"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
            tab === "preview"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          Preview
        </button>
        <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">Markdown supported</span>
      </div>

      {tab === "write" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Write your post in Markdown...\n\n# Heading\n\nParagraph text goes here.\n\n**Bold** and *italic* and \`code\`.`}
          className="w-full h-96 p-4 text-sm font-mono resize-y bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
        />
      ) : (
        <div className="min-h-96 p-6 bg-white dark:bg-slate-900">
          {value.trim() ? (
            <div className="prose dark:prose-invert">
              <ReactMarkdown>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-sm italic">Nothing to preview yet...</p>
          )}
        </div>
      )}
    </div>
  );
}
