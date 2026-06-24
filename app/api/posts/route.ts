import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";
import { auth } from "@/lib/auth";
import { postSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q") ?? undefined;
    const tag = searchParams.get("tag") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "10"));
    const status = (searchParams.get("status") as "draft" | "published" | "hidden") ?? "published";
    const authorId = searchParams.get("authorId") ?? undefined;

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

    return NextResponse.json({ posts, total, pages: Math.ceil(total / limit), page });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const tags = parsed.data.tags
      ? parsed.data.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const post = await Post.create({
      title: parsed.data.title,
      content: parsed.data.content,
      coverImage: parsed.data.coverImage || undefined,
      tags,
      status: parsed.data.status,
      author: session.user.id,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
