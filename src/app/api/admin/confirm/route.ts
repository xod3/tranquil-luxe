import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY || "fallback_key_for_dev");

function generateCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TXN-${result}`;
}

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const confirmedCode = generateCode();

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "confirmed",
        paymentConfirmedCode: confirmedCode,
      }
    });

    // Send confirmation email
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Tranquil Luxe Massage <bookings@tranquilluxe.com>',
        to: order.clientEmail,
        subject: 'Booking Confirmed - Tranquil Luxe Massage',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EAEAEA; border-radius: 8px;">
            <h1 style="color: #AA8C2C; text-align: center;">Payment Confirmed</h1>
            <p>Dear ${order.clientName},</p>
            <p>Your payment of <strong>$${order.totalAmount}</strong> has been successfully confirmed!</p>
            <div style="background-color: rgba(212, 175, 55, 0.05); padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0;">
              <p style="margin: 0; font-size: 1.2rem;"><strong>Your Confirmation Code is:</strong> <span style="color: #AA8C2C;">${confirmedCode}</span></p>
            </div>
            <p>Please keep this code safe. We will contact you at <strong>${order.clientPhone}</strong> shortly to finalize your appointment time.</p>
            <p>Thank you for choosing Tranquil Luxe Massage.</p>
            <br/>
            <p style="font-size: 0.9em; color: #666;">Relax. Restore. Rejuvenate.</p>
          </div>
        `
      });
    } else {
      console.log("RESEND_API_KEY not found. Simulating email send:", confirmedCode, "to", order.clientEmail);
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
