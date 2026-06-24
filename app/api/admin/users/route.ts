import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Post from "@/models/Post";
import mongoose from "mongoose";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();

  const counts = await Post.aggregate([
    { $match: { author: { $in: users.map((u) => u._id as mongoose.Types.ObjectId) } } },
    { $group: { _id: "$author", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count as number]));

  const result = users.map((u) => ({
    ...u,
    _id: (u._id as mongoose.Types.ObjectId).toString(),
    postCount: countMap[(u._id as mongoose.Types.ObjectId).toString()] ?? 0,
  }));

  return NextResponse.json({ users: result });
}
