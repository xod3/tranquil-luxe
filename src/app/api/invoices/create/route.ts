import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tranquilluxemassage.fit";

export async function POST(request: Request) {
  try {
    const { clientName, clientEmail, clientPhone, items, staffNote, currency, depositAmount } = await request.json();

    if (!clientName || !clientEmail || !clientPhone || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );

    const invoice = await prisma.invoice.create({
      data: {
        clientName,
        clientEmail,
        clientPhone,
        staffNote: staffNote || null,
        items,
        totalAmount,
        depositAmount: depositAmount && depositAmount > 0 && depositAmount < totalAmount ? depositAmount : null,
        currency: currency || "USD",
        status: "unpaid",
      },
    });

    const invoiceUrl = `${SITE_URL}/invoice/${invoice.token}`;

    // Send email to customer with their invoice link
    if (process.env.RESEND_API_KEY) {
      resend.emails.send({
        from: "Tranquil Luxe Massage <bookings@tranquilluxemassage.fit>",
        to: clientEmail,
        replyTo: "bookings@tranquilluxemassage.fit",
        subject: `Your Booking Invoice — Tranquil Luxe Massage`,
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A1A1A; border: 1px solid #333; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #D4AF37, #AA8C2C); padding: 20px 30px; text-align: center;">
              <h1 style="margin: 0; color: #111; font-size: 22px;">✨ Your Booking Invoice</h1>
            </div>
            <div style="padding: 30px; color: #E8E0D0;">
              <p>Dear ${clientName},</p>
              <p>A booking has been prepared for you by our team. Please review your invoice and complete your payment at your convenience.</p>
              
              <div style="background: rgba(212,175,55,0.08); border: 1px solid rgba(212,175,55,0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
                ${invoice.depositAmount ? `
                  <p style="margin: 0 0 5px; color: #A89F8F; font-size: 0.85rem;">Deposit Required</p>
                  <p style="margin: 0; font-size: 1.8rem; font-weight: bold; color: #F3E5AB;">$${invoice.depositAmount.toFixed(2)}</p>
                  <p style="margin: 8px 0 0; color: #7A7060; font-size: 0.8rem;">Total booking value: $${totalAmount.toFixed(2)} — remaining balance due at time of service</p>
                ` : `
                  <p style="margin: 0 0 5px; color: #A89F8F; font-size: 0.85rem;">Invoice Total</p>
                  <p style="margin: 0; font-size: 1.8rem; font-weight: bold; color: #F3E5AB;">$${totalAmount.toFixed(2)}</p>
                `}
              </div>

              ${staffNote ? `<p style="color: #A89F8F; font-style: italic; border-left: 3px solid #D4AF37; padding-left: 12px;">"${staffNote}"</p>` : ''}

              <div style="margin-top: 25px; text-align: center;">
                <a href="${invoiceUrl}" style="display: inline-block; background: linear-gradient(135deg, #F3E5AB, #D4AF37); color: #111; padding: 14px 40px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">View Invoice & Pay →</a>
              </div>

              <p style="margin-top: 25px; color: #666; font-size: 12px; text-align: center;">If you have any questions, reach us at bookings@tranquilluxemassage.fit</p>
            </div>
          </div>
        `,
      }).catch(err => console.error("Invoice email failed:", err));
    }

    return NextResponse.json({ success: true, invoiceUrl, invoiceId: invoice.id, token: invoice.token });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
