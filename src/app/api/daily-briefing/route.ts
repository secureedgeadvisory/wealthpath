import { NextResponse } from "next/server";
import { generateRandomBriefing } from "@/lib/briefing-generator";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ctx = await req.json();
  const briefing = generateRandomBriefing(ctx);
  return NextResponse.json({ briefing, generated_at: new Date().toISOString() });
}
