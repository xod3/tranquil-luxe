"use client";

import { useCart } from "../../components/CartProvider";
import { useState, useEffect } from "react";
import styles from "./checkout.module.css";
import { useRouter } from "next/navigation";

export default function Checkout() {
  const { items, total, removeFromCart, clearCart } = useCart();
  const [method, setMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    country: "", state: "", city: "", zipCode: "", streetAddress: "",
    masseuseGender: "", masseuseBodyBuild: ""
  });

  const femaleBodyBuilds = ["Petite", "Slim", "Athletic", "Curvy", "Plus Size"];
  const maleBodyBuilds = ["Lean", "Athletic", "Muscular", "Average", "Built / Large"];
  const bodyBuildOptions = formData.masseuseGender === "Male" ? maleBodyBuilds : femaleBodyBuilds;
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [isFirstTime, setIsFirstTime] = useState(false);
  
  const isEasterPromoActive = new Date() <= new Date('2026-04-16T00:00:00Z');

  useEffect(() => {
    if (!formData.email || !formData.email.includes('@')) {
      setIsFirstTime(false);
      return;
    }
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-customer?email=${encodeURIComponent(formData.email)}`);
        if (res.ok) {
          const data = await res.json();
          setIsFirstTime(data.isFirstTime);
        }
      } catch (err) {}
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const discountAmount = (isEasterPromoActive && isFirstTime) ? total * 0.1 : 0;
  const finalTotal = total - discountAmount;

  const currencySymbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };
  const exchangeRates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79 };
  const displayTotal = (finalTotal * exchangeRates[currency]).toFixed(2);
  const sym = currencySymbols[currency];

  const [cardImages, setCardImages] = useState<File[]>([]);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);

  const handleAddCard = () => setCardImages([...cardImages, null as unknown as File]);
  const handleRemoveCard = (index: number) => setCardImages(cardImages.filter((_, i) => i !== index));
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const updated = [...cardImages];
      updated[index] = e.target.files[0];
      setCardImages(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) return alert("Please select a payment method.");
    if (items.length === 0) return alert("Your cart is empty.");
    if (!isConfirmed) return alert("Please confirm that the provided information is correct.");

    setIsSubmitting(true);
    
    try {
      // Create FormData to upload
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("country", formData.country);
      data.append("state", formData.state);
      data.append("city", formData.city);
      data.append("zipCode", formData.zipCode);
      data.append("streetAddress", formData.streetAddress);
      data.append("masseuseGender", formData.masseuseGender);
      data.append("masseuseBodyBuild", formData.masseuseBodyBuild);
      data.append("currency", currency);
      data.append("method", method);
      data.append("total", finalTotal.toString());
      if (discountAmount > 0) {
        data.append("discountInfo", "Easter 10% First-Time Promo");
      }
      
      
      cardImages.forEach((file, i) => {
        if (file) data.append(`cardImage_${i}`, file);
      });
      if (receiptImage) data.append("receiptImage", receiptImage);
      if (proofOfPayment) data.append("proofOfPayment", proofOfPayment);

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
              {discountAmount > 0 && (
                <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', color: '#D4AF37', fontWeight: 'bold' }}>
                  <span>🌸 Easter 10% Off Promo</span>
                  <span>-{sym}{(discountAmount * exchangeRates[currency]).toFixed(2)} {currency}</span>
                </div>
              )}
              <div className={styles.cartTotal}>
                <span>{discountAmount > 0 ? "Final Total" : "Total"}</span>
                <span>{sym}{displayTotal} {currency}</span>
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

            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1.5rem', color: 'var(--gold-dark)' }}>Masseuse Preference</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', marginTop: '-0.5rem' }}>Choose your ideal masseuse to personalize your experience.</p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Gender</label>
                <select required className="form-control" value={formData.masseuseGender} onChange={e => setFormData({...formData, masseuseGender: e.target.value, masseuseBodyBuild: ""})} style={{ cursor: 'pointer' }}>
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Body Build</label>
                <select required className="form-control" value={formData.masseuseBodyBuild} onChange={e => setFormData({...formData, masseuseBodyBuild: e.target.value})} style={{ cursor: 'pointer' }} disabled={!formData.masseuseGender}>
                  <option value="">{formData.masseuseGender ? 'Select Build' : 'Select gender first'}</option>
                  {formData.masseuseGender && bodyBuildOptions.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', marginTop: '2rem', marginBottom: '1.5rem', color: 'var(--gold-dark)' }}>Currency & Location</h2>
            
            <div className="form-group">
              <label className="form-label">Preferred Currency</label>
              <select className="form-control" value={currency} onChange={e => setCurrency(e.target.value)} style={{ cursor: 'pointer' }}>
                <option value="USD">🇺🇸 USD — US Dollar ($)</option>
                <option value="EUR">🇪🇺 EUR — Euro (€)</option>
                <option value="GBP">🇬🇧 GBP — British Pound (£)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <select required className="form-control" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} style={{ cursor: 'pointer' }}>
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="AU">Australia</option>

                <option value="GH">Ghana</option>
                <option value="ZA">South Africa</option>
                <option value="AE">United Arab Emirates</option>
                <option value="JP">Japan</option>
                <option value="BR">Brazil</option>
                <option value="MX">Mexico</option>
                <option value="IN">India</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
                <option value="NL">Netherlands</option>
                <option value="SE">Sweden</option>
                <option value="CH">Switzerland</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input type="text" required className="form-control" placeholder="123 Main Street, Apt 4B" value={formData.streetAddress} onChange={e => setFormData({...formData, streetAddress: e.target.value})} />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">City</label>
                <input type="text" required className="form-control" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">State / Province</label>
                <input type="text" required className="form-control" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Zip / Postal Code</label>
              <input type="text" required className="form-control" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} />
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
                    <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px', padding: '1rem', marginBottom: '1.2rem' }}>
                      <p style={{ margin: 0, fontWeight: 600, color: '#D4AF37' }}>⚠️ Important: Please scratch and reveal the PIN/code on your gift card before uploading. Unscratched cards cannot be validated and your booking will be declined.</p>
                    </div>
                    <p style={{ marginBottom: '1rem' }}>Upload clear images of your scratched Giftcard(s) (front showing the revealed PIN) and the original purchase receipt.</p>
                    
                    {cardImages.map((_, index) => (
                      <div className="form-group" key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <label className="form-label">Giftcard #{index + 1}</label>
                          <input type="file" required accept="image/*" className="form-control" onChange={e => handleCardChange(e, index)} />
                        </div>
                        {cardImages.length > 1 && (
                          <button type="button" onClick={() => handleRemoveCard(index)} style={{ background: 'transparent', border: 'none', color: '#ff4d4f', fontSize: '1.3rem', cursor: 'pointer', marginTop: '1.5rem' }}>✕</button>
                        )}
                      </div>
                    ))}
                    {cardImages.length === 0 && (
                      <div className="form-group">
                        <label className="form-label">Giftcard Image</label>
                        <input type="file" required accept="image/*" className="form-control" onChange={e => { if (e.target.files?.[0]) setCardImages([e.target.files[0]]); }} />
                      </div>
                    )}
                    <button type="button" onClick={handleAddCard} style={{ background: 'rgba(212,175,55,0.1)', border: '1px dashed rgba(212,175,55,0.4)', color: '#D4AF37', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1rem', width: '100%' }}>
                      + Add Another Giftcard
                    </button>
                    <div className="form-group">
                      <label className="form-label">Receipt Image</label>
                      <input type="file" required accept="image/*" className="form-control" onChange={e => { if (e.target.files?.[0]) setReceiptImage(e.target.files[0]); }} />
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ marginBottom: '1rem' }}>
                      {method === 'Cashapp' && <>Contact support at <a href="mailto:bookings@tranquilluxemassage.fit" style={{ color: '#D4AF37', fontWeight: 'bold', textDecoration: 'underline' }}>bookings@tranquilluxemassage.fit</a> for payment tags, or use other available payment options.</>}
                      {method === 'Crypto (BTC)' && <>Send BTC to wallet: <strong style={{ color: '#2e7d32' }}>bc1qarwn3k5wf844vtg4vt0wq0zar6llm5kafgazpw</strong><br/><div style={{ textAlign: 'center', marginTop: '1rem' }}><img src="/btc-qr.png" alt="BTC QR Code" style={{ maxWidth: '220px', borderRadius: '12px', display: 'inline-block' }} /></div></>}
                      {method === 'Zelle' && <>Contact support at <a href="mailto:bookings@tranquilluxemassage.fit" style={{ color: '#D4AF37', fontWeight: 'bold', textDecoration: 'underline' }}>bookings@tranquilluxemassage.fit</a> for payment tags, or use other available payment options.</>}
                    </p>
                    <div className="form-group">
                      <label className="form-label">Upload Proof of Payment (Screenshot)</label>
                      <input type="file" required accept="image/*" className="form-control" onChange={e => { if (e.target.files?.[0]) setProofOfPayment(e.target.files[0]); }} />
                    </div>
                  </>
                )}
              </div>
            )}

            <div style={{ marginTop: '2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="confirmInfo" 
                required 
                checked={isConfirmed}
                onChange={e => setIsConfirmed(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--gold-primary)', cursor: 'pointer' }}
              />
              <label htmlFor="confirmInfo" style={{ cursor: 'pointer', userSelect: 'none', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                I confirm the provided information is correct
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting || items.length === 0 || !isConfirmed}>
              {isSubmitting ? "Processing..." : `Complete Booking (${sym}${displayTotal} ${currency})`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
