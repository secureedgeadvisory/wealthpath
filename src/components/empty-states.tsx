"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Flag,
  Shield,
  Map,
  Sparkles,
  Lock,
  Flame,
} from "lucide-react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
  extra?: React.ReactNode;
}

function EmptyState({ icon, title, description, action, extra }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>
      {extra && <div className="mt-3">{extra}</div>}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <Link href={action.href}>
              <Button size="sm" variant="outline">{action.label}</Button>
            </Link>
          ) : (
            <Button size="sm" variant="outline" onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}

export function NoTasksToday() {
  return (
    <EmptyState
      icon={<Calendar className="w-7 h-7 text-muted-foreground" />}
      title="No tasks for today"
      description="Enjoy your rest — the journey continues tomorrow."
      action={{ label: "View task history", href: "/tasks" }}
    />
  );
}

export function NoMilestonesReached({ nextValue, amountAway }: { nextValue: string; amountAway: string }) {
  return (
    <EmptyState
      icon={<Flag className="w-7 h-7 text-muted-foreground" />}
      title={`Next milestone: ${nextValue}`}
      description={`You're ${amountAway} away. Every day gets you closer. Keep going!`}
    />
  );
}

export function NoSkipHistory({ streak }: { streak: number }) {
  return (
    <EmptyState
      icon={<Shield className="w-7 h-7 text-emerald-400" />}
      title="Clean record!"
      description="No skipped tasks yet. Keep the streak alive!"
      extra={
        streak > 0 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium">
            <Flame className="w-3.5 h-3.5" />
            {streak} day streak
          </div>
        ) : null
      }
    />
  );
}

export function NoJourneyStarted() {
  return (
    <EmptyState
      icon={<Map className="w-7 h-7 text-muted-foreground" />}
      title="Your journey hasn't started yet"
      description="Set your wealth goal and choose your path to begin."
      action={{ label: "Start onboarding", href: "/onboarding" }}
    />
  );
}

export function NoBriefingsYet() {
  return (
    <EmptyState
      icon={<Sparkles className="w-7 h-7 text-wealth-gold" />}
      title="Your AI co-pilot is ready"
      description="Upgrade to Pro to unlock daily personalized insights tailored to your journey."
      action={{ label: "Upgrade to Pro — $7.99/mo", href: "/settings" }}
    />
  );
}

export function WhatIfLocked() {
  return (
    <EmptyState
      icon={<Lock className="w-7 h-7 text-muted-foreground" />}
      title="What if you could see the future?"
      description="Small changes create massive results. Unlock scenario modeling with Pro."
      action={{ label: "Unlock with Pro", href: "/settings" }}
    />
  );
}
