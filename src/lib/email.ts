export async function sendBookingAlertEmail(params: {
  fullName: string;
  whatsapp: string;
  companion: string;
  activity: string;
  preferredDate: string;
  preferredTime: string;
  area: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SIT WITH ME <onboarding@resend.dev>",
        to,
        subject: `New booking: ${params.fullName} — ${params.activity}`,
        text: [
          `New booking request received.`,
          ``,
          `Name: ${params.fullName}`,
          `WhatsApp: ${params.whatsapp}`,
          `Companion: ${params.companion}`,
          `Activity: ${params.activity}`,
          `Date: ${params.preferredDate}`,
          `Time: ${params.preferredTime}`,
          `Area: ${params.area}`,
          ``,
          `Open the admin panel to view full details and respond.`,
        ].join("\n"),
      }),
    });
  } catch {
    // Best-effort only - a failed email must never block a booking from saving.
  }
}

// ---- Phase 2: Razorpay pay-first booking flow ----

export async function sendPaymentConfirmationEmail(params: {
  toEmail: string | null;
  fullName: string;
  bookingId: string;
  serviceTitle: string;
  totalAmountInr: number;
  calendlyLink: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !params.toEmail) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SIT WITH ME <onboarding@resend.dev>",
        to: params.toEmail,
        subject: `Payment received - Booking ${params.bookingId.slice(0, 8).toUpperCase()}`,
        text: [
          `Hi ${params.fullName},`,
          ``,
          `Payment received ✅`,
          ``,
          `Booking ID: ${params.bookingId}`,
          `Service: ${params.serviceTitle}`,
          `Amount paid: ₹${params.totalAmountInr}`,
          ``,
          `Next step: pick your slot.`,
          params.calendlyLink ? params.calendlyLink : "We'll WhatsApp you shortly to schedule.",
          ``,
          `Quote your Booking ID if you message us on WhatsApp.`,
          ``,
          `- Team SIT WITH ME`,
        ].join("\n"),
      }),
    });
  } catch {
    // Best-effort only - a failed email must never block a booking from being marked Paid.
  }
}

export async function sendPaymentAlertEmail(params: {
  fullName: string;
  whatsapp: string;
  serviceTitle: string;
  totalAmountInr: number;
  bookingId: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "SIT WITH ME <onboarding@resend.dev>",
        to,
        subject: `💰 Payment received: ${params.fullName} — ₹${params.totalAmountInr}`,
        text: [
          `A payment has been captured.`,
          ``,
          `Booking ID: ${params.bookingId}`,
          `Name: ${params.fullName}`,
          `WhatsApp: ${params.whatsapp}`,
          `Service: ${params.serviceTitle}`,
          `Amount: ₹${params.totalAmountInr}`,
          ``,
          `Open the admin panel > Payments to view full details.`,
        ].join("\n"),
      }),
    });
  } catch {
    // Best-effort only.
  }
}
