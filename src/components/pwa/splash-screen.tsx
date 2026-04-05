"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";

export function SplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show splash on PWA standalone mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const hasShown = sessionStorage.getItem("wp-splash-shown");

    if (isStandalone && !hasShown) {
      setShow(true);
      sessionStorage.setItem("wp-splash-shown", "1");
      setTimeout(() => setShow(false), 1500);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0D1117]"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-20 h-20 rounded-2xl gradient-wealth flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold text-white mt-6"
          >
            WealthPath
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-400 mt-2"
          >
            Your journey to millions
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
