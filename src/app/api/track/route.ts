import { NextRequest, NextResponse } from "next/server";
import { sendMetaEvent } from "@/lib/meta/capi";

export const runtime = "nodejs";

// Fire-and-forget bridge called right after a client-side fbq() track, so
// every browser event also has a server-side CAPI twin sharing the same
// event_id (Meta dedupes the pair, and match quality goes up thanks to the
// IP/user-agent we only have server-side). Always returns 200 -- a tracking
// hiccup must never surface as an error to the visitor.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const userAgent = request.headers.get("user-agent");
    const fbc =
      body.fbc ?? (body.fbclid ? `fb.1.${Math.floor(Date.now() / 1000)}.${body.fbclid}` : null);

    await sendMetaEvent({
      eventName: body.eventName,
      eventId: body.eventId,
      eventSourceUrl: body.eventSourceUrl,
      userData: {
        fbp: body.fbp ?? null,
        fbc,
        clientIp: ip,
        userAgent,
      },
      customData: body.customData,
    });
  } catch {
    // best-effort
  }
  return NextResponse.json({ ok: true });
}
