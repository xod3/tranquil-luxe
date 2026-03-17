import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const phone = data.get("phone") as string;
    const address = data.get("address") as string;
    const city = data.get("city") as string;
    const state = data.get("state") as string;
    const method = data.get("method") as string;
    const totalAmount = parseFloat(data.get("total") as string);

    // Save to DB
    const order = await prisma.order.create({
      data: {
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        clientAddress: address,
        clientCity: city,
        clientState: state,
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
        receiptImageUrl = url; // Using receiptImageUrl for proof as well conceptually
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

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Error processing checkout:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
