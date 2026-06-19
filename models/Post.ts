import mongoose, { Schema, model, models, Document, Types } from "mongoose";
import slugify from "slugify";
import { calculateReadingTime } from "@/lib/utils";

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  tags: string[];
  status: "draft" | "published";
  author: Types.ObjectId;
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    content: { type: String, required: true },
    coverImage: { type: String },
    tags: [{ type: String, lowercase: true, trim: true }],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    readingTime: { type: Number, default: 1 },
  },
  { timestamps: true }
);

PostSchema.index({ title: "text", content: "text" });

PostSchema.pre("save", function () {
  if (this.isNew) {
    const base = slugify(this.title, { lower: true, strict: true });
    this.slug = `${base}-${Date.now().toString(36)}`;
  }
  if (this.isNew || this.isModified("content")) {
    this.readingTime = calculateReadingTime(this.content);
  }
});

const Post = models.Post ?? model<IPost>("Post", PostSchema);
export default Post;
