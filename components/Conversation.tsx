"use client";

import { useConversation } from "@elevenlabs/react";
import { useCallback, useState, useRef } from "react";
import { Mic, Square, LogOut } from "lucide-react";
import { OrbVisualizer } from "./OrbVisualizer";
import { useSession, signOut } from "next-auth/react";

export function Conversation() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const transcriptRef = useRef<{ role: string; text: string }[]>([]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("✅ Connected to AI");
      setMessages([]);
      transcriptRef.current = [];
    },
    onDisconnect: () => {
      console.log("Disconnected");
      handleEndSession();
    },
    onMessage: (message: any) => {
      console.log("Message:", message);
      const newMessage = { role: message.source, text: message.message };
      setMessages((prev) => [...prev, newMessage]);
      transcriptRef.current.push(newMessage);
    },
    onError: (error: any) => console.error("Error:", error),
  });

  const { status, isSpeaking } = conversation;

  const handleEndSession = async () => {
    if (transcriptRef.current.length === 0 || !session) return;

    console.log("Analyzing transcript for memories...");
    try {
      const userMessages = transcriptRef.current
        .filter(m => m.role === "user")
        .map(m => m.text.toLowerCase());

      const facts: string[] = [];
      const today = new Date().toLocaleDateString();

      userMessages.forEach(text => {
        // Birthday logic
        if (text.includes("birthday")) {
          if (text.includes("tomorrow")) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            facts.push(`User mentioned their birthday is tomorrow (${tomorrow.toLocaleDateString()}).`);
          } else if (text.includes("today")) {
            facts.push(`Today (${today}) is the user's birthday.`);
          } else {
            facts.push(`User mentioned: "${text}" regarding their birthday.`);
          }
        }
        
        // Likes/Preferences
        if (text.includes("i love") || text.includes("i like") || text.includes("my favorite")) {
          facts.push(`User preference: "${text}"`);
        }

        // Personal life
        if (text.includes("work") || text.includes("job") || text.includes("school")) {
          facts.push(`User mentioned personal life: "${text}"`);
        }
      });

      // Avoid duplicates and save
      const uniqueFacts = Array.from(new Set(facts));
      for (const fact of uniqueFacts) {
        await fetch("/api/user/memory", {
          method: "POST",
          body: JSON.stringify({ content: fact, category: "automatic" }),
          headers: { "Content-Type": "application/json" },
        });
      }
      
      console.log("Stored", uniqueFacts.length, "new memories.");
    } catch (err) {
      console.error("Failed to extract memories:", err);
    }
  };

  const startConversation = useCallback(async () => {
    try {
      const response = await fetch("/api/get-signed-url");
      const { signedUrl, personalization } = await response.json();

      if (!signedUrl) {
        throw new Error("Failed to get signed URL");
      }

      // Construct per-session overrides for 1000+ user scalability
      let overrides = undefined;
      const today = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      if (personalization) {
        overrides = {
          agent: {
            prompt: {
              prompt: `Your name is ${personalization.aiName}. You are a conversational AI companion for ${personalization.userName}.
              
              Current Date: ${today}
              
              Personality: ${personalization.aiBehavior}
              
              Important Memories about ${personalization.userName}:
              ${personalization.memories?.join(". ") || "No memories yet."}
              
              Guidelines:
              - Always stay in character as ${personalization.aiName}.
              - **MEMORY REASONING**: Look at the latest memory. If the user said "My sister", you must ask about "Your sister". If the user said "I have an interview", you must ask "How was your interview?". 
              - **PROACTIVE START**: After saying the firstMessage, you must immediately ask a natural, caring question about the most recent memory.
              - Do not repeat the memory word-for-word; rephrase it like a real friend would.
              - Ask genuine follow-up questions.`
            },
            // This 'bridge' forces the AI to finish the thought using the memories above
            firstMessage: `Hey ${personalization.userName}! I was just thinking about what we talked about last time...`
          },
          tts: {
            voiceId: personalization.voiceId
          }
        };
        console.log("✅ Applying AI-reasoning overrides for:", personalization.aiName);
      }

      await conversation.startSession({ 
        signedUrl,
        overrides,
        metadata: {
          user_id: personalization?.userId
        }
      } as any);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Auth Info & Logout */}
      {session && (
        <div className="flex items-center gap-4 bg-foreground/3 px-4 py-2 rounded-full border border-foreground/5 animate-in fade-in slide-in-from-top-4 duration-1000">
          <img 
            src={session.user?.image || `https://ui-avatars.com/api/?name=${session.user?.name || 'User'}`} 
            className="w-6 h-6 rounded-full" 
            alt="User"
          />
          <span className="text-xs font-medium text-foreground/40">{session.user?.name || session.user?.email}</span>
          <button 
            onClick={() => signOut()}
            className="p-1 hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Orb Section */}
      <div className="flex flex-col items-center gap-8">
        {/* Orb Container */}
        <div className="relative flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-500">
          {/* Canvas Orb */}
          <OrbVisualizer isActive={isConnected} isSpeaking={isSpeaking} />

          {/* Interactive Button Overlay */}
          <button
            onClick={isConnected ? stopConversation : startConversation}
            disabled={isConnecting}
            className="absolute inset-0 z-10 rounded-full cursor-pointer bg-transparent hover:bg-foreground/2 transition-colors disabled:cursor-not-allowed outline-none"
            aria-label={isConnected ? "Stop conversation" : "Start conversation"}
          />

          {/* Mic Icon (only when not connected) */}
          {!isConnected && !isConnecting && (
            <div className="absolute z-20 pointer-events-none flex items-center justify-center animate-in fade-in zoom-in duration-700">
              <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-foreground/40 dark:text-foreground/20" strokeWidth={1} />
            </div>
          )}

          {/* Stop Icon (when connected) - Visible on hover */}
          {isConnected && (
            <div className="absolute z-20 pointer-events-none flex items-center justify-center group">
              <Square className="w-6 h-6 text-foreground/10 fill-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" strokeWidth={1} />
            </div>
          )}

          {/* Loading Spinner */}
          {isConnecting && (
            <div className="absolute w-12 h-12 sm:w-14 sm:h-14 border border-foreground/20 border-t-foreground/60 rounded-full animate-spin z-20" />
          )}
        </div>

        {/* Status Text - Ultra Minimal */}
        <div className="text-center h-8">
          <p className="text-sm font-light tracking-[0.2em] text-foreground/60 dark:text-foreground/40 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 uppercase">
            {isConnecting && "Initializing..."}
            {isConnected && (isSpeaking ? "AI Speaking" : "Listening")}
            {!isConnected && !isConnecting && (session ? "Tap to talk to your friend" : "Log in to save memories")}
          </p>
        </div>
      </div>
    </div>
  );
}

