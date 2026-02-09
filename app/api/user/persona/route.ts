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

    const { persona } = await req.json();

    if (!persona) {
      return NextResponse.json({ error: "Persona is required" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { selectedPersona: persona },
    });

    return NextResponse.json({ message: "Persona updated successfully" });
  } catch (error: any) {
    console.error("Error updating persona:", error);
    return NextResponse.json({ error: "Failed to update persona" }, { status: 500 });
  }
}
