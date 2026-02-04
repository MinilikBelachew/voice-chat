import { NextResponse } from "next/server";

export async function GET() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  console.log("=== ElevenLabs API Debug ===");
  console.log("Agent ID:", agentId ? "✓ Found" : "✗ Missing");
  console.log("API Key:", apiKey ? `✓ Found (${apiKey.substring(0, 10)}...)` : "✗ Missing");

  if (!agentId || !apiKey) {
    console.error("Missing environment variables!");
    return NextResponse.json(
      { error: "Missing environment variables" },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`;
    console.log("Requesting URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
    });

    console.log("Response Status:", response.status);
    console.log("Response Headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ ElevenLabs Error Response:", errorText);
      return NextResponse.json(
        { error: `ElevenLabs API error (${response.status}): ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log("✅ Successfully got signed URL");
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (error) {
    console.error("❌ Error fetching signed URL:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
