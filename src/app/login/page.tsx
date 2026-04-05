"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, Loader2, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

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
            <h1 className="text-xl font-bold">
              {sent ? "Check your email" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {sent
                ? "We sent a magic link to your inbox"
                : "Sign in with your email to continue your journey"}
            </p>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click the link in your email to sign in.
                    <br />
                    Check your spam folder if you don&apos;t see it.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="text-xs"
                >
                  Use a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 gradient-wealth text-white"
                  disabled={loading || !email.trim()}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Send magic link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          No password needed. We&apos;ll email you a secure sign-in link.
        </p>
      </div>
    </div>
  );
}
