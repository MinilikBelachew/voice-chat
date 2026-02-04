"use client";

import { useConversation } from "@elevenlabs/react";
import { useCallback, useState } from "react";
import { Mic, Square } from "lucide-react";
import { OrbVisualizer } from "./OrbVisualizer";
import { Transcript, Message } from "./Transcript";
import { PersonaSelector, Persona } from "./PersonaSelector";
import { LanguageSelector, LanguageCode } from "./LanguageSelector";

const PERSONA_PROMPTS = {
  professional: "You are a highly professional, efficient, and direct AI assistant. Provide concise and accurate information.",
  friendly: "You are a warm, helpful, and friendly AI companion. Use a casual and supportive tone.",
  funny: "You are a witty, playful AI with a great sense of humor. Feel free to use jokes and lighthearted banter.",
};

export function Conversation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [persona, setPersona] = useState<Persona>("professional");
  const [language, setLanguage] = useState<LanguageCode>("en");

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => {
      console.log("Disconnected");
    },
    onMessage: (message) => {
      console.log("Message:", message);
      if (message.message) {
        setMessages((prev) => {
          // If the last message is the same role and same content, ignore (simple debounce)
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            if (last.role === (message.source === "user" ? "user" : "ai") && last.text === message.message) {
              return prev;
            }
          }
          return [
            ...prev,
            {
              role: message.source === "user" ? "user" : "ai",
              text: message.message,
              id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
            },
          ];
        });
      }
    },
    onError: (error) => console.error("Error:", error),
  });

  const { status, isSpeaking } = conversation;

  const startConversation = useCallback(async () => {
    try {
      console.log("🔵 Starting conversation...", { status, persona, language });
      
      // Clear messages before starting
      setMessages([]);
      
      const response = await fetch("/api/get-signed-url");
      const { signedUrl } = await response.json();

      if (!signedUrl) {
        throw new Error("Failed to get signed URL");
      }

      console.log("🔵 Got signed URL, starting session...");

      // Keep minimal config - overrides cause disconnection
      await conversation.startSession({ 
        signedUrl,
      });
      
      console.log("✅ Session started successfully");
    } catch (error) {
      console.error("❌ Failed to start conversation:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
    }
  }, [conversation, persona, language, status]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  return (
    <div className="flex flex-col items-center w-full max-w-lg">
      {/* Selection Section - Only show when not connected */}
      <div className={`flex flex-col items-center gap-2 transition-all duration-700 ${isConnected ? 'opacity-0 -translate-y-4 pointer-events-none absolute' : 'opacity-100 translate-y-0'}`}>
        <PersonaSelector 
          selected={persona} 
          onSelect={setPersona} 
          disabled={isConnecting}
        />
        <LanguageSelector
          selected={language}
          onSelect={setLanguage}
          disabled={isConnecting}
        />
      </div>

      {/* Orb Section */}
      <div className={`flex flex-col items-center gap-6 transition-all duration-700 ${isConnected ? 'mt-0' : 'mt-4'}`}>
        {/* Orb Container */}
        <div className="relative flex items-center justify-center transform hover:scale-[1.02] transition-transform duration-500">
          {/* Canvas Orb */}
          <OrbVisualizer isActive={isConnected} isSpeaking={isSpeaking} />

          {/* Interactive Button Overlay */}
          <button
            onClick={isConnected ? stopConversation : startConversation}
            disabled={isConnecting}
            className="absolute inset-0 z-10 rounded-full cursor-pointer bg-transparent hover:bg-foreground/[0.02] transition-colors disabled:cursor-not-allowed outline-none"
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
            <div className="absolute w-12 h-12 sm:w-14 sm:h-14 border-[1px] border-foreground/20 border-t-foreground/60 rounded-full animate-spin z-20" />
          )}
        </div>

        {/* Status Text */}
        <div className="text-center h-8">
          <p className="text-sm font-light tracking-[0.1em] text-foreground/70 dark:text-foreground/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2">
            {isConnecting && "Initializing sequence..."}
            {isConnected && (isSpeaking ? "AI is speaking" : "I'm listening")}
            {!isConnected && !isConnecting && "Tap the orb to begin"}
          </p>
        </div>
      </div>

      {/* Transcript Section */}
      <Transcript messages={messages} />
    </div>
  );
}
