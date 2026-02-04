"use client";

import { useConversation } from "@elevenlabs/react";
import { useCallback } from "react";
import { Mic, Square } from "lucide-react";
import { OrbVisualizer } from "./OrbVisualizer";

export function Conversation() {
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => console.error("Error:", error),
  });

  const { status, isSpeaking } = conversation;

  const startConversation = useCallback(async () => {
    try {
      const response = await fetch("/api/get-signed-url");
      const { signedUrl } = await response.json();

      if (!signedUrl) {
        throw new Error("Failed to get signed URL");
      }

      await conversation.startSession({ signedUrl });
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

        {/* Status Text - Ultra Minimal */}
        <div className="text-center h-8">
          <p className="text-sm font-light tracking-[0.2em] text-foreground/60 dark:text-foreground/40 transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 uppercase">
            {isConnecting && "Initializing..."}
            {isConnected && (isSpeaking ? "AI Speaking" : "Listening")}
            {!isConnected && !isConnecting && "Tap to start"}
          </p>
        </div>
      </div>
    </div>
  );
}
