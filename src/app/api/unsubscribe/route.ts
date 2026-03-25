import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    await prisma.unsubscribedContact.upsert({
      where: { email: normalizedEmail },
      update: {},
      create: { email: normalizedEmail }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unsubscribe Error:", error);
    return NextResponse.json({ error: "Failed to process unsubscribe request" }, { status: 500 });
  }
}
