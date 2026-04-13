import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../components/CartProvider";
import Navbar from "../components/Navbar";
import PetalsFalling from "../components/PetalsFalling";
import LeadCapturePopup from "../components/LeadCapturePopup";
import WhatsAppChat from "../components/WhatsAppChat";

const SITE_URL = "https://www.tranquilluxemassage.fit";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tranquil Luxe Massage | Private Luxury In-Home Massage Services",
    template: "%s | Tranquil Luxe Massage",
  },
  description: "Experience the ultimate in private, luxury in-home massage. Our elite male and female specialists deliver sensual relaxation, deep tissue therapy, hot stone treatments & more — directly to your door. By appointment only.",
  keywords: [
    "luxury massage", "private massage", "in-home massage", "sensual massage",
    "deep tissue massage", "hot stone massage", "couples massage",
    "mobile massage service", "private masseuse", "luxury spa experience",
    "body massage", "relaxation massage", "therapeutic massage",
    "elite massage", "discreet massage service"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Tranquil Luxe Massage",
    title: "Tranquil Luxe Massage | Private Luxury In-Home Massage",
    description: "Elite private massage services delivered to your door. Sensual relaxation, deep tissue, hot stone & more. Male and female specialists available worldwide.",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
        alt: "Tranquil Luxe Massage - Premium Private Massage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tranquil Luxe Massage | Private Luxury In-Home Massage",
    description: "Elite private massage services delivered to your door. Sensual relaxation, deep tissue, hot stone & more.",
    images: [`${SITE_URL}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#business`,
      name: "Tranquil Luxe Massage",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      image: `${SITE_URL}/logo.png`,
      description: "Premium private in-home massage services. Elite male and female specialists delivering luxury sensual relaxation, deep tissue therapy, and more.",
      email: "bookings@tranquilluxemassage.fit",
      priceRange: "$$$",
      areaServed: "Worldwide",
      serviceType: "Mobile Massage Therapy",
      sameAs: [],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5",
        reviewCount: "8",
        bestRating: "5",
      },
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}/#services`,
      name: "Private Luxury Massage",
      provider: { "@id": `${SITE_URL}/#business` },
      serviceType: "Massage Therapy",
      description: "Premium in-home massage treatments including full body relaxation, deep tissue, hot stone, sensual massage, and couples experiences.",
      offers: [
        { "@type": "Offer", name: "60 Min Full Body Relaxation", price: "150", priceCurrency: "USD" },
        { "@type": "Offer", name: "90 Min Luxury Therapeutic", price: "220", priceCurrency: "USD" },
        { "@type": "Offer", name: "120 Min Elite Body Renewal", price: "300", priceCurrency: "USD" },
        { "@type": "Offer", name: "Deep Tissue Therapy", price: "120", priceCurrency: "USD" },
        { "@type": "Offer", name: "Hot Stone Relaxation", price: "170", priceCurrency: "USD" },
        { "@type": "Offer", name: "Sensual Massage", price: "220", priceCurrency: "USD" },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Tranquil Luxe Massage",
      publisher: { "@id": `${SITE_URL}/#business` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <CartProvider>
          <Navbar />
          <PetalsFalling />
          <LeadCapturePopup />
          <WhatsAppChat />
          <main>{children}</main>
          <footer className="footer">
            <div className="container text-center">
              <p>&copy; {new Date().getFullYear()} Tranquil Luxe Massage. All rights reserved.</p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
