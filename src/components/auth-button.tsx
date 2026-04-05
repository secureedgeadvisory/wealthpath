"use client";

import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="text-muted-foreground hover:text-foreground"
    >
      <LogOut className="w-4 h-4 mr-1.5" />
      Sign out
    </Button>
  );
}
