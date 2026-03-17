import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const phone = data.get("phone") as string;
    const method = data.get("method") as string;
    const totalAmount = parseFloat(data.get("total") as string);

    // Save to DB
    const order = await prisma.order.create({
      data: {
        clientName: name,
        clientEmail: email,
        clientPhone: phone,
        totalAmount,
        paymentMethod: method,
        status: "pending"
      }
    });

    // Handle File Uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    let cardImageUrl = null;
    let receiptImageUrl = null;

    if (method === "Giftcard") {
      const cardFile = data.get("cardImage") as File;
      const receiptFile = data.get("receiptImage") as File;

      if (cardFile) {
        const bytes = await cardFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${order.id}-card-${cardFile.name}`;
        await writeFile(path.join(uploadDir, fileName), buffer);
        cardImageUrl = `/uploads/${fileName}`;
      }

      if (receiptFile) {
        const bytes = await receiptFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${order.id}-receipt-${receiptFile.name}`;
        await writeFile(path.join(uploadDir, fileName), buffer);
        receiptImageUrl = `/uploads/${fileName}`;
      }
    } else {
      const proofFile = data.get("proofOfPayment") as File;
      if (proofFile) {
        const bytes = await proofFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${order.id}-proof-${proofFile.name}`;
        await writeFile(path.join(uploadDir, fileName), buffer);
        receiptImageUrl = `/uploads/${fileName}`; // Using receiptImageUrl for proof as well conceptually
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
