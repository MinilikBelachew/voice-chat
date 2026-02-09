import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { 
        memories: { 
          orderBy: { importance: "desc" },
          take: 5 
        } 
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build the personalized configuration
    const aiName = user.aiName || "your AI friend";
    const userName = user.name || "friend";
    const aiBehavior = user.aiBehavior || "You are a warm, empathetic best friend. Use casual language and show genuine care.";
    
    // Build memories context
    const memoriesText = user.memories.length > 0 
      ? `\n\nThings you remember about ${userName}: ${user.memories.map((m: any) => m.content).join(". ")}.`
      : "";

    // Construct the system prompt
    const systemPrompt = `Your name is ${aiName}. You are a conversational AI companion for ${userName}.

Your personality and behavior: ${aiBehavior}

Important guidelines:
- Always stay in character as ${aiName}
- Be a supportive and engaging friend
- Use natural, conversational language
- Ask follow-up questions to keep the conversation flowing
- Show genuine interest in what ${userName} shares${memoriesText}

Remember: You are ${aiName}, ${userName}'s trusted companion. Make every conversation meaningful.`;

    const firstMessage = `Hey ${userName}! It's ${aiName} here. How are you doing today?`;

    return NextResponse.json({
      systemPrompt,
      firstMessage,
      aiName,
      userName,
    });
  } catch (error) {
    console.error("Error fetching user config:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
