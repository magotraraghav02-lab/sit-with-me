// Sends a bilingual (Hindi + English) Telegram alert to the admins whenever a new
// booking comes in. Uses the official Telegram Bot API - free, instant, no rate
// limits worth worrying about.
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

export async function sendBookingAlertTelegram(params: {
  fullName: string;
  whatsapp: string;
  companion: string;
  activity: string;
  preferredDate: string;
  preferredTime: string;
  area: string;
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
    "🔔 New Booking / नई बुकिंग",
    "",
    `Name / नाम: ${params.fullName}`,
    `WhatsApp: ${params.whatsapp}`,
    `Companion / साथी: ${params.companion}`,
    `Activity / एक्टिविटी: ${params.activity}`,
    `Date / तारीख: ${params.preferredDate}`,
    `Time / समय: ${params.preferredTime}`,
    `Area / एरिया: ${params.area}`,
    "",
    "Open the admin panel to view full details and respond.",
    "पूरी जानकारी और जवाब देने के लिए एडमिन पैनल खोलें।",
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
