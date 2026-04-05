import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const event = await req.json();
    // In production: save to Supabase analytics_events table
    // For now: just acknowledge
    return NextResponse.json({ ok: true, id: event.id });
  } catch {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }
}
