"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, TrendingDown } from "lucide-react";
import type { SkipRecord } from "@/lib/consequence-engine";

interface SkipHistoryProps {
  open: boolean;
  onClose: () => void;
  records: SkipRecord[];
}

export function SkipHistory({ open, onClose, records }: SkipHistoryProps) {
  const totalMissedValue = records.reduce((sum, r) => sum + r.missed_future_value, 0);
  const totalDaysAdded = records.reduce((sum, r) => sum + r.days_added, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Skip History
          </DialogTitle>
        </DialogHeader>

        {/* Summary */}
        {records.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 text-center">
              <p className="text-[10px] text-red-500 dark:text-red-400/70 uppercase tracking-wide font-medium">
                Lost future value
              </p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">
                ${totalMissedValue.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 text-center">
              <p className="text-[10px] text-amber-600 dark:text-amber-400/70 uppercase tracking-wide font-medium">
                Total days added
              </p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                +{totalDaysAdded} days
              </p>
            </div>
          </div>
        )}

        {/* Records */}
        {records.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No skipped tasks yet. Keep the streak going!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((record) => (
              <div
                key={record.task_id}
                className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{record.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-red-300 dark:border-red-500/20 text-red-600 dark:text-red-400">
                      -${record.amount.toFixed(2)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                    -${record.missed_future_value.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                    +{record.days_added}d
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cumulative impact summary */}
        {records.length > 0 && (
          <div className="mt-3 p-3 rounded-xl border-l-4 border-l-red-500 bg-[#FFF5F5] dark:bg-red-950/30 border border-red-200 dark:border-red-500/15">
            <p className="text-xs text-center font-medium">
              <span className="text-red-700 dark:text-red-400">Total impact:</span>{" "}
              <span className="text-amber-700 dark:text-amber-400 font-bold">{totalDaysAdded} days</span>{" "}
              <span className="text-gray-600 dark:text-muted-foreground">added to your journey.</span>{" "}
              <span className="text-red-700 dark:text-red-400 font-bold">${totalMissedValue.toFixed(2)}</span>{" "}
              <span className="text-gray-600 dark:text-muted-foreground">in lost future growth.</span>
            </p>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Every day is a chance to get back on track. Your past skips don&apos;t define your journey.
        </p>
      </DialogContent>
    </Dialog>
  );
}
