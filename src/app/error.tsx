"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, RefreshCw, Mail } from "lucide-react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("[WealthPath Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Don&apos;t worry — your journey data is safe. This is a temporary issue.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={reset} className="gradient-wealth text-white">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <a href="mailto:support@wealthpath.app" className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Mail className="w-3 h-3" />
            Report issue
          </a>
        </div>
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="w-6 h-6 rounded-md gradient-wealth flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs text-muted-foreground">WealthPath</span>
        </div>
      </div>
    </div>
  );
}
