import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ isFirstTime: false }, { status: 400 });
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        clientEmail: email
      }
    });

    return NextResponse.json({ isFirstTime: !existingOrder });
  } catch (error) {
    console.error("Error checking customer history:", error);
    return NextResponse.json({ isFirstTime: false }, { status: 500 });
  }
}
