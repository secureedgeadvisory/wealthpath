# WealthPath

> Tell me your dream number and how much you can save daily. I'll show you the path, walk with you every day, and make sure you arrive.

**WealthPath** is a financial education and planning tool that creates personalized wealth-building journeys. Think of it as **Waze for wealth building** — you set the destination, pick your speed, and follow the map with daily tasks until you arrive.

---

## Features

- 🎯 **Goal Setting** — Enter your dream number, daily savings, and risk tolerance
- 🤖 **3 AI-Generated Paths** — Conservative, moderate, and aggressive strategies
- 🗺️ **Live Journey Map** — Animated SVG winding path with a traveler that moves as you progress
- ✅ **Daily Task Checklist** — DCA breakdowns split across savings, gold, ETFs, crypto
- ⚡ **Consequence Engine** — Shows the real compound cost of every skipped task
- 🔥 **Streak Tracking** — Duolingo-style streaks with 4-tier flame animations
- 🎉 **Milestone Celebrations** — Confetti, counting animations, and shareable achievement cards
- 🚀 **Launchpad Setup Guide** — Region-specific platform recommendations
- 📊 **What-If Scenario Modeler** — See how changing your plan affects your timeline (Pro)
- 🤖 **AI Co-pilot Daily Briefings** — Context-aware motivational insights (Pro)
- 📅 **Task History Calendar** — Monthly view with perfect/partial/missed days
- ⚙️ **Full Settings** — Profile, notifications, appearance, subscription, data export
- 📱 **PWA** — Installable on any device with offline support
- 🌙 **Light/Dark Mode** — Premium fintech design in both modes
- 📈 **Internal Analytics** — Funnel tracking, event counts, conversion metrics

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database & Auth | Supabase (PostgreSQL + Magic Link) |
| AI | Claude API (Anthropic) |
| Animations | Framer Motion |
| Charts | Recharts |
| Celebrations | canvas-confetti |
| Share Cards | html-to-image |
| Fonts | Plus Jakarta Sans |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account (free tier works)
- Anthropic API key (for AI features)

### Installation

```bash
git clone https://github.com/your-username/wealthpath.git
cd wealthpath
npm install
cp .env.example .env.local
```

### Configure Environment

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-your-key
NEXT_PUBLIC_APP_URL=http://localhost:5000
```

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Run `supabase/migrations/001_initial_schema.sql`
4. Creates 8 tables with Row Level Security

### Running Locally

```bash
npm run dev -- --port 5000
```

> The app works with mock data out of the box — no external services needed for development.

### Building for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/                     # Pages (14 routes)
│   ├── page.tsx             # Landing page
│   ├── login/               # Magic link auth
│   ├── (app)/               # Authenticated routes
│   │   ├── dashboard/       # Main daily screen
│   │   ├── journey/         # Full journey map
│   │   ├── tasks/           # Calendar history
│   │   ├── what-if/         # Scenario modeler
│   │   ├── settings/        # Preferences
│   │   ├── onboarding/      # 3-step wizard
│   │   ├── paths/           # Path selection
│   │   ├── launchpad/       # Setup guide
│   │   └── analytics/       # Internal metrics
│   └── api/                 # API routes
├── components/              # Reusable UI
│   ├── journey-map.tsx      # SVG journey (hero component)
│   ├── consequence-toast.tsx
│   ├── milestone-celebration.tsx
│   ├── streak-celebration.tsx
│   └── nav/                 # Sidebar + bottom nav
├── lib/                     # Business logic
│   ├── consequence-engine.ts
│   ├── task-generator.ts
│   ├── path-generator.ts
│   ├── briefing-generator.ts
│   └── mock-data.ts         # 30-day demo scenario
└── types/index.ts           # TypeScript interfaces
```

---

## User Flow

```
Landing → Login → Onboarding (3 steps) → Path Selection
  → Launchpad (Setup) → Dashboard (Daily Use)
       ├── Complete tasks → Streak grows → Milestones celebrate
       ├── Skip tasks → Consequence shown → ETA shifts
       ├── Journey Map → Watch traveler advance
       └── What-If → Model different futures
```

---

## Monetization

| Feature | Free | Pro ($7.99/mo) |
|---------|------|----------------|
| Journey map | ✓ | ✓ |
| Daily checklist | ✓ | ✓ |
| Streaks | ✓ | ✓ |
| Consequence engine | Basic | Full + AI narration |
| AI daily briefing | Blurred | Full |
| What-If scenarios | Locked | Full |
| Shareable cards | — | ✓ |
| Weekly email | — | ✓ |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

---

## Disclaimer

WealthPath is a **financial education tool**, NOT a financial advisor. Projections are for educational purposes only. Past performance does not guarantee future results. Users execute all investments on their own platforms.

---

Built by **Partha** and **Rudra** (Claude Code)
