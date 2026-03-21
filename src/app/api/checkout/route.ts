import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = "birminghampandg@gmail.com";

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
        status: "pending"
      }
    });

    // Handle File Uploads via Vercel Blob
    let cardImageUrl = null;
    let receiptImageUrl = null;

    if (method === "Giftcard") {
      const cardFile = data.get("cardImage") as File;
      const receiptFile = data.get("receiptImage") as File;

      if (cardFile) {
        const { url } = await put(`${order.id}-card-${cardFile.name}`, cardFile, { access: 'public' });
        cardImageUrl = url;
      }

      if (receiptFile) {
        const { url } = await put(`${order.id}-receipt-${receiptFile.name}`, receiptFile, { access: 'public' });
        receiptImageUrl = url;
      }
    } else {
      const proofFile = data.get("proofOfPayment") as File;
      if (proofFile) {
        const { url } = await put(`${order.id}-proof-${proofFile.name}`, proofFile, { access: 'public' });
        receiptImageUrl = url;
      }
    }

    // Create Proof record
    await prisma.paymentProof.create({
      data: {
        orderId: order.id,
        cardImageUrl,
        receiptImageUrl
      }
    });

    // Send admin notification email (async, don't block response)
    const locationParts = [streetAddress, city, state, zipCode, country].filter(Boolean).join(', ');
    resend.emails.send({
      from: "Tranquil Luxe Bookings <bookings@tranquilluxemassage.fit>",
      to: ADMIN_EMAIL,
      subject: `🔔 New Order #${order.id.slice(-6).toUpperCase()} — $${totalAmount} via ${method}`,
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

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Error processing checkout:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
