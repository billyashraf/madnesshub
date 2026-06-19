import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/data";

type Params = { params: Promise<{ username: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { username } = await params;
    const data = await getUserByUsername(username);
    if (!data) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
