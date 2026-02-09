import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": apiKey },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    
    // We only want voices that have a preview URL and are high quality
    const voices = data.voices
      .filter((v: any) => v.preview_url)
      .map((v: any) => ({
        id: v.voice_id,
        name: v.name,
        previewUrl: v.preview_url,
        description: v.labels?.accent || v.labels?.description || "Professional Voice",
        category: v.category
      }))
      .slice(0, 8); // Just take the top 8 popular ones

    return NextResponse.json(voices);
  } catch (error) {
    console.error("Failed to fetch voices:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
