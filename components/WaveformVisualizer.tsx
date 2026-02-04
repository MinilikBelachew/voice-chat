"use client";

import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  isSpeaking: boolean;
  audioStream?: MediaStream;
}

export function WaveformVisualizer({ isSpeaking }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const barCount = 50;
    const barWidth = width / barCount;

    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth;
        
        // Create wave effect
        const baseHeight = isSpeaking ? 40 : 8;
        const waveHeight = isSpeaking 
          ? Math.sin((i * 0.2) + phase) * 30 + baseHeight
          : baseHeight;
        
        const barHeight = Math.max(4, waveHeight);
        const y = (height - barHeight) / 2;

        // Gradient
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, isSpeaking ? "#3b82f6" : "#6366f1");
        gradient.addColorStop(0.5, isSpeaking ? "#8b5cf6" : "#8b5cf6");
        gradient.addColorStop(1, isSpeaking ? "#ec4899" : "#a855f7");

        ctx.fillStyle = gradient;
        ctx.globalAlpha = isSpeaking ? 1 : 0.3;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      }

      phase += isSpeaking ? 0.1 : 0.02;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={80}
      className="w-full h-full"
      style={{ maxWidth: "600px" }}
    />
  );
}
