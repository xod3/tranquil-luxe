"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./invoice.module.css";
import { use } from "react";

type InvoiceItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type InvoiceData = {
  id: string;
  token: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  staffNote: string | null;
  items: InvoiceItem[];
  totalAmount: number;
  depositAmount: number | null;
  currency: string;
  status: string;
  createdAt: string;
  expiresAt: string | null;
};

export default function InvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [formData, setFormData] = useState({
    country: "", state: "", city: "", zipCode: "", streetAddress: "",
    masseuseGender: "", masseuseBodyBuild: "",
  });

  const femaleBodyBuilds = ["Petite", "Slim", "Athletic", "Curvy", "Plus Size"];
  const maleBodyBuilds = ["Lean", "Athletic", "Muscular", "Average", "Built / Large"];
  const bodyBuildOptions = formData.masseuseGender === "Male" ? maleBodyBuilds : femaleBodyBuilds;

  const [cardImages, setCardImages] = useState<File[]>([]);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [proofOfPayment, setProofOfPayment] = useState<File | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    fetch(`/api/invoices/${token}`)
      .then(res => {
        if (!res.ok) throw new Error("Invoice not found");
        return res.json();
      })
      .then(data => {
        setInvoice(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const handleAddCard = () => setCardImages([...cardImages, null as unknown as File]);
  const handleRemoveCard = (index: number) => setCardImages(cardImages.filter((_, i) => i !== index));
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const updated = [...cardImages];
      updated[index] = e.target.files[0];
      setCardImages(updated);
    }
  };

  const currencySymbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£" };
  const exchangeRates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79 };
  const sym = invoice ? (currencySymbols[invoice.currency] || "$") : "$";
  const rate = invoice ? (exchangeRates[invoice.currency] || 1) : 1;
  const displayTotal = invoice ? (invoice.totalAmount * rate).toFixed(2) : "0.00";
  const amountDue = invoice?.depositAmount ? (invoice.depositAmount * rate).toFixed(2) : displayTotal;
  const isDeposit = invoice?.depositAmount != null && invoice.depositAmount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method) return alert("Please select a payment method.");
    if (!isConfirmed) return alert("Please confirm the information is correct.");

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("method", method);
      data.append("country", formData.country);
      data.append("state", formData.state);
      data.append("city", formData.city);
      data.append("zipCode", formData.zipCode);
      data.append("streetAddress", formData.streetAddress);
      data.append("masseuseGender", formData.masseuseGender);
      data.append("masseuseBodyBuild", formData.masseuseBodyBuild);

      cardImages.forEach((file, i) => {
        if (file) data.append(`cardImage_${i}`, file);
      });
      if (receiptImage) data.append("receiptImage", receiptImage);
      if (proofOfPayment) data.append("proofOfPayment", proofOfPayment);

      const res = await fetch(`/api/invoices/${token}/pay`, {
        method: "POST",
        body: data,
      });

      if (res.ok) {
        router.push("/thank-you");
      } else {
        const result = await res.json();
        alert(result.error || "Payment submission failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className={`container ${styles.invoiceContainer}`}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p style={{ color: 'var(--text-muted)' }}>Loading your invoice...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error || !invoice) {
    return (
      <div className={`container ${styles.invoiceContainer}`}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>❌</div>
          <h2>Invoice Not Found</h2>
          <p style={{ color: 'var(--text-muted)' }}>This invoice link may be invalid or has expired. Please contact us for assistance.</p>
        </div>
      </div>
    );
  }

  // Expired
  if (invoice.status === "expired") {
    return (
      <div className={`container ${styles.invoiceContainer}`}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⏰</div>
          <h2>Invoice Expired</h2>
          <p style={{ color: 'var(--text-muted)' }}>This invoice has expired. Please contact us to request a new one.</p>
        </div>
      </div>
    );
  }

  // Already paid
  if (invoice.status === "paid") {
    return (
      <div className={`container ${styles.invoiceContainer}`}>
        <div className={styles.paidState}>
          <div className={styles.paidIcon}>✅</div>
          <h2>Invoice Already Paid</h2>
          <p>This invoice has been submitted successfully. Our team is reviewing your payment and will reach out shortly.</p>
        </div>
      </div>
    );
  }

  // Payment success
  if (paymentSuccess) {
    return (
      <div className={`container ${styles.invoiceContainer}`}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>🎉</div>
          <h2 style={{ color: '#F3E5AB' }}>Payment Submitted!</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '450px' }}>
            Thank you, {invoice.clientName}. Your payment is being reviewed by our team. 
            We&apos;ll send a confirmation to <strong style={{ color: '#D4AF37' }}>{invoice.clientEmail}</strong> once verified.
          </p>
        </div>
      </div>
    );
  }

  const items: InvoiceItem[] = Array.isArray(invoice.items) ? invoice.items : [];

  return (
    <div className={`container ${styles.invoiceContainer}`}>
      {/* Header */}
      <div className={styles.invoiceHeader}>
        <div className={styles.invoiceBadge}>Invoice</div>
        <h1 className={styles.invoiceTitle}>Your Booking Summary</h1>
        <p className={styles.invoiceMeta}>
          Prepared for <strong style={{ color: '#F3E5AB' }}>{invoice.clientName}</strong> • {new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className={styles.invoiceGrid}>
        {/* Left — Summary */}
        <div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryHeader}>
              <h2>Services Booked</h2>
            </div>
            <ul className={styles.servicesList}>
              {items.map((item, i) => (
                <li key={i} className={styles.serviceItem}>
                  <div>
                    <span className={styles.serviceName}>{item.name}</span>
                    {item.quantity > 1 && <span className={styles.serviceQty}>×{item.quantity}</span>}
                  </div>
                  <span className={styles.servicePrice}>${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className={styles.totalRow}>
              {isDeposit ? (
                <>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Booking Total</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'line-through' }}>{sym}{displayTotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={styles.totalLabel}>Deposit Due Now</span>
                      <span className={styles.totalValue}>{sym}{amountDue} {invoice.currency}</span>
                    </div>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '0.5rem', marginBottom: 0 }}>
                      Remaining balance of {sym}{((invoice.totalAmount - (invoice.depositAmount || 0)) * rate).toFixed(2)} due at time of service
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <span className={styles.totalLabel}>Total Due</span>
                  <span className={styles.totalValue}>{sym}{displayTotal} {invoice.currency}</span>
                </>
              )}
            </div>
          </div>

          {invoice.staffNote && (
            <div className={styles.staffNote}>
              <p className={styles.noteLabel}>Note from our team</p>
              <p>{invoice.staffNote}</p>
            </div>
          )}

          <div className={styles.customerInfo}>
            <h3>Your Details</h3>
            <div className={styles.customerDetail}>📧 <span>{invoice.clientEmail}</span></div>
            <div className={styles.customerDetail}>📞 <span>{invoice.clientPhone}</span></div>
          </div>
        </div>

        {/* Right — Payment Form */}
        <div>
          <form className="card" onSubmit={handleSubmit}>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--gold-dark)' }}>Complete Your Payment</h2>

            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--gold-dark)' }}>Masseuse Preference</h3>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Gender</label>
                <select required className="form-control" value={formData.masseuseGender} onChange={e => setFormData({...formData, masseuseGender: e.target.value, masseuseBodyBuild: ""})} style={{ cursor: 'pointer' }}>
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Body Build</label>
                <select required className="form-control" value={formData.masseuseBodyBuild} onChange={e => setFormData({...formData, masseuseBodyBuild: e.target.value})} style={{ cursor: 'pointer' }} disabled={!formData.masseuseGender}>
                  <option value="">{formData.masseuseGender ? 'Select Build' : 'Select gender first'}</option>
                  {formData.masseuseGender && bodyBuildOptions.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--gold-dark)' }}>Your Location</h3>
            
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

            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.1rem', marginTop: '2rem', marginBottom: '1rem', color: 'var(--gold-dark)' }}>Payment Method</h3>

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

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting || !isConfirmed}>
              {isSubmitting ? "Processing..." : isDeposit ? `Submit Deposit (${sym}${amountDue} ${invoice.currency})` : `Submit Payment (${sym}${displayTotal} ${invoice.currency})`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
