import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY || "fallback_key_for_dev");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

// In-memory store for pending decline actions (waiting for admin to type a reason)
// Maps chatId:messageId -> orderId
const pendingDeclines = new Map<string, { orderId: string; originalMessageId: number }>();

function generateCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TXN-${result}`;
}

async function tgApi(method: string, body: Record<string, unknown>) {
  const res = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

async function processAction(
  orderId: string,
  action: "confirm" | "decline",
  adminNote: string,
  chatId: number | string,
  originalMessageId: number
) {
  // Fetch the order to make sure it exists and is still pending
  const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existingOrder) {
    await tgApi("sendMessage", {
      chat_id: chatId,
      text: "⚠️ Order not found in database.",
      reply_to_message_id: originalMessageId,
    });
    return;
  }
  if (existingOrder.status !== "pending") {
    await tgApi("sendMessage", {
      chat_id: chatId,
      text: `⚠️ This order has already been ${existingOrder.status.toUpperCase()}. No action taken.`,
      reply_to_message_id: originalMessageId,
    });
    return;
  }

  const isConfirming = action === "confirm";
  const confirmedCode = isConfirming ? generateCode() : null;

  // Update order in DB
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: isConfirming ? "confirmed" : "declined",
      paymentConfirmedCode: confirmedCode,
      adminNote: adminNote || null,
    },
  });

  // Send email to customer
  if (process.env.RESEND_API_KEY) {
    const subject = isConfirming
      ? "Booking Confirmed - Tranquil Luxe Massage"
      : "Booking Declined - Tranquil Luxe Massage";

    let htmlContent = "";

    if (isConfirming) {
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EAEAEA; border-radius: 8px;">
          <h1 style="color: #AA8C2C; text-align: center;">Payment Confirmed</h1>
          <p>Dear ${order.clientName},</p>
          <p>Your payment of <strong>$${order.totalAmount}</strong> has been successfully confirmed!</p>
          <div style="background-color: rgba(212, 175, 55, 0.05); padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0;">
            <p style="margin: 0; font-size: 1.2rem;"><strong>Your Confirmation Code is:</strong> <span style="color: #AA8C2C;">${confirmedCode}</span></p>
          </div>
          ${adminNote ? `<p><strong>Note from Admin:</strong> ${adminNote}</p>` : ""}
          <p>Please keep this code safe. We will contact you at <strong>${order.clientPhone}</strong> shortly to finalize your appointment time.</p>
          <p>Thank you for choosing Tranquil Luxe Massage.</p>
          <br/>
          <p style="font-size: 0.9em; color: #666;">Relax. Restore. Rejuvenate.</p>
        </div>
      `;
    } else {
      htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EAEAEA; border-radius: 8px;">
          <h1 style="color: #D32F2F; text-align: center;">Payment Declined</h1>
          <p>Dear ${order.clientName},</p>
          <p>Unfortunately, your payment submission of <strong>$${order.totalAmount}</strong> could not be confirmed.</p>
          <div style="background-color: rgba(211, 47, 47, 0.05); padding: 15px; border-left: 4px solid #D32F2F; margin: 20px 0;">
            <p style="margin: 0; font-size: 1rem;"><strong>Reason for Decline:</strong> <span style="color: #D32F2F;">${adminNote || "No reason provided"}</span></p>
          </div>
          <p>If you believe this is an error, please ensure you uploaded the correct images or contact us at <strong>(562) 443-6439</strong>.</p>
          <p>You may submit a new booking on our website.</p>
          <br/>
          <p style="font-size: 0.9em; color: #666;">Tranquil Luxe Massage.</p>
        </div>
      `;
    }

    await resend.emails.send({
      from: "Tranquil Luxe Massage <bookings@tranquilluxemassage.fit>",
      to: order.clientEmail,
      subject,
      html: htmlContent,
    });
  }

  // Update original Telegram message to show result
  const statusEmoji = isConfirming ? "✅" : "❌";
  const statusText = isConfirming ? "CONFIRMED" : "DECLINED";

  await tgApi("editMessageReplyMarkup", {
    chat_id: chatId,
    message_id: originalMessageId,
    reply_markup: JSON.stringify({ inline_keyboard: [] }),
  });

  const resultMsg = isConfirming
    ? `${statusEmoji} *PAYMENT ${statusText}*\n\nOrder #${order.id.slice(-6).toUpperCase()}\nConfirmation Code: \`${confirmedCode}\`\nClient: ${order.clientName}\nAmount: $${order.totalAmount}\n\n📧 Confirmation email sent to ${order.clientEmail}${adminNote ? `\n📝 Note: ${adminNote}` : ""}`
    : `${statusEmoji} *PAYMENT ${statusText}*\n\nOrder #${order.id.slice(-6).toUpperCase()}\nClient: ${order.clientName}\nAmount: $${order.totalAmount}\nReason: ${adminNote || "No reason provided"}\n\n📧 Decline notification sent to ${order.clientEmail}`;

  await tgApi("sendMessage", {
    chat_id: chatId,
    text: resultMsg,
    parse_mode: "Markdown",
    reply_to_message_id: originalMessageId,
  });
}

export async function POST(request: Request) {
  try {
    const update = await request.json();

    // Handle callback queries (inline button taps)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data as string;
      const chatId = callbackQuery.message?.chat?.id;
      const messageId = callbackQuery.message?.message_id;

      // Acknowledge the callback immediately
      await tgApi("answerCallbackQuery", {
        callback_query_id: callbackQuery.id,
      });

      if (!chatId || !messageId) {
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith("confirm:")) {
        const orderId = data.replace("confirm:", "");
        await processAction(orderId, "confirm", "", chatId, messageId);
      } else if (data.startsWith("decline:")) {
        const orderId = data.replace("decline:", "");

        // Store the pending decline and ask for reason
        const key = `${chatId}`;
        pendingDeclines.set(key, { orderId, originalMessageId: messageId });

        await tgApi("sendMessage", {
          chat_id: chatId,
          text: `❌ *Declining Order #${orderId.slice(-6).toUpperCase()}*\n\nPlease type the reason for declining (this will be sent to the customer).\n\nOr type /skip to decline without a reason.`,
          parse_mode: "Markdown",
          reply_markup: JSON.stringify({
            force_reply: true,
            selective: true,
          }),
        });
      }

      return NextResponse.json({ ok: true });
    }

    // Handle regular text messages (for decline reasons)
    if (update.message?.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const key = `${chatId}`;

      // Check if we have a pending decline for this chat
      if (pendingDeclines.has(key)) {
        const { orderId, originalMessageId } = pendingDeclines.get(key)!;
        pendingDeclines.delete(key);

        const adminNote = text === "/skip" ? "" : text;
        await processAction(orderId, "decline", adminNote, chatId, originalMessageId);

        return NextResponse.json({ ok: true });
      }

      // Handle /pending command — list all pending orders
      if (text === "/pending") {
        const pendingOrders = await prisma.order.findMany({
          where: { status: "pending" },
          include: { paymentProofs: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        });

        if (pendingOrders.length === 0) {
          await tgApi("sendMessage", {
            chat_id: chatId,
            text: "✨ No pending orders!",
          });
          return NextResponse.json({ ok: true });
        }

        for (const order of pendingOrders) {
          const locationParts = [
            order.clientStreetAddress,
            order.clientCity,
            order.clientState,
            order.clientZipCode,
            order.clientCountry,
          ]
            .filter(Boolean)
            .join(", ");

          const msg = `📋 *PENDING ORDER*\n\nOrder: #${order.id.slice(-6).toUpperCase()}\nClient: ${order.clientName}\nEmail: ${order.clientEmail}\nPhone: ${order.clientPhone}${locationParts ? `\nLocation: ${locationParts}` : ""}${order.masseuseGender ? `\nMasseuse: ${order.masseuseGender}${order.masseuseBodyBuild ? ` — ${order.masseuseBodyBuild}` : ""}` : ""}\nAmount: $${order.totalAmount} ${order.currency !== "USD" ? `(${order.currency})` : ""}\nPayment: ${order.paymentMethod}\nDate: ${new Date(order.createdAt).toLocaleString()}`;

          const sentMsg = await tgApi("sendMessage", {
            chat_id: chatId,
            text: msg,
            parse_mode: "Markdown",
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [
                  { text: "✅ Confirm Payment", callback_data: `confirm:${order.id}` },
                  { text: "❌ Decline Payment", callback_data: `decline:${order.id}` },
                ],
              ],
            }),
          });

          // Send proof images
          for (const proof of order.paymentProofs) {
            if (proof.cardImageUrl) {
              await tgApi("sendPhoto", {
                chat_id: chatId,
                photo: proof.cardImageUrl,
                caption: `🎴 Gift Card — Order #${order.id.slice(-6).toUpperCase()}`,
                reply_to_message_id: sentMsg.result?.message_id,
              });
            }
            if (proof.receiptImageUrl) {
              await tgApi("sendPhoto", {
                chat_id: chatId,
                photo: proof.receiptImageUrl,
                caption: `🧾 Receipt/Proof — Order #${order.id.slice(-6).toUpperCase()}`,
                reply_to_message_id: sentMsg.result?.message_id,
              });
            }
          }
        }

        return NextResponse.json({ ok: true });
      }

      // Handle /stats command
      if (text === "/stats") {
        const [pending, confirmed, declined, total] = await Promise.all([
          prisma.order.count({ where: { status: "pending" } }),
          prisma.order.count({ where: { status: "confirmed" } }),
          prisma.order.count({ where: { status: "declined" } }),
          prisma.order.count(),
        ]);

        await tgApi("sendMessage", {
          chat_id: chatId,
          text: `📊 *Order Statistics*\n\n⏳ Pending: ${pending}\n✅ Confirmed: ${confirmed}\n❌ Declined: ${declined}\n📦 Total: ${total}`,
          parse_mode: "Markdown",
        });

        return NextResponse.json({ ok: true });
      }

      // Handle /help command
      if (text === "/help" || text === "/start") {
        await tgApi("sendMessage", {
          chat_id: chatId,
          text: `🏖️ *Tranquil Luxe Admin Bot*\n\nAvailable commands:\n\n/pending — View all pending orders with approve/decline buttons\n/stats — View order statistics\n/help — Show this help message\n\n*How it works:*\nWhen a new order comes in, you'll get a notification with the order details, payment proof images, and buttons to confirm or decline the payment — all from right here in Telegram!`,
          parse_mode: "Markdown",
        });

        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    // Always return 200 to Telegram so it doesn't retry
    return NextResponse.json({ ok: true });
  }
}
