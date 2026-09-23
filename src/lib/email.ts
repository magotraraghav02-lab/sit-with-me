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
