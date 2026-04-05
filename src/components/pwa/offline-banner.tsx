"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showSynced, setShowSynced] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowSynced(true);
      setTimeout(() => setShowSynced(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowSynced(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-muted border-b border-border"
        >
          <div className="flex items-center justify-center gap-2 py-1.5 px-4">
            <WifiOff className="w-3 h-3 text-muted-foreground" />
            <p className="text-[11px] text-muted-foreground">
              You&apos;re offline — changes will sync when connected
            </p>
          </div>
        </motion.div>
      )}
      {showSynced && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-emerald-500/10 border-b border-emerald-500/20"
        >
          <div className="flex items-center justify-center gap-2 py-1.5 px-4">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <p className="text-[11px] text-emerald-400 font-medium">
              Back online — synced!
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
