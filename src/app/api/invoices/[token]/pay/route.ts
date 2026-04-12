import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = "birminghampandg@gmail.com";
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Fetch invoice
    const invoice = await prisma.invoice.findUnique({ where: { token } });
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
    }
    if (invoice.expiresAt && new Date() > new Date(invoice.expiresAt)) {
      return NextResponse.json({ error: "Invoice has expired" }, { status: 400 });
    }

    const data = await request.formData();
    const method = data.get("method") as string;
    const country = data.get("country") as string;
    const state = data.get("state") as string;
    const city = data.get("city") as string;
    const zipCode = data.get("zipCode") as string;
    const streetAddress = data.get("streetAddress") as string;
    const masseuseGender = data.get("masseuseGender") as string || null;
    const masseuseBodyBuild = data.get("masseuseBodyBuild") as string || null;

    // Create the order from the invoice
    const order = await prisma.order.create({
      data: {
        clientName: invoice.clientName,
        clientEmail: invoice.clientEmail,
        clientPhone: invoice.clientPhone,
        clientCountry: country,
        clientState: state,
        clientCity: city,
        clientZipCode: zipCode,
        clientStreetAddress: streetAddress,
        currency: invoice.currency,
        totalAmount: invoice.totalAmount,
        paymentMethod: method,
        masseuseGender,
        masseuseBodyBuild,
        status: "pending",
      },
    });

    // Handle file uploads
    const cardImageUrls: string[] = [];
    let receiptImageUrl: string | null = null;

    if (method === "Giftcard") {
      for (const [key, value] of data.entries()) {
        if (key.startsWith("cardImage_") && value instanceof File && value.size > 0) {
          const { url } = await put(`${order.id}-card-${key}-${(value as File).name}`, value, { access: 'public' });
          cardImageUrls.push(url);
        }
      }
      const receiptFile = data.get("receiptImage") as File;
      if (receiptFile && receiptFile.size > 0) {
        const { url } = await put(`${order.id}-receipt-${receiptFile.name}`, receiptFile, { access: 'public' });
        receiptImageUrl = url;
      }
    } else {
      const proofFile = data.get("proofOfPayment") as File;
      if (proofFile && proofFile.size > 0) {
        const { url } = await put(`${order.id}-proof-${proofFile.name}`, proofFile, { access: 'public' });
        receiptImageUrl = url;
      }
    }

    // Create proof records
    if (cardImageUrls.length > 0) {
      for (const cardUrl of cardImageUrls) {
        await prisma.paymentProof.create({
          data: { orderId: order.id, cardImageUrl: cardUrl, receiptImageUrl },
        });
      }
    } else {
      await prisma.paymentProof.create({
        data: { orderId: order.id, cardImageUrl: null, receiptImageUrl },
      });
    }

    // Mark invoice as paid and link to order
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "paid", orderId: order.id },
    });

    // Send admin notification email
    const locationParts = [streetAddress, city, state, zipCode, country].filter(Boolean).join(', ');
    resend.emails.send({
      from: "Tranquil Luxe Bookings <bookings@tranquilluxemassage.fit>",
      to: ADMIN_EMAIL,
      replyTo: "bookings@tranquilluxemassage.fit",
      subject: `📋 Invoice Payment #${order.id.slice(-6).toUpperCase()} - $${invoice.totalAmount} via ${method}`,
      text: `Invoice payment received.\n\nOrder: #${order.id.slice(-6).toUpperCase()}\nClient: ${invoice.clientName}\nEmail: ${invoice.clientEmail}\nPhone: ${invoice.clientPhone}\n${locationParts ? `Location: ${locationParts}\n` : ''}Amount: $${invoice.totalAmount}\nPayment: ${method}\nSource: Staff Invoice\nStatus: PENDING\n\nReview at: https://www.tranquilluxemassage.fit/admin`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A1A1A; border: 1px solid #333; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #D4AF37, #AA8C2C); padding: 20px 30px; text-align: center;">
            <h1 style="margin: 0; color: #111; font-size: 22px;">📋 Invoice Payment Received</h1>
          </div>
          <div style="padding: 30px; color: #E8E0D0;">
            <div style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.2); border-radius: 8px; padding: 10px 15px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 0.85rem; color: #D4AF37;">⚡ This order came from a <strong>staff-created invoice</strong></p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr><td style="padding: 8px 0; color: #A89F8F;">Order ID</td><td style="padding: 8px 0; font-weight: bold; color: #F3E5AB;">#${order.id.slice(-6).toUpperCase()}</td></tr>
              <tr><td style="padding: 8px 0; color: #A89F8F;">Client</td><td style="padding: 8px 0;">${invoice.clientName}</td></tr>
              <tr><td style="padding: 8px 0; color: #A89F8F;">Email</td><td style="padding: 8px 0;"><a href="mailto:${invoice.clientEmail}" style="color: #D4AF37;">${invoice.clientEmail}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #A89F8F;">Phone</td><td style="padding: 8px 0;">${invoice.clientPhone}</td></tr>
              ${locationParts ? `<tr><td style="padding: 8px 0; color: #A89F8F;">Location</td><td style="padding: 8px 0;">${locationParts}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; color: #A89F8F;">Amount</td><td style="padding: 8px 0; font-weight: bold; color: #D4AF37; font-size: 18px;">$${invoice.totalAmount}</td></tr>
              <tr><td style="padding: 8px 0; color: #A89F8F;">Payment</td><td style="padding: 8px 0;">${method}</td></tr>
              ${masseuseGender ? `<tr><td style="padding: 8px 0; color: #A89F8F;">Masseuse</td><td style="padding: 8px 0;"><span style="color: #F3E5AB; font-weight: bold;">${masseuseGender}${masseuseBodyBuild ? ` — ${masseuseBodyBuild}` : ''}</span></td></tr>` : ''}
              <tr><td style="padding: 8px 0; color: #A89F8F;">Status</td><td style="padding: 8px 0;"><span style="background: #f59e0b; color: #111; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">PENDING</span></td></tr>
            </table>
            <div style="margin-top: 25px; text-align: center;">
              <a href="https://tranquilluxemassage.fit/admin" style="display: inline-block; background: linear-gradient(135deg, #F3E5AB, #D4AF37); color: #111; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">Review & Confirm Order →</a>
            </div>
          </div>
        </div>
      `,
    }).catch(err => console.error("Admin notification email failed:", err));

    // Send Telegram notification
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const tgMsg = `📋 *INVOICE PAYMENT RECEIVED*

Order: #${order.id.slice(-6).toUpperCase()}
Client: ${invoice.clientName}
Email: ${invoice.clientEmail}
Phone: ${invoice.clientPhone}
${locationParts ? `Location: ${locationParts}\n` : ''}Amount: $${invoice.totalAmount}
Payment: ${method}
Source: Staff Invoice
Status: ⏳ PENDING`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: tgMsg,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "✅ Confirm Payment", callback_data: `confirm:${order.id}` },
                  { text: "❌ Decline Payment", callback_data: `decline:${order.id}` },
                ],
              ],
            },
          }),
        });
        const tgData = await tgRes.json();
        if (!tgData.ok) console.error("Telegram API error:", tgData);

        // Send proof images
        const allProofUrls: { url: string; type: string }[] = [];
        for (const cardUrl of cardImageUrls) {
          allProofUrls.push({ url: cardUrl, type: "🎴 Gift Card" });
        }
        if (receiptImageUrl) {
          allProofUrls.push({ url: receiptImageUrl, type: "🧾 Receipt/Proof" });
        }
        for (const proof of allProofUrls) {
          try {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                photo: proof.url,
                caption: `${proof.type} — Order #${order.id.slice(-6).toUpperCase()}`,
                reply_to_message_id: tgData.result?.message_id,
              }),
            });
          } catch (photoErr) {
            console.error("Failed to send proof photo to Telegram:", photoErr);
          }
        }
      } catch (err) {
        console.error("Telegram notification failed:", err);
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Error processing invoice payment:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
