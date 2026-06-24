import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Post from "@/models/Post";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const post = await Post.findById(id).lean();
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (post.author.toString() !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (post.status === "draft") {
    return NextResponse.json({ error: "Publish the post before toggling visibility" }, { status: 400 });
  }

  const newStatus = post.status === "published" ? "hidden" : "published";

  // Use updateOne to bypass any stale Mongoose model enum cache
  await Post.updateOne({ _id: id }, { $set: { status: newStatus } });

  return NextResponse.json({ status: newStatus });
}
