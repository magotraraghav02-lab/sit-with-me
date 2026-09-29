// ---- Booking request alerts (customer submits a request; no online payment
// happens here since Razorpay Live keys need business KYC we don't have --
// see src/app/payment-actions.ts submitBookingRequest for the full context) ----

export async function sendBookingRequestAlertEmail(params: {
  bookingId: string;
  fullName: string;
  whatsapp: string;
  serviceTitle: string;
  totalAmountInr: number;
  area: string;
  companionName: string | null;
  notes: string | null;
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
        subject: `New booking request: ${params.fullName} — ${params.serviceTitle}`,
        text: [
          `New booking request received (no payment yet).`,
          ``,
          `Name: ${params.fullName}`,
          `WhatsApp: ${params.whatsapp}`,
          `Service: ${params.serviceTitle}`,
          `Amount due: ₹${params.totalAmountInr}`,
          `Area: ${params.area}`,
          `Companion requested: ${params.companionName ?? "No preference"}`,
          params.notes ? `Notes: ${params.notes}` : null,
          ``,
          `Open the admin panel > Payments to send them a WhatsApp message and create their payment link.`,
        ]
          .filter(Boolean)
          .join("\n"),
      }),
    });
  } catch {
    // Best-effort only - a failed email must never block a booking request from saving.
  }
}

export async function sendBookingRequestReceivedEmail(params: {
  toEmail: string | null;
  fullName: string;
  bookingId: string;
  serviceTitle: string;
  totalAmountInr: number;
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
        subject: `We've got your request - Booking ${params.bookingId.slice(0, 8).toUpperCase()}`,
        text: [
          `Hi ${params.fullName},`,
          ``,
          `Thanks for your booking request! 🙌`,
          ``,
          `Booking ID: ${params.bookingId}`,
          `Service: ${params.serviceTitle}`,
          `Amount due: ₹${params.totalAmountInr}`,
          ``,
          `We'll WhatsApp you a secure payment link shortly to confirm your slot.`,
          ``,
          `Quote your Booking ID if you message us on WhatsApp.`,
          ``,
          `- Team SIT WITH ME`,
        ].join("\n"),
      }),
    });
  } catch {
    // Best-effort only.
  }
}

// ---- Payment confirmation (fires once the customer actually pays, via the
// manual Razorpay Payment Link admin tool + webhook match) ----

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
          `View your confirmation: https://sitwithme.in/thank-you/${params.bookingId}`,
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

// Sent once, ~30 minutes after a booking request is submitted, if it's still
// Pending and we have an email on file. Deliberately does not touch `status`
// -- see markAbandonedBookings in payment-actions.ts for why that has to stay
// 'Pending' much longer, so a late real payment can still match the webhook.
export async function sendAbandonedReminderEmail(params: {
  toEmail: string;
  fullName: string;
  bookingId: string;
  serviceTitle: string;
  totalAmountInr: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const siteUrl = "https://sitwithme.in";

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
        subject: `Still want to book your ${params.serviceTitle}?`,
        text: [
          `Hi ${params.fullName},`,
          ``,
          `You started a booking request for ${params.serviceTitle} (₹${params.totalAmountInr}) a little while ago — we haven't sent your payment link yet because we haven't heard back.`,
          ``,
          `Complete your booking: ${siteUrl}/complete-booking/${params.bookingId}`,
          ``,
          `No rush — this just keeps your request from falling through the cracks.`,
          ``,
          `- Team SIT WITH ME`,
        ].join("\n"),
      }),
    });
  } catch {
    // Best-effort only.
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
