import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Map, ArrowLeft, TrendingUp } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
          <Map className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-lg font-semibold mt-2">This page doesn&apos;t exist</p>
          <p className="text-sm text-muted-foreground mt-1">
            Looks like you wandered off the path. Let&apos;s get you back on track.
          </p>
        </div>
        <Link href="/dashboard">
          <Button className="gradient-wealth text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to dashboard
          </Button>
        </Link>
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
