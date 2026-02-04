"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface OrbVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
}

export function OrbVisualizer({ isActive, isSpeaking }: OrbVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const timeRef = useRef(0);
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    
    // Choose colors based on theme
    const isDark = resolvedTheme === 'dark';

    const draw = () => {
      timeRef.current += isActive ? 0.02 : 0.005;
      const t = timeRef.current;

      ctx.clearRect(0, 0, size, size);

      // Base glow
      const glowRadius = isActive ? 120 : 80;
      const glowGradient = ctx.createRadialGradient(center, center, 0, center, center, glowRadius);
      
      if (isDark) {
        glowGradient.addColorStop(0, isActive ? "rgba(168, 85, 247, 0.8)" : "rgba(168, 85, 247, 0.3)");
        glowGradient.addColorStop(0.3, isActive ? "rgba(217, 70, 239, 0.5)" : "rgba(147, 51, 234, 0.2)");
        glowGradient.addColorStop(0.6, isActive ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.1)");
      } else {
        // Lighter, more elegant colors for Light Mode
        glowGradient.addColorStop(0, isActive ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.15)");
        glowGradient.addColorStop(0.4, isActive ? "rgba(192, 132, 252, 0.2)" : "rgba(192, 132, 252, 0.05)");
        glowGradient.addColorStop(0.8, "rgba(243, 232, 255, 0)");
      }
      glowGradient.addColorStop(1, "transparent");

      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, size, size);

      // Swirling rings
      const ringCount = 5;
      for (let i = 0; i < ringCount; i++) {
        const ringRadius = 40 + i * 18;
        const rotationSpeed = (i % 2 === 0 ? 1 : -1) * (0.5 + i * 0.2);
        const rotation = t * rotationSpeed;
        const tilt = 0.3 + i * 0.15;

        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(rotation);
        ctx.scale(1, tilt);

        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        
        if (isDark) {
          ctx.strokeStyle = i % 2 === 0 
            ? `rgba(251, 191, 36, ${isActive ? 0.7 - i * 0.1 : 0.3})` 
            : `rgba(217, 70, 239, ${isActive ? 0.8 - i * 0.1 : 0.3})`;
          ctx.shadowColor = i % 2 === 0 ? "#fbbf24" : "#d946ef";
        } else {
          ctx.strokeStyle = i % 2 === 0 
            ? `rgba(217, 119, 6, ${isActive ? 0.6 : 0.3})` 
            : `rgba(147, 51, 234, ${isActive ? 0.7 : 0.35})`;
          ctx.shadowColor = i % 2 === 0 ? "#f59e0b" : "#a855f7";
        }
        
        ctx.lineWidth = isActive ? 2.5 - i * 0.3 : 1.5;
        ctx.shadowBlur = isActive ? 15 : 5;
        ctx.stroke();

        ctx.restore();
      }

      // Inner core glow
      const coreGradient = ctx.createRadialGradient(center, center, 0, center, center, 45);
      if (isDark) {
        coreGradient.addColorStop(0, isActive ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.5)");
        coreGradient.addColorStop(0.2, isActive ? "rgba(233, 213, 255, 0.9)" : "rgba(216, 180, 254, 0.4)");
        coreGradient.addColorStop(0.5, isActive ? "rgba(192, 132, 252, 0.7)" : "rgba(168, 85, 247, 0.3)");
      } else {
        coreGradient.addColorStop(0, isActive ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.8)");
        coreGradient.addColorStop(0.3, isActive ? "rgba(192, 132, 252, 0.6)" : "rgba(192, 132, 252, 0.3)");
        coreGradient.addColorStop(0.7, isActive ? "rgba(147, 51, 234, 0.3)" : "rgba(147, 51, 234, 0.1)");
      }
      coreGradient.addColorStop(1, "transparent");

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(center, center, 45, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing effect when speaking
      if (isSpeaking) {
        const pulseSize = 60 + Math.sin(t * 5) * 15;
        const pulseGradient = ctx.createRadialGradient(center, center, 0, center, center, pulseSize);
        pulseGradient.addColorStop(0, isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(168, 85, 247, 0.2)");
        pulseGradient.addColorStop(0.5, isDark ? "rgba(217, 70, 239, 0.3)" : "rgba(217, 70, 239, 0.1)");
        pulseGradient.addColorStop(1, "transparent");

        ctx.fillStyle = pulseGradient;
        ctx.beginPath();
        ctx.arc(center, center, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Energy particles
      if (isActive) {
        for (let i = 0; i < 8; i++) {
          const angle = (t * 2 + i * Math.PI / 4) % (Math.PI * 2);
          const radius = 70 + Math.sin(t * 3 + i) * 20;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius * 0.5;
          
          ctx.beginPath();
          ctx.arc(x, y, isDark ? 3 : 2, 0, Math.PI * 2);
          ctx.fillStyle = isDark 
            ? `rgba(255, 255, 255, ${0.5 + Math.sin(t + i) * 0.3})`
            : `rgba(107, 33, 168, ${0.4 + Math.sin(t + i) * 0.2})`;
          ctx.shadowColor = isDark ? "#d946ef" : "#7e22ce";
          ctx.shadowBlur = isDark ? 10 : 5;
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, isSpeaking, resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="w-56 h-56 sm:w-72 sm:h-72"
      style={{ maxWidth: "300px", maxHeight: "300px" }}
    />
  );
}
