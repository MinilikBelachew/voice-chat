import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📩 Received ElevenLabs Webhook:", JSON.stringify(body, null, 2));

    // ElevenLabs sends the metadata we attached during startSession
    const userId = body.metadata?.user_id;
    const analysis = body.analysis;

    if (!userId) {
      console.warn("⚠️ Webhook received without user_id in metadata");
      return NextResponse.json({ processed: false, reason: "No user_id" });
    }

    // Capture "personal_facts" from Data Collection
    const personalFacts = analysis?.data_collection?.personal_facts;

    if (personalFacts && personalFacts.trim() !== "") {
      console.log(`✨ New smart memory for user ${userId}:`, personalFacts);
      
      // Save to database
      await prisma.memory.create({
        data: {
          userId: userId,
          content: personalFacts,
          category: "automatic_analysis",
          importance: 8, // Set a high importance for analyzed facts
        },
      });
    }

    // You can also capture "success" evaluation here if needed
    // const success = analysis?.success_evaluation?.is_success;

    return NextResponse.json({ processed: true });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
