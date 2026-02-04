import { Conversation } from "@/components/Conversation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background text-foreground transition-colors duration-700">
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Decorative Gradients for Elegance */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Right Corner Glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-500/5 blur-[100px] rounded-full" />
        
        {/* Main Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.08)_0%,_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_rgba(88,28,135,0.2)_0%,_transparent_70%)]" />
        
        {/* Twinkly Stars - Subtle Background Texture */}
        <div className="absolute inset-0 opacity-10 dark:opacity-30">
          <div className="stars" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-12 w-full flex flex-col items-center max-w-2xl mx-auto">
        {/* Header - Simple & Clean */}
        <div className="mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-sm font-medium tracking-[0.2em] uppercase text-foreground/80 dark:text-foreground/40 mb-3">
            Conversational AI
          </h1>
          <div className="h-[1px] w-8 bg-foreground/30 dark:bg-foreground/10 mx-auto" />
        </div>

        <Conversation />
        
        {/* Footer */}
        <div className="mt-20 flex flex-col items-center gap-4 opacity-70 dark:opacity-30 hover:opacity-100 transition-opacity duration-500">
          <div className="h-[1px] w-12 bg-foreground/30 dark:bg-foreground/10" />
          <p className="text-[10px] tracking-[0.15em] uppercase font-light text-center">
            Refined Voice Mode
          </p>
        </div>
      </div>
    </main>
  );
}
