// Sends a bilingual (Hindi + English) Telegram alert to the admins whenever a new
// booking REQUEST comes in (before any payment). Uses the official Telegram Bot
// API - free, instant, no rate limits worth worrying about.
//
// One-time setup (only needs to be done once, ever):
//   1. The bot already exists: t.me/SitWithMe_bot (token below, set as an env var
//      on the server - never commit it to git).
//   2. Each admin who wants alerts opens t.me/SitWithMe_bot in Telegram and sends
//      it any message (e.g. "hi").
//   3. Look up https://api.telegram.org/bot<TOKEN>/getUpdates to find that admin's
//      numeric chat id, then add it to TELEGRAM_CHAT_IDS (comma-separated) below.
//
// If the bot token or chat id list is missing, alerts are silently skipped (never
// blocks a booking from saving), matching the existing email/WhatsApp alert pattern.

export async function sendBookingRequestAlertTelegram(params: {
  fullName: string;
  whatsapp: string;
  serviceTitle: string;
  totalAmountInr: number;
  area: string;
  companionName: string | null;
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIdsRaw = process.env.TELEGRAM_CHAT_IDS;
  if (!token || !chatIdsRaw) return;

  const chatIds = chatIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (chatIds.length === 0) return;

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

  const sends = chatIds.map(async (chatId) => {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message }),
      });
    } catch {
      // Best-effort only - a failed Telegram alert must never block a booking from saving.
    }
  });

  await Promise.all(sends);
}
