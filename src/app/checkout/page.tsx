"use client";

import { useCart } from "../../components/CartProvider";
import { useState } from "react";
import styles from "./checkout.module.css";
import { useRouter } from "next/navigation";

export default function Checkout() {
  const { items, total, removeFromCart, clearCart } = useCart();
  const [method, setMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
  });

  const [fileData, setFileData] = useState({
    cardImage: null as File | null,
    receiptImage: null as File | null,
    proofOfPayment: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      setFileData({ ...fileData, [type]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) return alert("Please select a payment method.");
    if (items.length === 0) return alert("Your cart is empty.");

    setIsSubmitting(true);
    
    try {
      // Create FormData to upload
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("method", method);
      data.append("total", total.toString());
      
      if (fileData.cardImage) data.append("cardImage", fileData.cardImage);
      if (fileData.receiptImage) data.append("receiptImage", fileData.receiptImage);
      if (fileData.proofOfPayment) data.append("proofOfPayment", fileData.proofOfPayment);

      const res = await fetch("/api/checkout", {
        method: "POST",
        body: data
      });

      if (res.ok) {
        clearCart();
        alert("Booking request sent! Waiting for payment confirmation.");
        router.push("/");
      } else {
        alert("Submission failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-8 mb-8" style={{ minHeight: '80vh', paddingTop: '80px' }}>
      <h1 className="section-title">Checkout & Booking</h1>

      <div className={styles.checkoutGrid}>
        <div className={styles.cartSection}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--gold-dark)' }}>Your Selection</h2>
          {items.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <ul className={styles.cartList}>
                {items.map(item => (
                  <li key={item.id} className={styles.cartItem}>
                    <div>
                      <h4 style={{ margin: 0 }}>{item.name}</h4>
                      <small>Qty: {item.quantity}</small>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={styles.price}>${item.price * item.quantity}</span>
                      <button onClick={() => removeFromCart(item.id)} className={styles.removeBtn}>✕</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className={styles.cartTotal}>
                <span>Total</span>
                <span>${total}</span>
              </div>
            </>
          )}
        </div>

        <div className={styles.formSection}>
          <form className="card" onSubmit={handleSubmit}>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--gold-dark)' }}>Client Details</h2>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" required className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" required className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" required className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', marginTop: '3rem', marginBottom: '1.5rem', color: 'var(--gold-dark)' }}>Payment Options</h2>
            
            <div className={styles.paymentMethods}>
              {['Cashapp', 'Crypto (BTC)', 'Zelle', 'Giftcard'].map((m) => (
                <label key={m} className={`${styles.methodCard} ${method === m ? styles.selectedMethod : ''}`}>
                  <input type="radio" name="paymentMethod" value={m} onChange={() => setMethod(m)} style={{ display: 'none' }} />
                  {m}
                </label>
              ))}
            </div>

            {method && (
              <div className={styles.paymentInstructions}>
                {method === 'Giftcard' ? (
                  <>
                    <p style={{ marginBottom: '1rem' }}>Please upload images of your physical Giftcard (front and back/pin if needed) and the original receipt.</p>
                    <div className="form-group">
                      <label className="form-label">Giftcard Image</label>
                      <input type="file" required accept="image/*" className="form-control" onChange={e => handleFileChange(e, "cardImage")} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Receipt Image</label>
                      <input type="file" required accept="image/*" className="form-control" onChange={e => handleFileChange(e, "receiptImage")} />
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ marginBottom: '1rem' }}>
                      {method === 'Cashapp' && "Send to $TranquilLuxe. Include your name in the notes."}
                      {method === 'Crypto (BTC)' && "Send BTC to wallet: 1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"}
                      {method === 'Zelle' && "Send Zelle payment to payments@tranquilluxe.com"}
                    </p>
                    <div className="form-group">
                      <label className="form-label">Upload Proof of Payment (Screenshot)</label>
                      <input type="file" required accept="image/*" className="form-control" onChange={e => handleFileChange(e, "proofOfPayment")} />
                    </div>
                  </>
                )}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }} disabled={isSubmitting || items.length === 0}>
              {isSubmitting ? "Processing..." : `Complete Booking ($${total})`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
