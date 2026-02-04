"use client";

import { motion } from "framer-motion";

export function Visualizer({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 h-20">
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-full"
          initial={{ height: 8 }}
          animate={{
            height: isSpeaking ? [8, 40, 8] : 8,
            opacity: isSpeaking ? 1 : 0.3,
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.08,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
