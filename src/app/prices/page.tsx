"use client";

import styles from "./prices.module.css";
import Link from "next/link";
import { useCart, CartItem } from "../../components/CartProvider";
import { useState } from "react";

export default function Prices() {
  const { addToCart } = useCart();
  const [addedMessage, setAddedMessage] = useState<string>("");

  const handleAddToCart = (item: CartItem) => {
    addToCart(item);
    setAddedMessage(`Added ${item.name} to cart!`);
    setTimeout(() => setAddedMessage(""), 3000);
  };

  const treatments = [
    { id: "t1", name: "60 Min - Full Body Relaxation", price: 150, duration: "60 mins", desc: "Deep relaxation massage designed to relieve stress and restore body balance.", category: "signature" },
    { id: "t2", name: "90 Min - Luxury Therapeutic", price: 220, duration: "90 mins", desc: "A complete body treatment combining relaxation and muscle therapy.", category: "signature" },
    { id: "t3", name: "120 Min - Elite Body Renewal", price: 300, duration: "120 mins", desc: "Our premium full-body session designed for deep muscle relief and total relaxation.", category: "signature" },
    
    { id: "s1", name: "Deep Tissue Therapy", price: 120, duration: "60 mins", desc: "Targets muscle knots and chronic tension.", category: "specialized" },
    { id: "s2", name: "Hot Stone Relaxation", price: 170, duration: "75 mins", desc: "Warm stones melt tension and promote deep relaxation.", category: "specialized" },
    { id: "s3", name: "Stress Relief Neck & Back", price: 100, duration: "45 mins", desc: "Focused therapy for upper body tension.", category: "specialized" },
    
    { id: "a1", name: "Aromatherapy oils", price: 25, duration: "", desc: "", category: "addon" },
    { id: "a2", name: "Hot towel treatment", price: 20, duration: "", desc: "", category: "addon" },
    { id: "a3", name: "Extended massage time (15 mins)", price: 30, duration: "", desc: "", category: "addon" }
  ];

  return (
    <div className={styles.pricesContainer}>
      {addedMessage && (
        <div style={{ position: 'fixed', top: '80px', right: '20px', background: 'var(--gold-primary)', color: 'white', padding: '1rem', borderRadius: '8px', zIndex: 1000, boxShadow: 'var(--shadow-md)' }}>
          {addedMessage}
        </div>
      )}

      <header className={styles.pricesHeader}>
        <div className="container text-center">
          <h1 className={styles.pageTitle}>Premium Massage Price List</h1>
          <p className={styles.pageSubtitle}>Velvet Touch Luxury Massage</p>
          <div className={styles.divider}></div>
          <p className={styles.tagline}>Relax. Restore. Rejuvenate.</p>
        </div>
      </header>

      <section className="container mt-8 mb-8">
        <div className={styles.menuWrapper}>
          
          <h2 className={styles.categoryTitle}>Signature Massage Treatments</h2>
          {treatments.filter(t => t.category === 'signature').map(item => (
            <div key={item.id} className={styles.menuItem}>
              <div className={styles.menuItemHeader}>
                <h3 className={styles.menuItemTitle}>
                  {item.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={styles.menuItemPrice}>${item.price}</span>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => handleAddToCart({ id: item.id, name: item.name, price: item.price, quantity: 1 })}>Add</button>
                </div>
              </div>
              <p className={styles.menuItemDesc}>{item.desc}</p>
            </div>
          ))}

          <div className={styles.dividerLarge}></div>

          <h2 className={styles.categoryTitle}>Specialized Treatments</h2>
          {treatments.filter(t => t.category === 'specialized').map(item => (
            <div key={item.id} className={styles.menuItem}>
              <div className={styles.menuItemHeader}>
                <h3 className={styles.menuItemTitle}>
                  {item.name} <span className={styles.duration}>({item.duration})</span>
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={styles.menuItemPrice}>${item.price}</span>
                  <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => handleAddToCart({ id: item.id, name: item.name, price: item.price, quantity: 1 })}>Add</button>
                </div>
              </div>
              <p className={styles.menuItemDesc}>{item.desc}</p>
            </div>
          ))}

          <div className={styles.dividerLarge}></div>

          <h2 className={styles.categoryTitle}>Add-On Enhancements</h2>
          <ul className={styles.addonList}>
            {treatments.filter(t => t.category === 'addon').map(item => (
              <li key={item.id} className={styles.addonItem}>
                <span>{item.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={styles.addonPrice}>${item.price}</span>
                  <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleAddToCart({ id: item.id, name: item.name, price: item.price, quantity: 1 })}>+</button>
                </div>
              </li>
            ))}
          </ul>

        </div>
      </section>

      <section className={styles.bookingSection}>
        <div className="container text-center">
          <h2 className="section-title" style={{ color: 'var(--white-pure)' }}>Booking Information</h2>
          <ul className={styles.bookingList}>
            <li><span className={styles.checkIcon}>✓</span> Appointments only</li>
            <li><span className={styles.checkIcon}>✓</span> Private and professional environment</li>
            <li><span className={styles.checkIcon}>✓</span> Message or call (562) 443-6439 to reserve your session</li>
          </ul>
          
          <Link href="/checkout" className="btn btn-primary mt-8">
            Complete Booking & Checkout
          </Link>
        </div>
      </section>
    </div>
  );
}
