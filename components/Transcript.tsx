"use client";

import { useEffect, useRef, useState } from "react";

export interface Message {
  role: "user" | "ai";
  text: string;
  id: string;
}

interface TranscriptProps {
  messages: Message[];
}

function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 20); // Adjust speed for a natural typing feel
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, onComplete]);

  return <>{displayedText}</>;
}

export function Transcript({ messages }: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="w-full max-w-lg mt-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Decorative Label */}
      <div className="flex items-center gap-3 mb-6 px-4">
        <div className="h-[1px] flex-1 bg-foreground/5 dark:bg-foreground/5" />
        <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-foreground/30">
          History
        </span>
        <div className="h-[1px] flex-1 bg-foreground/5 dark:bg-foreground/5" />
      </div>

      <div 
        ref={scrollRef}
        className="h-[400px] overflow-y-auto px-6 py-10 space-y-16 scroll-smooth scrollbar-hide"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 80px, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 80px, black 80%, transparent)'
        }}
      >
        {messages.map((message, idx) => {
          const isLatest = idx === messages.length - 1;
          
          return (
            <div
              key={message.id}
              className={`flex flex-col w-full ${
                message.role === "user" ? "items-end" : "items-start"
              } animate-in fade-in slide-in-from-bottom-6 duration-700`}
            >
              {/* Role Indicator with Dot */}
              <div className={`flex items-center gap-4 mb-6 ${message.role === "user" ? "flex-row-reverse" : "flex-row-reverse"}`}>
                <span className="text-[13px] uppercase tracking-[0.25em] text-foreground/20 font-black">
                  {message.role === "user" ? "YOU" : "AI"}
                </span>
                <div className={`w-2.5 h-2.5 rounded-full ${message.role === 'user' ? 'bg-foreground/10' : 'bg-purple-500/30'}`} />
              </div>

              {/* Message Bubble/Card - EXTREME Padding */}
              <div
                className={`max-w-[100%] sm:max-w-[90%] rounded-[40px] px-14 py-10 text-[18px] leading-[1.8] transition-all duration-300 shadow-xl border ${
                  message.role === "user"
                    ? "bg-foreground/[0.03] dark:bg-foreground/[0.04] text-foreground/80 rounded-tr-none border-foreground/[0.05]"
                    : "bg-purple-500/[0.04] dark:bg-purple-500/[0.07] text-foreground/95 rounded-tl-none border-purple-500/10"
                }`}
              >
                {isLatest && message.role === "ai" ? (
                  <TypewriterText text={message.text} />
                ) : (
                  message.text
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
