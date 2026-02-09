"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export type Persona = "professional" | "friendly" | "funny";

interface PersonaSelectorProps {
  selected: Persona;
  onSelect: (persona: Persona) => void;
  disabled?: boolean;
}

const PERSONAS = [
  { id: "professional", label: "Professional", icon: "💼" },
  { id: "friendly", label: "Friendly", icon: "🤝" },
  { id: "funny", label: "Funny", icon: "🎭" },
] as const;

export function PersonaSelector({ selected, onSelect, disabled }: PersonaSelectorProps) {
  const { data: session } = useSession();

  // Load initial persona from session
  useEffect(() => {
    if (session?.user) {
      const userPersona = (session.user as any).selectedPersona;
      if (userPersona && userPersona !== selected) {
        onSelect(userPersona as Persona);
      }
    }
  }, [session, onSelect, selected]);

  const handleSelect = async (personaId: Persona) => {
    onSelect(personaId);
    
    if (session?.user) {
      try {
        await fetch("/api/user/persona", {
          method: "POST",
          body: JSON.stringify({ persona: personaId }),
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Failed to save persona:", err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-foreground/20">
        Select Personality
      </span>
      <div className="flex bg-foreground/[0.03] dark:bg-foreground/[0.03] backdrop-blur-xl border border-foreground/[0.05] p-1.5 rounded-2xl shadow-inner-white">
        {PERSONAS.map((persona) => (
          <button
            key={persona.id}
            onClick={() => handleSelect(persona.id as Persona)}
            disabled={disabled}
            className={`
              relative flex items-center gap-3 px-6 py-2.5 rounded-[14px] text-sm font-medium tracking-tight transition-all duration-500 group
              ${selected === persona.id 
                ? "bg-white dark:bg-white/10 text-foreground shadow-lg shadow-purple-500/5 ring-1 ring-black/5 dark:ring-white/10" 
                : "text-foreground/40 hover:text-foreground/70"
              }
              ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <span className={`text-base transition-transform duration-500 group-hover:scale-110 ${selected === persona.id ? "grayscale-0" : "grayscale opacity-50"}`}>
              {persona.icon}
            </span>
            <span className="hidden sm:inline">{persona.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

