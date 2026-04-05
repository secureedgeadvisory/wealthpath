"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { Flame, Trophy, Target } from "lucide-react";
import type { Milestone, JourneySnapshot, Goal } from "@/types";

// ─── SVG Path Definitions ───

// Horizontal winding road with 5 curves (viewBox: 0 0 960 200)
const H_PATH =
  "M 40 110 C 120 40, 200 40, 260 100 C 320 160, 400 160, 460 100 C 520 40, 600 60, 660 110 C 720 160, 780 150, 830 100 L 870 80";

// Vertical winding road (viewBox: 0 0 260 600)
const V_PATH =
  "M 130 40 C 60 100, 60 140, 130 180 C 200 220, 200 260, 130 300 C 60 340, 60 380, 130 420 C 200 460, 200 500, 130 540 L 130 570";

const PATH_LENGTH_H = 1050; // approximate
const PATH_LENGTH_V = 820;

interface JourneyMapProps {
  goal: Goal;
  snapshot: JourneySnapshot;
  milestones: Milestone[];
  streak: number;
  variant?: "compact" | "full";
}

export function JourneyMap({
  goal,
  snapshot,
  milestones,
  streak,
  variant = "full",
}: JourneyMapProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const progressPct = 100 - snapshot.distance_remaining_pct;

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isVertical = isMobile;
  const pathD = isVertical ? V_PATH : H_PATH;
  const totalLength = isVertical ? PATH_LENGTH_V : PATH_LENGTH_H;
  const viewBox = isVertical ? "0 0 260 600" : "0 0 960 200";
  const svgHeight = variant === "compact" ? (isVertical ? 350 : 160) : isVertical ? 500 : 240;

  // Milestone positions along path (as % of total)
  const milestonePositions = useMemo(() => {
    return milestones.map((ms) => ({
      ...ms,
      pct: (ms.target_value / goal.target_amount) * 100,
    }));
  }, [milestones, goal.target_amount]);

  const etaDate = new Date(snapshot.eta_date);
  const etaLabel = etaDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  const currencySymbol = goal.currency === "USD" ? "$" : goal.currency;

  return (
    <div className="space-y-4">
      {/* ─── SVG Map ─── */}
      <div
        className={`relative rounded-2xl border border-border bg-gradient-to-b from-card via-card to-muted/30 overflow-hidden ${
          variant === "compact" ? "p-3" : "p-5"
        }`}
      >
        {/* Background terrain layers */}
        <div className="absolute inset-0 pointer-events-none">
          {!isVertical && (
            <>
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-950/10 to-transparent" />
              <div className="absolute bottom-0 left-[10%] w-[25%] h-[40%] bg-emerald-900/5 rounded-t-full blur-2xl" />
              <div className="absolute bottom-0 left-[45%] w-[30%] h-[55%] bg-emerald-900/5 rounded-t-full blur-3xl" />
              <div className="absolute bottom-0 right-[10%] w-[20%] h-[35%] bg-emerald-900/5 rounded-t-full blur-2xl" />
            </>
          )}
          {isVertical && (
            <>
              <div className="absolute top-0 bottom-0 right-0 w-1/3 bg-gradient-to-l from-emerald-950/10 to-transparent" />
            </>
          )}
        </div>

        <svg
          viewBox={viewBox}
          className="w-full relative z-10"
          style={{ height: svgHeight }}
          preserveAspectRatio={isVertical ? "xMidYMid meet" : "xMidYMid meet"}
        >
          <defs>
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-strong">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Path gradient */}
            <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(220 15% 25%)" />
              <stop offset="100%" stopColor="hsl(220 15% 30%)" />
            </linearGradient>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(142 60% 35%)" />
              <stop offset="100%" stopColor="hsl(142 60% 50%)" />
            </linearGradient>
          </defs>

          {/* Road shadow */}
          <path
            d={pathD}
            fill="none"
            stroke="hsl(220 15% 15%)"
            strokeWidth={isVertical ? 22 : 18}
            strokeLinecap="round"
            opacity={0.5}
            transform="translate(2,2)"
          />

          {/* Road base (dark) */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#pathGrad)"
            strokeWidth={isVertical ? 20 : 16}
            strokeLinecap="round"
          />

          {/* Road center line (dashed) */}
          <path
            d={pathD}
            fill="none"
            stroke="hsl(220 15% 35%)"
            strokeWidth={1}
            strokeDasharray="8 12"
            strokeLinecap="round"
          />

          {/* Progress glow (underneath) */}
          {mounted && (
            <motion.path
              d={pathD}
              fill="none"
              stroke="hsl(142 60% 40%)"
              strokeWidth={isVertical ? 24 : 20}
              strokeLinecap="round"
              opacity={0.15}
              initial={{ strokeDasharray: `0 ${totalLength}` }}
              animate={{
                strokeDasharray: `${(progressPct / 100) * totalLength} ${totalLength}`,
              }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
              filter="url(#glow)"
            />
          )}

          {/* Progress overlay (green) */}
          {mounted && (
            <motion.path
              d={pathD}
              fill="none"
              stroke="url(#progressGrad)"
              strokeWidth={isVertical ? 6 : 5}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${totalLength}` }}
              animate={{
                strokeDasharray: `${(progressPct / 100) * totalLength} ${totalLength}`,
              }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
            />
          )}

          {/* Milestones */}
          {(() => {
            const firstUnreachedIdx = milestonePositions.findIndex((ms) => ms.reached_at === null);
            return milestonePositions.map((ms, i) => {
              const reached = ms.reached_at !== null;
              const isNext = i === firstUnreachedIdx;
              const offset = ms.pct / 100;
              return (
                <MilestoneMarker
                  key={ms.id}
                  pathD={pathD}
                  offset={offset}
                  reached={reached}
                  isNext={isNext}
                  label={`${currencySymbol}${(ms.target_value / 1000).toFixed(0)}K`}
                  mounted={mounted}
                  delay={1 + i * 0.15}
                  variant={variant}
                />
              );
            });
          })()}

          {/* Start marker */}
          <StartMarker
            isVertical={isVertical}
            value={`${currencySymbol}0`}
            variant={variant}
          />

          {/* Destination marker */}
          <DestinationMarker
            isVertical={isVertical}
            value={`${currencySymbol}${(goal.target_amount / 1000).toFixed(0)}K`}
            variant={variant}
          />

          {/* Traveler */}
          {mounted && (
            <TravelerDot
              pathD={pathD}
              progressPct={progressPct}
              totalLength={totalLength}
              currentValue={snapshot.portfolio_value}
              currencySymbol={currencySymbol}
            />
          )}
        </svg>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Distance covered"
          value={`${progressPct.toFixed(1)}%`}
          sub={`${currencySymbol}${snapshot.portfolio_value.toLocaleString()} saved`}
          color="text-wealth-green"
          progressBar={progressPct}
        />
        <StatCard
          label="ETA"
          value={etaLabel}
          sub={`${Math.ceil(snapshot.distance_remaining_pct)}% remaining`}
          color="text-wealth-blue"
        />
        <StatCard
          label="Streak"
          value={`${streak} days`}
          icon={<Flame className="w-4 h-4 text-orange-400" />}
          sub={streak >= 7 ? "On fire!" : "Keep going!"}
          color="text-orange-400"
        />
      </div>

      {/* ─── Milestone List (full variant only) ─── */}
      {variant === "full" && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground px-1">Milestones</h3>
          <div className="space-y-1.5">
            {milestones.map((ms) => {
              const reached = ms.reached_at !== null;
              const distanceFromCurrent = ms.target_value - snapshot.portfolio_value;
              return (
                <div
                  key={ms.id}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-colors ${
                    reached
                      ? "border-emerald-500/20 bg-emerald-500/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      reached
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {reached ? (
                      <Trophy className="w-4 h-4" />
                    ) : (
                      <Target className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${reached ? "text-emerald-400" : ""}`}>
                        {currencySymbol}{ms.target_value.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">{ms.label}</span>
                    </div>
                    {reached && ms.reached_at && (
                      <p className="text-[10px] text-emerald-500/70 mt-0.5">
                        Reached {new Date(ms.reached_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    {reached ? (
                      <span className="text-xs font-medium text-emerald-400">Reached</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {currencySymbol}{Math.max(0, distanceFromCurrent).toLocaleString()} away
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───

function StartMarker({
  isVertical,
  value,
  variant,
}: {
  isVertical: boolean;
  value: string;
  variant: string;
}) {
  const x = isVertical ? 130 : 35;
  const y = isVertical ? 30 : 110;
  const fontSize = variant === "compact" ? 9 : 11;

  return (
    <g>
      <circle cx={x} cy={y} r={6} fill="hsl(220 15% 40%)" stroke="hsl(220 15% 50%)" strokeWidth={2} />
      <text
        x={x}
        y={isVertical ? y - 14 : y - 16}
        textAnchor="middle"
        fill="hsl(220 10% 55%)"
        fontSize={fontSize}
        fontWeight={600}
        fontFamily="inherit"
      >
        {value}
      </text>
    </g>
  );
}

function DestinationMarker({
  isVertical,
  value,
  variant,
}: {
  isVertical: boolean;
  value: string;
  variant: string;
}) {
  const x = isVertical ? 130 : 875;
  const y = isVertical ? 575 : 75;
  const fontSize = variant === "compact" ? 12 : 14;
  const labelY = isVertical ? y + 26 : y - 24;
  const pillW = value.length * (fontSize * 0.65) + 16;
  const pillH = fontSize + 10;

  return (
    <g filter="url(#glow)">
      {/* Glow */}
      <circle cx={x} cy={y} r={14} fill="hsl(142 60% 40%)" opacity={0.1} />
      <circle
        cx={x}
        cy={y}
        r={9}
        fill="hsl(142 60% 40%)"
        stroke="white"
        strokeWidth={2.5}
      >
        <animate
          attributeName="r"
          values="9;11;9"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx={x} cy={y} r={3.5} fill="white" />
      {/* Label pill */}
      <rect
        x={x - pillW / 2}
        y={labelY - pillH / 2}
        width={pillW}
        height={pillH}
        rx={pillH / 2}
        fill="hsl(142 50% 18%)"
        stroke="hsl(142 50% 40%)"
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={labelY + fontSize * 0.37}
        textAnchor="middle"
        fill="hsl(142 60% 80%)"
        fontSize={fontSize}
        fontWeight={700}
        fontFamily="inherit"
      >
        {value}
      </text>
    </g>
  );
}

function MilestoneMarker({
  pathD,
  offset,
  reached,
  isNext,
  label,
  mounted,
  delay,
  variant,
}: {
  pathD: string;
  offset: number;
  reached: boolean;
  isNext: boolean;
  label: string;
  mounted: boolean;
  delay: number;
  variant: string;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!mounted) return;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    const length = path.getTotalLength();
    const point = path.getPointAtLength(length * offset);
    setPos({ x: point.x, y: point.y });
  }, [pathD, offset, mounted]);

  if (!pos.x && !pos.y) return null;

  const r = reached ? 8 : 7;
  const fontSize = variant === "compact" ? 12 : 14;
  const labelY = pos.y - (variant === "compact" ? 18 : 22);
  const pillPadX = variant === "compact" ? 8 : 12;
  const pillPadY = variant === "compact" ? 4 : 5;
  const pillW = label.length * (fontSize * 0.62) + pillPadX * 2;
  const pillH = fontSize + pillPadY * 2;

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      {/* Reached: green glow */}
      {reached && (
        <>
          <circle cx={pos.x} cy={pos.y} r={r + 8} fill="hsl(142 60% 40%)" opacity={0.08} />
          <circle cx={pos.x} cy={pos.y} r={r + 4} fill="hsl(142 60% 40%)" opacity={0.12} />
        </>
      )}

      {/* Next upcoming: pulse animation */}
      {isNext && !reached && (
        <circle cx={pos.x} cy={pos.y} r={r + 4} fill="none" stroke="hsl(142 60% 50%)" strokeWidth={1.5} opacity={0.4}>
          <animate attributeName="r" values={`${r + 2};${r + 10};${r + 2}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Main circle */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={r}
        fill={reached ? "hsl(142 60% 45%)" : "hsl(220 18% 16%)"}
        stroke={reached ? "white" : isNext ? "hsl(142 60% 40%)" : "hsl(220 10% 40%)"}
        strokeWidth={reached ? 2.5 : 2}
      />
      {/* Checkmark for reached (simple cross/tick) */}
      {reached && (
        <>
          <line x1={pos.x - 2.5} y1={pos.y} x2={pos.x - 0.5} y2={pos.y + 2.5} stroke="white" strokeWidth={2} strokeLinecap="round" />
          <line x1={pos.x - 0.5} y1={pos.y + 2.5} x2={pos.x + 3} y2={pos.y - 2} stroke="white" strokeWidth={2} strokeLinecap="round" />
        </>
      )}

      {/* Label pill with drop shadow */}
      <defs>
        <filter id={`pill-shadow-${label}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="black" floodOpacity="0.3" />
        </filter>
      </defs>
      <rect
        x={pos.x - pillW / 2}
        y={labelY - pillH / 2}
        width={pillW}
        height={pillH}
        rx={pillH / 2}
        fill={reached ? "hsl(142 50% 18%)" : "hsl(220 20% 13%)"}
        stroke={reached ? "hsl(142 50% 35%)" : isNext ? "hsl(142 40% 30%)" : "hsl(220 15% 25%)"}
        strokeWidth={1}
        filter={`url(#pill-shadow-${label})`}
      />
      <text
        x={pos.x}
        y={labelY + fontSize * 0.37}
        textAnchor="middle"
        fill={reached ? "hsl(142 60% 85%)" : isNext ? "hsl(142 50% 70%)" : "hsl(220 10% 70%)"}
        fontSize={fontSize}
        fontWeight={700}
        fontFamily="inherit"
      >
        {label}
      </text>
    </motion.g>
  );
}

function TravelerDot({
  pathD,
  progressPct,
  currentValue,
  currencySymbol,
}: {
  pathD: string;
  progressPct: number;
  totalLength?: number;
  currentValue: number;
  currencySymbol: string;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const progress = useMotionValue(0);

  useEffect(() => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    const length = path.getTotalLength();

    const unsubscribe = progress.on("change", (v) => {
      const point = path.getPointAtLength((v / 100) * length);
      setPos({ x: point.x, y: point.y });
    });

    // Animate after path draw
    const timeout = setTimeout(() => {
      animate(progress, progressPct, {
        duration: 1.5,
        ease: "easeOut",
      });
    }, 1800);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [pathD, progressPct, progress]);

  if (!pos.x && !pos.y) return null;

  const valueLabel = `${currencySymbol}${currentValue >= 1000 ? `${(currentValue / 1000).toFixed(1)}K` : currentValue.toFixed(0)}`;
  const valueFontSize = 11;
  const valuePillW = valueLabel.length * (valueFontSize * 0.62) + 14;
  const valuePillH = valueFontSize + 8;
  const valueLabelY = pos.y + 22;

  return (
    <g filter="url(#glow-strong)">
      {/* Outer ring 2 — expanding and fading */}
      <circle cx={pos.x} cy={pos.y} r={18} fill="none" stroke="hsl(142 60% 50%)" strokeWidth={1} opacity={0.2}>
        <animate attributeName="r" values="16;28;16" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
      </circle>
      {/* Outer ring 1 — tighter pulse */}
      <circle cx={pos.x} cy={pos.y} r={14} fill="none" stroke="hsl(142 60% 55%)" strokeWidth={1.5} opacity={0.4}>
        <animate attributeName="r" values="14;20;14" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite" />
      </circle>
      {/* Glow disc */}
      <circle cx={pos.x} cy={pos.y} r={16} fill="hsl(142 60% 40%)" opacity={0.1} />
      {/* Traveler body — 20px diameter, largest element */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={10}
        fill="hsl(142 60% 45%)"
        stroke="white"
        strokeWidth={3}
      />
      {/* Inner dot */}
      <circle cx={pos.x} cy={pos.y} r={3.5} fill="white" />

      {/* Current value label below traveler */}
      <rect
        x={pos.x - valuePillW / 2}
        y={valueLabelY - valuePillH / 2}
        width={valuePillW}
        height={valuePillH}
        rx={valuePillH / 2}
        fill="hsl(142 50% 18%)"
        stroke="hsl(142 50% 35%)"
        strokeWidth={1}
      />
      <text
        x={pos.x}
        y={valueLabelY + valueFontSize * 0.37}
        textAnchor="middle"
        fill="hsl(142 60% 80%)"
        fontSize={valueFontSize}
        fontWeight={700}
        fontFamily="inherit"
      >
        {valueLabel}
      </text>
    </g>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
  progressBar,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon?: React.ReactNode;
  progressBar?: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-1.5">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
        {label}
      </p>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className={`text-lg font-bold ${color}`}>{value}</p>
      </div>
      {progressBar !== undefined && (
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressBar}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}
