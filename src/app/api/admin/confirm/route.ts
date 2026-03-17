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
    const { orderId, action, adminNote } = await request.json();

    if (!orderId || !action) {
      return NextResponse.json({ error: "Order ID and action are required" }, { status: 400 });
    }

    const isConfirming = action === 'confirm';
    const confirmedCode = isConfirming ? generateCode() : null;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: isConfirming ? "confirmed" : "declined",
        paymentConfirmedCode: confirmedCode,
        adminNote: adminNote || null,
      }
    });

    // Send email
    if (process.env.RESEND_API_KEY) {
      const subject = isConfirming 
        ? 'Booking Confirmed - Tranquil Luxe Massage' 
        : 'Booking Declined - Tranquil Luxe Massage';
        
      let htmlContent = '';
      
      if (isConfirming) {
        htmlContent = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #EAEAEA; border-radius: 8px;">
            <h1 style="color: #AA8C2C; text-align: center;">Payment Confirmed</h1>
            <p>Dear ${order.clientName},</p>
            <p>Your payment of <strong>$${order.totalAmount}</strong> has been successfully confirmed!</p>
            <div style="background-color: rgba(212, 175, 55, 0.05); padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0;">
              <p style="margin: 0; font-size: 1.2rem;"><strong>Your Confirmation Code is:</strong> <span style="color: #AA8C2C;">${confirmedCode}</span></p>
            </div>
            ${adminNote ? `<p><strong>Note from Admin:</strong> ${adminNote}</p>` : ''}
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
              <p style="margin: 0; font-size: 1rem;"><strong>Reason for Decline:</strong> <span style="color: #D32F2F;">${adminNote}</span></p>
            </div>
            <p>If you believe this is an error, please ensure you uploaded the correct images or contact us at <strong>(562) 443-6439</strong>.</p>
            <p>You may submit a new booking on our website.</p>
            <br/>
            <p style="font-size: 0.9em; color: #666;">Tranquil Luxe Massage.</p>
          </div>
        `;
      }

      await resend.emails.send({
        from: 'Tranquil Luxe Massage <bookings@tranquilluxe.com>',
        to: order.clientEmail,
        subject,
        html: htmlContent
      });
    } else {
      console.log("RESEND_API_KEY not found. Simulating email send to", order.clientEmail);
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
