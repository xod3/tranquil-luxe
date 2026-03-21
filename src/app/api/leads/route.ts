import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, source } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // Get visitor IP from headers
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "unknown";

    // Geolocate using free IP API
    let city = null, region = null, country = null;
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country`);
      if (geoRes.ok) {
        const geo = await geoRes.json();
        city = geo.city || null;
        region = geo.regionName || null;
        country = geo.country || null;
      }
    } catch {
      // Geolocation failed silently — still save lead
    }

    // Check for duplicate email
    const existing = await (prisma as any).lead.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: true, message: "Already captured" });
    }

    await (prisma as any).lead.create({
      data: { name, email, ip, city, region, country, source: source || "popup" }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const leads = await (prisma as any).lead.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json([], { status: 500 });
  }
}
