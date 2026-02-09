import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!agentId || !apiKey) {
      console.error("❌ Missing environment variables");
      return NextResponse.json(
        { error: "Missing environment variables" },
        { status: 500 }
      );
    }

    // Get user session for personalization
    const session = await getServerSession(authOptions);
    
    let personalization = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { 
          memories: { 
            orderBy: { createdAt: "desc" },
            take: 10 
          } 
        },
      });

      if (user && user.aiName && user.aiBehavior) {
        personalization = {
          userId: user.id,
          aiName: user.aiName,
          userName: user.name || "friend",
          aiBehavior: user.aiBehavior,
          voiceId: user.voiceId,
          memories: user.memories.map((m: any) => m.content)
        };
      }
    }

    // Get the signed URL
    const url = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `ElevenLabs API error (${response.status}): ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ 
      signedUrl: data.signed_url,
      personalization 
    });
  } catch (error) {
    console.error("❌ Error in get-signed-url route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
