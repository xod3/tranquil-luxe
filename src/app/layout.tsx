import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../components/CartProvider";

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
          <nav className="navbar">
            <div className="container nav-content">
              <a href="/" className="logo">
                <img src="/logo.png" alt="Tranquil Luxe Massage" className="header-logo" />
              </a>
              <div className="nav-links">
                <a href="/">Home</a>
                <a href="/prices">Prices</a>
                <a href="/checkout">Cart & Checkout</a>
              </div>
            </div>
          </nav>
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
