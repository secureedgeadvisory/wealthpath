"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SkipConsequence } from "@/lib/consequence-engine";
import { formatDate } from "@/lib/consequence-engine";

interface ConsequenceToastProps {
  consequence: SkipConsequence;
  onDismiss: () => void;
}

export function ConsequenceToast({ consequence, onDismiss }: ConsequenceToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-[420px] z-50"
    >
      <div className="rounded-xl border border-red-500/20 bg-card shadow-2xl shadow-red-500/5 overflow-hidden">
        {/* Red accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />

        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed">
                Skipping today&apos;s{" "}
                <span className="font-semibold text-foreground">
                  ${consequence.amount_skipped.toFixed(2)}
                </span>{" "}
                means{" "}
                <span className="font-semibold text-red-400">
                  ${consequence.missed_future_value.toFixed(2)}
                </span>{" "}
                in lost future growth. Your arrival moved from{" "}
                <span className="font-medium text-foreground">
                  {formatDate(consequence.old_eta)}
                </span>{" "}
                to{" "}
                <span className="font-medium text-red-400">
                  {formatDate(consequence.new_eta)}
                </span>{" "}
                — that&apos;s{" "}
                <span className="font-semibold text-red-400">
                  {consequence.days_added} more day{consequence.days_added !== 1 ? "s" : ""}
                </span>
                .
              </p>

              {/* Encouragement */}
              <div className="flex items-center gap-1.5 mt-2.5">
                <Heart className="w-3 h-3 text-emerald-400" />
                <p className="text-xs text-emerald-400 font-medium">
                  Tomorrow is a fresh start.
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="shrink-0 w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
