import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const posts = await Post.find()
    .populate("author", "name username avatar")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ posts: JSON.parse(JSON.stringify(posts)) });
}
