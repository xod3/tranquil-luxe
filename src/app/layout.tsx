import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../components/CartProvider";
import Navbar from "../components/Navbar";
import PetalsFalling from "../components/PetalsFalling";

export const metadata: Metadata = {
  title: "Tranquil Luxe Massage | Premium Experience",
  description: "Experience the ultimate relaxation with Tranquil Luxe Massage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <PetalsFalling />
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
