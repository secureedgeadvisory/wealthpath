"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Flame, X } from "lucide-react";

const STREAK_MESSAGES: Record<number, { title: string; message: string }> = {
  7: { title: "One Week Strong!", message: "Habits are forming. Your brain is rewiring for wealth." },
  14: { title: "Two Weeks!", message: "Most people quit by now. You didn't." },
  30: { title: "A Full Month!", message: "You're in the top 10% of disciplined investors." },
  60: { title: "60 Days!", message: "This isn't luck anymore — it's who you are." },
  100: { title: "Triple Digits!", message: "Your future self is grateful. 100 days of building wealth." },
  200: { title: "200 Days!", message: "Half a year of daily discipline. Extraordinary." },
  365: { title: "ONE YEAR.", message: "Unstoppable. You've done what 99% won't." },
};

export const STREAK_MILESTONES = [7, 14, 30, 60, 100, 200, 365];

interface StreakCelebrationProps {
  streak: number;
  open: boolean;
  onClose: () => void;
}

export function StreakCelebration({ streak, open, onClose }: StreakCelebrationProps) {
  const data = STREAK_MESSAGES[streak];
  if (!data) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-card border border-border rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 p-0 text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Fire animation */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-b from-orange-400 via-red-500 to-yellow-500 flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30">
                <Flame className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* Streak number */}
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
              className="text-5xl font-black text-orange-400"
            >
              {streak}
            </motion.p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">day streak</p>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4"
            >
              <h2 className="text-xl font-bold">{data.title}</h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {data.message}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button onClick={onClose} className="mt-6 gradient-wealth text-white px-6">
                Keep the fire alive
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
