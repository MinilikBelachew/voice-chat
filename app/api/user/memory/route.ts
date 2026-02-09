import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, category } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Save the memory
    const memory = await prisma.memory.create({
      data: {
        userId: (session.user as any).id,
        content,
        category: category || "general",
      },
    });

    return NextResponse.json(memory);
  } catch (error: any) {
    console.error("Error saving memory:", error);
    return NextResponse.json({ error: "Failed to save memory" }, { status: 500 });
  }
}
