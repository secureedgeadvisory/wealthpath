"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-wealth flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">WealthPath</span>
        </Link>

        <Card className="border-border bg-card">
          <CardHeader className="text-center pb-2">
            <h1 className="text-xl font-bold">Welcome to WealthPath</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Experience the full app with a demo account
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard">
              <Button className="w-full h-12 gradient-wealth text-white text-base">
                <Sparkles className="w-4 h-4 mr-2" />
                Try Demo Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>

            <p className="text-xs text-center text-muted-foreground">
              No sign-up needed. Explore with 30 days of sample data.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {["Journey Map", "Daily Tasks", "AI Insights"].map((feature) => (
                <div key={feature} className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">{feature}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-[10px] text-center text-muted-foreground">
          WealthPath is a financial education tool. Not financial advice.
        </p>
      </div>
    </div>
  );
}
