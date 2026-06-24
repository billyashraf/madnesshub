import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
  }

  const { role } = await req.json();
  if (role !== "user" && role !== "admin") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user });
}
