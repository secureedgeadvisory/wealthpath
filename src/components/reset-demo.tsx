"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export function ResetDemoButton() {
  const router = useRouter();

  const handleReset = () => {
    // Clear any localStorage state
    localStorage.removeItem("wp-visits");
    localStorage.removeItem("wp-install-dismissed");
    sessionStorage.removeItem("wp-splash-shown");
    // Navigate to onboarding
    router.push("/onboarding");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleReset}
      className="text-muted-foreground hover:text-foreground gap-1.5"
    >
      <RotateCcw className="w-3.5 h-3.5" />
      <span className="text-xs">Reset Demo</span>
    </Button>
  );
}
