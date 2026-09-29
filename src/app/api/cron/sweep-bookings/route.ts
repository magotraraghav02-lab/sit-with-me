import { NextRequest, NextResponse } from "next/server";
import { markAbandonedBookings, sendAbandonedReminders } from "@/app/payment-actions";

export const runtime = "nodejs";

// Call this every 5-10 minutes from an external scheduler (see README) -- 30
// minute abandoned-checkout reminders need that frequency, and Vercel's own
// Hobby-tier cron can only run once a day. Vercel Cron requests already carry
// a bearer token automatically; anything else must send ?secret=CRON_SECRET.
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get("secret") === secret;
}

async function runSweep(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [reminders, abandoned] = await Promise.all([
    sendAbandonedReminders(),
    markAbandonedBookings(),
  ]);
  return NextResponse.json({
    ok: true,
    remindersSent: reminders.count,
    markedAbandoned: abandoned.count,
  });
}

export async function GET(request: NextRequest) {
  return runSweep(request);
}

export async function POST(request: NextRequest) {
  return runSweep(request);
}
