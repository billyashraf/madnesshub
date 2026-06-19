import { connectDB } from "./mongodb";
import Post from "@/models/Post";
import User from "@/models/User";

interface GetPostsOptions {
  q?: string;
  tag?: string;
  page?: number;
  limit?: number;
  status?: "draft" | "published";
  authorId?: string;
}

export async function getPosts({
  q,
  tag,
  page = 1,
  limit = 10,
  status = "published",
  authorId,
}: GetPostsOptions = {}) {
  await connectDB();

  const filter: Record<string, unknown> = { status };
  if (authorId) filter.author = authorId;
  if (tag) filter.tags = tag;
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("author", "name username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return {
    posts: JSON.parse(JSON.stringify(posts)),
    total,
    pages: Math.ceil(total / limit),
    page,
  };
}

export async function getPostBySlug(slug: string) {
  await connectDB();
  const post = await Post.findOne({ slug, status: "published" })
    .populate("author", "name username avatar bio")
    .lean();
  return post ? JSON.parse(JSON.stringify(post)) : null;
}

export async function getPostById(id: string) {
  await connectDB();
  const post = await Post.findById(id)
    .populate("author", "name username avatar")
    .lean();
  return post ? JSON.parse(JSON.stringify(post)) : null;
}

export async function getUserByUsername(username: string) {
  await connectDB();
  const user = await User.findOne({ username }).lean();
  if (!user) return null;

  const posts = await Post.find({ author: user._id, status: "published" })
    .sort({ createdAt: -1 })
    .lean();

  return {
    user: JSON.parse(JSON.stringify(user)),
    posts: JSON.parse(JSON.stringify(posts)),
  };
}
