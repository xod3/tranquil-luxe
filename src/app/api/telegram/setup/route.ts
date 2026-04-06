import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const WEBHOOK_URL = "https://tranquilluxemassage.fit/api/telegram/webhook";

/**
 * GET /api/telegram/setup — One-time call to register the webhook with Telegram.
 * Visit this URL once after deploying to activate the bot.
 */
export async function GET() {
  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN not configured" },
      { status: 500 }
    );
  }

  try {
    // Set the webhook
    const setRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: WEBHOOK_URL,
          allowed_updates: ["message", "callback_query"],
        }),
      }
    );
    const setData = await setRes.json();

    // Get webhook info
    const infoRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
    );
    const infoData = await infoRes.json();

    // Set bot commands
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commands: [
            { command: "pending", description: "View all pending orders" },
            { command: "stats", description: "View order statistics" },
            { command: "help", description: "Show available commands" },
          ],
        }),
      }
    );

    return NextResponse.json({
      success: setData.ok,
      webhookSet: setData,
      webhookInfo: infoData,
      webhookUrl: WEBHOOK_URL,
    });
  } catch (error) {
    console.error("Webhook setup error:", error);
    return NextResponse.json(
      { error: "Failed to set webhook" },
      { status: 500 }
    );
  }
}
