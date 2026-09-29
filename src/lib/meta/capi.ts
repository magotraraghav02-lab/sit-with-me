import { sha256Hex } from "@/lib/payments";

type CapiUserData = {
  phone?: string | null;
  email?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
};

// Meta Conversions API — server-side event send, deduplicated against the
// client-side Pixel fire (when there is one) via a shared event_id. Silent
// no-op until NEXT_PUBLIC_META_PIXEL_ID + META_CAPI_ACCESS_TOKEN are set, and
// never throws: a tracking failure must never break a booking or a payment.
export async function sendMetaEvent(params: {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  userData: CapiUserData;
  customData?: Record<string, unknown>;
}): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const userData: Record<string, unknown> = {};
  if (params.userData.phone) {
    const digits = params.userData.phone.replace(/\D/g, "").slice(-10);
    if (digits) userData.ph = [sha256Hex(`91${digits}`)];
  }
  if (params.userData.email) {
    userData.em = [sha256Hex(params.userData.email.trim().toLowerCase())];
  }
  if (params.userData.fbp) userData.fbp = params.userData.fbp;
  if (params.userData.fbc) userData.fbc = params.userData.fbc;
  if (params.userData.clientIp) userData.client_ip_address = params.userData.clientIp;
  if (params.userData.userAgent) userData.client_user_agent = params.userData.userAgent;

  const payload = {
    data: [
      {
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        event_source_url: params.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: params.customData ?? {},
      },
    ],
    ...(process.env.META_TEST_EVENT_CODE
      ? { test_event_code: process.env.META_TEST_EVENT_CODE }
      : {}),
  };

  try {
    await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Best-effort only.
  }
}
