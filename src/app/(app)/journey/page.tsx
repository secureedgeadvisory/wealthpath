"use client";

import { JourneyMap } from "@/components/journey-map";
import { MOCK_GOAL, MOCK_MILESTONES, MOCK_LATEST_SNAPSHOT, MOCK_STREAK } from "@/lib/mock-data";
import { Map } from "lucide-react";

export default function JourneyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-wealth flex items-center justify-center">
          <Map className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Journey</h1>
          <p className="text-sm text-muted-foreground">
            ${MOCK_GOAL.target_amount.toLocaleString()} goal &middot; {MOCK_GOAL.risk_profile} path
          </p>
        </div>
      </div>

      <JourneyMap
        goal={MOCK_GOAL}
        snapshot={MOCK_LATEST_SNAPSHOT}
        milestones={MOCK_MILESTONES}
        streak={MOCK_STREAK.current_streak}
        variant="full"
      />
    </div>
  );
}
