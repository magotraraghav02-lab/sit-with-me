// Sends a bilingual (Hindi + English) WhatsApp alert to the admin numbers whenever
// a new booking REQUEST comes in (before any payment). Uses CallMeBot
// (https://www.callmebot.com/blog/free-api-whatsapp-messages/), a free personal
// WhatsApp notification API - no business account needed.
//
// One-time setup per phone number (only needs to be done once, ever):
//   1. Save +34 644 51 71 92 as a contact on that WhatsApp number's phone.
//   2. From that phone, send the message: "I allow callmebot to send me messages"
//      to that contact.
//   3. CallMeBot replies with an API key. Put it in the matching env var below.
//
// If an API key env var is missing, that recipient is silently skipped (never
// blocks a booking from saving), matching the existing email-alert pattern.

type Recipient = { phone: string; apiKeyEnv: string };

const RECIPIENTS: Recipient[] = [
  { phone: "918618141090", apiKeyEnv: "CALLMEBOT_APIKEY_1" },
  { phone: "919310891615", apiKeyEnv: "CALLMEBOT_APIKEY_2" },
];

export async function sendBookingRequestAlertWhatsApp(params: {
  fullName: string;
  whatsapp: string;
  serviceTitle: string;
  totalAmountInr: number;
  area: string;
  companionName: string | null;
}) {
  const message = [
    "🔔 New Booking Request / नई बुकिंग रिक्वेस्ट",
    "",
    `Name / नाम: ${params.fullName}`,
    `WhatsApp: ${params.whatsapp}`,
    `Service / सेवा: ${params.serviceTitle}`,
    `Amount due / राशि: ₹${params.totalAmountInr}`,
    `Area / एरिया: ${params.area}`,
    `Companion / साथी: ${params.companionName ?? "No preference / कोई प्राथमिकता नहीं"}`,
    "",
    "Open the admin panel to send a payment link.",
    "पेमेंट लिंक भेजने के लिए एडमिन पैनल खोलें।",
  ].join("\n");

  const sends = RECIPIENTS.map(async ({ phone, apiKeyEnv }) => {
    const apiKey = process.env[apiKeyEnv];
    if (!apiKey) return;
    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(
        message,
      )}&apikey=${apiKey}`;
      await fetch(url, { method: "GET" });
    } catch {
      // Best-effort only - a failed WhatsApp alert must never block a booking from saving.
    }
  });

  await Promise.all(sends);
}
