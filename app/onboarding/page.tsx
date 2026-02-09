"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sparkles, User, MessageSquare, Heart, Loader2, ArrowRight, Volume2, Play, Pause } from "lucide-react";

interface Voice {
  id: string;
  name: string;
  previewUrl: string;
  description: string;
}

// Voices will be fetched dynamically from /api/voices

export default function Onboarding() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [voices, setVoices] = useState<any[]>([]);
  const [voicesLoading, setVoicesLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    aiName: "",
    aiBehavior: "",
    voiceId: "", // Start empty
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch voices on mount
    fetch("/api/voices")
      .then(res => res.json())
      .then(data => {
        setVoices(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, voiceId: data[0].id }));
        }
        setVoicesLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch voices:", err);
        setVoicesLoading(false);
      });
  }, []);

  const handlePreview = (previewUrl: string, voiceId: string) => {
    if (playingVoice === voiceId) {
      audioRef.current?.pause();
      setPlayingVoice(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = previewUrl;
        audioRef.current.play();
        setPlayingVoice(voiceId);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      await update(); // Refresh session data
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-background text-foreground overflow-hidden">
      <audio 
        ref={audioRef} 
        onEnded={() => setPlayingVoice(null)}
        className="hidden"
      />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse decoration-2" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Progress Bar */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s <= step ? "w-8 bg-purple-500" : "w-4 bg-foreground/10"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: User Name */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 mb-2">
                  <User className="w-6 h-6 text-purple-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">What's your name?</h1>
                <p className="text-foreground/40">I want to know what to call you.</p>
              </div>
              
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your Name"
                  className="w-full bg-foreground/2 border border-foreground/10 focus:border-purple-500/50 rounded-2xl py-4 px-6 outline-none transition-all text-lg text-center font-medium"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={() => formData.name && setStep(2)}
                disabled={!formData.name}
                className="w-full bg-foreground text-background py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-purple-500/5"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: AI Name */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 mb-2">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Name your friend</h1>
                <p className="text-foreground/40">Give your AI companion a name.</p>
              </div>
              
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={formData.aiName}
                  onChange={(e) => setFormData({ ...formData, aiName: e.target.value })}
                  placeholder="AI Name (e.g. Luna, Sam, Max)"
                  className="w-full bg-foreground/2 border border-foreground/10 focus:border-blue-500/50 rounded-2xl py-4 px-6 outline-none transition-all text-lg text-center font-medium"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-foreground/5 text-foreground py-4 rounded-2xl font-bold text-base hover:bg-foreground/10 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => formData.aiName && setStep(3)}
                  disabled={!formData.aiName}
                  className="flex-2 bg-foreground text-background py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Behavior Description */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 mb-2">
                  <Heart className="w-6 h-6 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Define their vibe</h1>
                <p className="text-foreground/40">Describe how they should act as your best friend.</p>
              </div>
              
              <div className="relative group">
                <textarea
                  required
                  value={formData.aiBehavior}
                  onChange={(e) => setFormData({ ...formData, aiBehavior: e.target.value })}
                  placeholder="e.g. A sarcastic gamer who makes puns, or a calm grounded therapist who listens more than talks."
                  rows={4}
                  className="w-full bg-foreground/2 border border-foreground/10 focus:border-emerald-500/50 rounded-2xl py-4 px-6 outline-none transition-all text-base leading-relaxed resize-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-foreground/5 text-foreground py-4 rounded-2xl font-bold text-base hover:bg-foreground/10 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => formData.aiBehavior && setStep(4)}
                  disabled={!formData.aiBehavior}
                  className="flex-2 bg-foreground text-background py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Voice Selection */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 mb-2">
                  <Volume2 className="w-6 h-6 text-orange-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Choose their voice</h1>
                <p className="text-foreground/40">Select a voice that matches their personality.</p>
              </div>

              {voicesLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <p className="text-sm text-foreground/40">Fetching voices from ElevenLabs...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {voices.map((voice: Voice) => (
                    <div 
                      key={voice.id}
                      onClick={() => setFormData({ ...formData, voiceId: voice.id })}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer group ${
                        formData.voiceId === voice.id 
                          ? "bg-foreground/5 border-orange-500/50 ring-1 ring-orange-500/50" 
                          : "bg-foreground/2 border-foreground/10 hover:border-foreground/20"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-base truncate pr-8">{voice.name}</h3>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(voice.previewUrl, voice.id);
                          }}
                          className={`p-2 rounded-full transition-all ${
                            playingVoice === voice.id 
                              ? "bg-orange-500 text-white" 
                              : "bg-foreground/10 hover:bg-foreground/20 text-foreground"
                          }`}
                        >
                          {playingVoice === voice.id ? (
                            <Pause className="w-3 h-3 fill-current" />
                          ) : (
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-foreground/40 capitalize">{voice.description}</p>
                      
                      {formData.voiceId === voice.id && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-foreground/5 text-foreground py-4 rounded-2xl font-bold text-base hover:bg-foreground/10 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || voicesLoading}
                  className="flex-2 bg-foreground text-background py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-xl"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Finish Setup <Sparkles className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
