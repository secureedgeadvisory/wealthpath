"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, X, Share, TrendingUp } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Track visit count
    const visits = parseInt(localStorage.getItem("wp-visits") || "0") + 1;
    localStorage.setItem("wp-visits", String(visits));

    // Check dismissals
    const dismissals = parseInt(localStorage.getItem("wp-install-dismissed") || "0");
    if (dismissals >= 3) return;

    // Show after 3rd visit
    if (visits >= 3) {
      if (ios) {
        setShow(true);
      }
    }

    // Listen for install prompt (Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (visits >= 3 && dismissals < 3) {
        setShow(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
    setShow(false);
  };

  const handleDismiss = () => {
    const dismissals = parseInt(localStorage.getItem("wp-install-dismissed") || "0") + 1;
    localStorage.setItem("wp-install-dismissed", String(dismissals));
    setShow(false);
  };

  if (isInstalled) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-[360px] z-50"
        >
          <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl gradient-wealth flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold">Add WealthPath to Home Screen</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isIOS
                      ? "Tap the share button, then \"Add to Home Screen\""
                      : "Install for the best experience — instant access, offline support"}
                  </p>
                </div>
                <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isIOS ? (
                <div className="flex items-center gap-2 mt-3 p-2.5 rounded-lg bg-muted">
                  <Share className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
                  </p>
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleInstall} className="flex-1 gradient-wealth text-white h-10">
                    <Download className="w-4 h-4 mr-1.5" />
                    Install
                  </Button>
                  <Button variant="ghost" onClick={handleDismiss} className="text-xs text-muted-foreground">
                    Not now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
