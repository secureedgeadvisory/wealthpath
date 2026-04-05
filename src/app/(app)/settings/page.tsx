"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Settings,
  User,
  Target,
  Bell,
  Palette,
  CreditCard,
  Rocket,
  Shield,
  Sun,
  Moon,
  Monitor,
  Download,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
} from "lucide-react";
import { MOCK_USER, MOCK_GOAL, MOCK_SELECTED_PATH } from "@/lib/mock-data";
import { toast } from "sonner";

const CURRENCIES = ["USD", "AED", "INR", "EUR", "GBP"];

type SectionKey = "profile" | "goal" | "notifications" | "appearance" | "subscription" | "setup" | "data";

export default function SettingsPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<SectionKey | null>("profile");

  // Profile
  const [name, setName] = useState(MOCK_USER.name);
  const [currency, setCurrency] = useState(MOCK_GOAL.currency);

  // Notifications
  const [notifDailyReminder, setNotifDailyReminder] = useState(true);
  const [notifReminderTime, setNotifReminderTime] = useState("08:00");
  const [notifMilestones, setNotifMilestones] = useState(true);
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(true);
  const [notifStreakWarning, setNotifStreakWarning] = useState(true);

  // Theme
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const toggleSection = (key: SectionKey) =>
    setExpanded((prev) => (prev === key ? null : key));

  const applyTheme = (t: "dark" | "light" | "system") => {
    setTheme(t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("wp-theme", "dark");
    } else if (t === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("wp-theme", "light");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      localStorage.setItem("wp-theme", "system");
    }
    toast.success(`Theme set to ${t}`);
  };

  const handleExportData = () => {
    const data = {
      user: MOCK_USER,
      goal: MOCK_GOAL,
      path: MOCK_SELECTED_PATH,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wealthpath-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-wealth flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>
      </motion.div>

      {/* ─── 1. Profile ─── */}
      <SettingsSection
        icon={<User className="w-4 h-4" />}
        title="Profile"
        sectionKey="profile"
        expanded={expanded}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Email</Label>
            <Input value={MOCK_USER.email} disabled className="opacity-60" />
            <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Currency</Label>
            <div className="flex gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currency === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <Button size="sm" onClick={() => toast.success("Profile saved")} className="gradient-wealth text-white">
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Save changes
          </Button>
        </div>
      </SettingsSection>

      {/* ─── 2. My Goal ─── */}
      <SettingsSection
        icon={<Target className="w-4 h-4" />}
        title="My Goal"
        sectionKey="goal"
        expanded={expanded}
        onToggle={toggleSection}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground">Target</p>
              <p className="text-sm font-bold">${MOCK_GOAL.target_amount.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground">Timeframe</p>
              <p className="text-sm font-bold">{MOCK_GOAL.timeframe_months} months</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground">Daily savings</p>
              <p className="text-sm font-bold">${MOCK_GOAL.daily_savings}/day</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground">Risk profile</p>
              <p className="text-sm font-bold capitalize">{MOCK_GOAL.risk_profile}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg border-l-4 border-l-amber-500 border border-amber-500/20 bg-[#FFF8E1] dark:bg-[#3D2800]">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-[#7A4100] dark:text-[#FCD34D]">
              Updating your goal will regenerate your wealth path and reset your journey. Your streak and history will be preserved.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.info("Goal editor coming soon")}>
            Edit goal
          </Button>
        </div>
      </SettingsSection>

      {/* ─── 3. Notifications ─── */}
      <SettingsSection
        icon={<Bell className="w-4 h-4" />}
        title="Notifications"
        sectionKey="notifications"
        expanded={expanded}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Daily task reminder</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">Remind at</p>
                <Input
                  type="time"
                  value={notifReminderTime}
                  onChange={(e) => setNotifReminderTime(e.target.value)}
                  className="w-24 h-7 text-xs"
                  disabled={!notifDailyReminder}
                />
              </div>
            </div>
            <Switch checked={notifDailyReminder} onCheckedChange={setNotifDailyReminder} />
          </div>
          <Separator />
          <ToggleRow label="Milestone alerts" desc="Get notified when you hit milestones" checked={notifMilestones} onChange={setNotifMilestones} />
          <Separator />
          <ToggleRow label="Weekly summary email" desc="Receive a weekly progress report" checked={notifWeeklySummary} onChange={setNotifWeeklySummary} />
          <Separator />
          <ToggleRow label="Streak warning" desc="Alert at 9pm if streak is at risk" checked={notifStreakWarning} onChange={setNotifStreakWarning} />
        </div>
      </SettingsSection>

      {/* ─── 4. Appearance ─── */}
      <SettingsSection
        icon={<Palette className="w-4 h-4" />}
        title="Appearance"
        sectionKey="appearance"
        expanded={expanded}
        onToggle={toggleSection}
      >
        <div className="flex gap-3">
          {([
            { value: "light" as const, icon: <Sun className="w-4 h-4" />, label: "Light" },
            { value: "dark" as const, icon: <Moon className="w-4 h-4" />, label: "Dark" },
            { value: "system" as const, icon: <Monitor className="w-4 h-4" />, label: "System" },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyTheme(opt.value)}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <span className={theme === opt.value ? "text-primary" : "text-muted-foreground"}>
                {opt.icon}
              </span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* ─── 5. Subscription ─── */}
      <SettingsSection
        icon={<CreditCard className="w-4 h-4" />}
        title="Subscription"
        sectionKey="subscription"
        expanded={expanded}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Free Plan</p>
                <Badge variant="secondary" className="text-[10px]">Current</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Basic features included</p>
            </div>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-2.5 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center p-2.5 font-medium text-muted-foreground w-20">Free</th>
                  <th className="text-center p-2.5 font-medium text-wealth-gold w-20">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Journey map", "✓", "✓"],
                  ["Daily tasks", "✓", "✓"],
                  ["Streak tracking", "✓", "✓"],
                  ["AI daily briefing", "—", "✓"],
                  ["What-if scenarios", "—", "✓"],
                  ["Shareable milestone cards", "—", "✓"],
                  ["Weekly summary email", "—", "✓"],
                  ["Multiple paths", "1", "4"],
                ].map(([feature, free, pro], i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-2.5">{feature}</td>
                    <td className="p-2.5 text-center text-muted-foreground">{free}</td>
                    <td className="p-2.5 text-center text-wealth-green font-medium">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button className="w-full gradient-wealth text-white">
            Upgrade to Pro — $7.99/month
          </Button>
        </div>
      </SettingsSection>

      {/* ─── 6. Setup Guide ─── */}
      <SettingsSection
        icon={<Rocket className="w-4 h-4" />}
        title="Setup Guide"
        sectionKey="setup"
        expanded={expanded}
        onToggle={toggleSection}
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Revisit the Launchpad to set up or change your investment accounts.
          </p>
          <Button variant="outline" size="sm" onClick={() => router.push("/launchpad")}>
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open Launchpad
          </Button>
        </div>
      </SettingsSection>

      {/* ─── 7. Data & Privacy ─── */}
      <SettingsSection
        icon={<Shield className="w-4 h-4" />}
        title="Data & Privacy"
        sectionKey="data"
        expanded={expanded}
        onToggle={toggleSection}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export my data</p>
              <p className="text-xs text-muted-foreground">Download all your tasks, snapshots, and milestones</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportData}>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Delete my account</p>
              <p className="text-xs text-muted-foreground">Permanently delete all data</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* Delete confirmation */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This permanently deletes all your data including goals, paths, tasks, and progress. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-xs">Type DELETE to confirm</Label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE"}
              onClick={() => {
                toast.success("Account deleted");
                setShowDeleteModal(false);
              }}
            >
              Delete forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Reusable Section Component ───
function SettingsSection({
  icon,
  title,
  sectionKey,
  expanded,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  sectionKey: SectionKey;
  expanded: SectionKey | null;
  onToggle: (key: SectionKey) => void;
  children: React.ReactNode;
}) {
  const isOpen = expanded === sectionKey;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <button
          onClick={() => onToggle(sectionKey)}
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-accent/30 transition-colors rounded-t-xl"
        >
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-semibold flex-1">{title}</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        {isOpen && (
          <CardContent className="pt-0 pb-4 px-4">
            <Separator className="mb-4" />
            {children}
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
