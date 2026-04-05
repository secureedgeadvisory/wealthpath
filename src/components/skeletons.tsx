"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JourneyMapSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="h-[160px] relative overflow-hidden rounded-xl bg-muted">
        {/* Fake winding path */}
        <svg viewBox="0 0 960 160" className="w-full h-full opacity-20">
          <path
            d="M 40 80 C 120 30, 200 30, 260 70 C 320 110, 400 110, 460 70 C 520 30, 600 40, 660 80 C 720 120, 780 110, 870 60"
            fill="none"
            stroke="currentColor"
            strokeWidth={14}
            strokeLinecap="round"
            className="text-muted-foreground/20"
          />
        </svg>
        <div className="absolute inset-0 shimmer" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border">
      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-2.5 w-1/4" />
      </div>
      <Skeleton className="w-7 h-7 rounded-full shrink-0" />
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 space-y-2">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-2 w-12" />
      </CardContent>
    </Card>
  );
}

export function BriefingCardSkeleton() {
  return (
    <Card className="border-primary/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5" />
      <CardContent className="pt-5 pb-4 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-3.5 w-20" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Greeting */}
      <div className="space-y-1">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-32" />
      </div>
      {/* Journey map */}
      <JourneyMapSkeleton />
      {/* Tasks */}
      <Card>
        <CardContent className="pt-5 pb-4 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
          <TaskCardSkeleton />
        </CardContent>
      </Card>
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      {/* Briefing */}
      <BriefingCardSkeleton />
    </div>
  );
}
