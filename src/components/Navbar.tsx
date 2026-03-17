"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function Navbar() {
  const { items } = useCart();
  
  // Calculate total items in cart
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link href="/" className="logo">
          <img src="/logo.png" alt="Tranquil Luxe Massage" className="header-logo" />
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-button">Home</Link>
          <Link href="/prices" className="nav-button">Prices</Link>
          <Link href="/checkout" className="nav-button cart-button">
            <span>Cart & Checkout</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="cart-icon"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
}
