/**
 * One-time script to register the Telegram webhook.
 * 
 * Usage:
 *   node setup-telegram-webhook.mjs
 * 
 * This tells Telegram to send all bot updates to your webhook URL.
 * You only need to run this once (or when the URL changes).
 */

import "dotenv/config";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = "https://tranquilluxemassage.fit/api/telegram/webhook";

if (!BOT_TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN not found in .env");
  process.exit(1);
}

async function setupWebhook() {
  console.log(`\n🔗 Setting webhook to: ${WEBHOOK_URL}\n`);

  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ["message", "callback_query"],
      }),
    }
  );

  const data = await res.json();

  if (data.ok) {
    console.log("✅ Webhook set successfully!");
    console.log(`   ${JSON.stringify(data, null, 2)}`);
  } else {
    console.error("❌ Failed to set webhook:");
    console.error(`   ${JSON.stringify(data, null, 2)}`);
  }

  // Also get webhook info
  console.log("\n📋 Current webhook info:");
  const infoRes = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
  );
  const infoData = await infoRes.json();
  console.log(JSON.stringify(infoData, null, 2));
}

setupWebhook();
