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

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const phone = data.get("phone") as string;
    const country = data.get("country") as string;
    const state = data.get("state") as string;
    const city = data.get("city") as string;
    const zipCode = data.get("zipCode") as string;
    const streetAddress = data.get("streetAddress") as string;
    const currency = data.get("currency") as string || "USD";
    const method = data.get("method") as string;
    const totalAmount = parseFloat(data.get("total") as string);
    const masseuseGender = data.get("masseuseGender") as string || null;
    const masseuseBodyBuild = data.get("masseuseBodyBuild") as string || null;

    // Save to DB
    const order = await prisma.order.create({
      data: {
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        clientCountry: country,
        clientState: state,
        clientCity: city,
        clientZipCode: zipCode,
        clientStreetAddress: streetAddress,
        currency,
        totalAmount,
        paymentMethod: method,
        masseuseGender,
        masseuseBodyBuild,
        status: "pending"
      }
    });

    // Handle File Uploads via Vercel Blob
    const cardImageUrls: string[] = [];
    let receiptImageUrl = null;

    if (method === "Giftcard") {
      // Handle multiple card images
      for (const [key, value] of data.entries()) {
        if (key.startsWith("cardImage_") && value instanceof File && value.size > 0) {
          const { url } = await put(`${order.id}-card-${key}-${value.name}`, value, { access: 'public' });
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

    // Create Proof records (one per card, or one for other methods)
    if (cardImageUrls.length > 0) {
      for (const cardUrl of cardImageUrls) {
        await prisma.paymentProof.create({
          data: {
            orderId: order.id,
            cardImageUrl: cardUrl,
            receiptImageUrl
          }
        });
      }
    } else {
      await prisma.paymentProof.create({
        data: {
          orderId: order.id,
          cardImageUrl: null,
          receiptImageUrl
        }
      });
    }

    // Send admin notification email (async, don't block response)
    const locationParts = [streetAddress, city, state, zipCode, country].filter(Boolean).join(', ');
    resend.emails.send({
      from: "Tranquil Luxe Bookings <bookings@tranquilluxemassage.fit>",
      to: ADMIN_EMAIL,
      replyTo: "bookings@tranquilluxemassage.fit",
      subject: `New Order #${order.id.slice(-6).toUpperCase()} - $${totalAmount} via ${method}`,
      text: `New order received.\n\nOrder: #${order.id.slice(-6).toUpperCase()}\nClient: ${name}\nEmail: ${email}\nPhone: ${phone}\n${locationParts ? `Location: ${locationParts}\n` : ''}${masseuseGender ? `Masseuse: ${masseuseGender}${masseuseBodyBuild ? ` (${masseuseBodyBuild})` : ''}\n` : ''}Amount: $${totalAmount} ${currency !== 'USD' ? `(${currency})` : ''}\nPayment: ${method}\nStatus: PENDING\n\nReview at: https://tranquilluxemassage.fit/admin`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A1A1A; border: 1px solid #333; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #D4AF37, #AA8C2C); padding: 20px 30px; text-align: center;">
            <h1 style="margin: 0; color: #111; font-size: 22px;">🔔 New Booking Received</h1>
          </div>
          <div style="padding: 30px; color: #E8E0D0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
              <tr><td style="padding: 8px 0; color: #A89F8F;">Order ID</td><td style="padding: 8px 0; font-weight: bold; color: #F3E5AB;">#${order.id.slice(-6).toUpperCase()}</td></tr>
              <tr><td style="padding: 8px 0; color: #A89F8F;">Client</td><td style="padding: 8px 0;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #A89F8F;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #D4AF37;">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #A89F8F;">Phone</td><td style="padding: 8px 0;">${phone}</td></tr>
              ${locationParts ? `<tr><td style="padding: 8px 0; color: #A89F8F;">Location</td><td style="padding: 8px 0;">${locationParts}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; color: #A89F8F;">Amount</td><td style="padding: 8px 0; font-weight: bold; color: #D4AF37; font-size: 18px;">$${totalAmount} ${currency !== 'USD' ? `(${currency})` : ''}</td></tr>
              <tr><td style="padding: 8px 0; color: #A89F8F;">Payment</td><td style="padding: 8px 0;">${method}</td></tr>
              ${masseuseGender ? `<tr><td style="padding: 8px 0; color: #A89F8F;">Masseuse Pref</td><td style="padding: 8px 0;"><span style="color: #F3E5AB; font-weight: bold;">${masseuseGender}${masseuseBodyBuild ? ` — ${masseuseBodyBuild}` : ''}</span></td></tr>` : ''}
              <tr><td style="padding: 8px 0; color: #A89F8F;">Status</td><td style="padding: 8px 0;"><span style="background: #f59e0b; color: #111; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: bold;">PENDING</span></td></tr>
            </table>
            <div style="margin-top: 25px; text-align: center;">
              <a href="https://tranquilluxemassage.fit/admin" style="display: inline-block; background: linear-gradient(135deg, #F3E5AB, #D4AF37); color: #111; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px;">Review & Confirm Order →</a>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 12px; text-align: center;">This is an automated notification from Tranquil Luxe Massage.</p>
          </div>
        </div>
      `,
    }).catch(err => console.error("Admin notification email failed:", err));

    // Send Telegram notification (async, don't block response)
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const tgMsg = `NEW ORDER RECEIVED

Order: #${order.id.slice(-6).toUpperCase()}
Client: ${name}
Email: ${email}
Phone: ${phone}
${locationParts ? `Location: ${locationParts}\n` : ''}${masseuseGender ? `Masseuse: ${masseuseGender}${masseuseBodyBuild ? ` (${masseuseBodyBuild})` : ''}\n` : ''}Amount: ${totalAmount} USD ${currency !== 'USD' ? `(${currency})` : ''}
Payment: ${method}
Status: PENDING

Review: https://tranquilluxemassage.fit/admin`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: tgMsg,
          }),
        });
        const tgData = await tgRes.json();
        if (!tgData.ok) console.error("Telegram API error:", tgData);
      } catch (err) {
        console.error("Telegram notification failed:", err);
      }
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Error processing checkout:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
