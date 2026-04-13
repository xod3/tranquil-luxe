"use client";

import { useState } from "react";

const treatments = [
  { id: "t1", name: "60 Min - Full Body Relaxation", price: 150, category: "signature" },
  { id: "t2", name: "90 Min - Luxury Therapeutic", price: 220, category: "signature" },
  { id: "t3", name: "120 Min - Elite Body Renewal", price: 300, category: "signature" },
  { id: "s1", name: "Deep Tissue Therapy", price: 120, category: "specialized" },
  { id: "s2", name: "Hot Stone Relaxation", price: 170, category: "specialized" },
  { id: "s3", name: "Stress Relief Neck & Back", price: 100, category: "specialized" },
  { id: "s4", name: "Sensual Massage", price: 220, category: "specialized" },
  { id: "a1", name: "Aromatherapy oils", price: 25, category: "addon" },
  { id: "a2", name: "Hot towel treatment", price: 20, category: "addon" },
  { id: "a3", name: "Extended massage time (15 mins)", price: 30, category: "addon" },
  { id: "a4", name: "Additional Masseuse", price: 250, category: "addon" },
];

type SelectedItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function CreateInvoice() {
  const [isOpen, setIsOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [staffNote, setStaffNote] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [isDeposit, setIsDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  const toggleService = (treatment: typeof treatments[0]) => {
    const exists = selectedItems.find(i => i.id === treatment.id);
    if (exists) {
      setSelectedItems(selectedItems.filter(i => i.id !== treatment.id));
    } else {
      setSelectedItems([...selectedItems, { id: treatment.id, name: treatment.name, price: treatment.price, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setSelectedItems(selectedItems.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const total = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmit = async () => {
    if (!clientName || !clientEmail || !clientPhone) {
      return alert("Please fill in all customer details.");
    }
    if (selectedItems.length === 0) {
      return alert("Please select at least one service.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientPhone,
          staffNote,
          items: selectedItems,
          depositAmount: isDeposit && depositAmount ? parseFloat(depositAmount) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedUrl(data.invoiceUrl);
      } else {
        alert("Failed to create invoice.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating invoice.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setStaffNote("");
    setSelectedItems([]);
    setGeneratedUrl("");
    setIsDeposit(false);
    setDepositAmount("");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedUrl);
    alert("Invoice link copied to clipboard!");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginBottom: '2rem' }}
      >
        📋 Create New Invoice for Customer
      </button>
    );
  }

  // Success state — show generated link
  if (generatedUrl) {
    return (
      <div style={{
        background: '#1A1A1A',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '12px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h3 style={{ color: '#F3E5AB', marginBottom: '0.5rem' }}>Invoice Created!</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          An email with the invoice link has been sent to <strong style={{ color: '#D4AF37' }}>{clientEmail}</strong>.
        </p>

        <div style={{
          background: '#141414',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          wordBreak: 'break-all',
          fontSize: '0.85rem',
          color: '#D4AF37',
          fontFamily: 'monospace',
        }}>
          {generatedUrl}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={copyLink} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
            📋 Copy Link
          </button>
          <button onClick={resetForm} className="btn btn-outline" style={{ padding: '0.6rem 1.5rem' }}>
            + Create Another
          </button>
          <button onClick={() => { resetForm(); setIsOpen(false); }} className="btn" style={{ padding: '0.6rem 1.5rem', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#1A1A1A',
      border: '1px solid rgba(212,175,55,0.2)',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#F3E5AB' }}>📋 Create Invoice</h2>
        <button onClick={() => { resetForm(); setIsOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
      </div>

      {/* Customer Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Customer Name</label>
          <input type="text" className="form-control" placeholder="Full Name" value={clientName} onChange={e => setClientName(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Email</label>
          <input type="email" className="form-control" placeholder="customer@email.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Phone</label>
          <input type="tel" className="form-control" placeholder="+1 (555) 000-0000" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
        </div>
      </div>

      {/* Services Selection */}
      <h3 style={{ fontSize: '1rem', color: '#D4AF37', marginBottom: '0.8rem' }}>Select Services</h3>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.8rem' }}>Signature Treatments</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        {treatments.filter(t => t.category === 'signature').map(t => {
          const selected = selectedItems.find(i => i.id === t.id);
          return (
            <div
              key={t.id}
              onClick={() => toggleService(t)}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                border: selected ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
                background: selected ? 'rgba(212,175,55,0.1)' : '#141414',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: selected ? '#F3E5AB' : 'var(--text-main)' }}>{t.name}</span>
              <span style={{ color: '#D4AF37', fontWeight: 600 }}>${t.price}</span>
            </div>
          );
        })}
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.8rem' }}>Specialized Treatments</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
        {treatments.filter(t => t.category === 'specialized').map(t => {
          const selected = selectedItems.find(i => i.id === t.id);
          return (
            <div
              key={t.id}
              onClick={() => toggleService(t)}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                border: selected ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
                background: selected ? 'rgba(212,175,55,0.1)' : '#141414',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: selected ? '#F3E5AB' : 'var(--text-main)' }}>{t.name}</span>
              <span style={{ color: '#D4AF37', fontWeight: 600 }}>${t.price}</span>
            </div>
          );
        })}
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.8rem' }}>Add-On Enhancements</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {treatments.filter(t => t.category === 'addon').map(t => {
          const selected = selectedItems.find(i => i.id === t.id);
          return (
            <div
              key={t.id}
              onClick={() => toggleService(t)}
              style={{
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                border: selected ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.08)',
                background: selected ? 'rgba(212,175,55,0.1)' : '#141414',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: selected ? '#F3E5AB' : 'var(--text-main)' }}>{t.name}</span>
              <span style={{ color: '#D4AF37', fontWeight: 600 }}>${t.price}</span>
            </div>
          );
        })}
      </div>

      {/* Quantity adjustors for selected items */}
      {selectedItems.length > 0 && (
        <div style={{ background: '#141414', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(212,175,55,0.1)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Selected Items — Adjust Quantity</p>
          {selectedItems.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{item.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity - 1); }} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>−</button>
                <span style={{ color: '#F3E5AB', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, item.quantity + 1); }} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37', width: '28px', height: '28px', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>+</button>
                <span style={{ color: '#D4AF37', fontWeight: 600, marginLeft: '0.5rem', minWidth: '60px', textAlign: 'right' }}>${item.price * item.quantity}</span>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.8rem', marginTop: '0.5rem', borderTop: '2px solid rgba(212,175,55,0.2)' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Total</span>
            <span style={{ fontWeight: 700, color: '#F3E5AB', fontSize: '1.2rem' }}>${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Staff Note */}
      <div className="form-group">
        <label className="form-label">Staff Note (optional, visible to customer)</label>
        <textarea
          className="form-control"
          rows={2}
          placeholder="e.g. Booking arranged per phone call on April 12th..."
          value={staffNote}
          onChange={e => setStaffNote(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Deposit Option */}
      {selectedItems.length > 0 && (
        <div style={{ background: '#141414', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(212,175,55,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: isDeposit ? '0.8rem' : 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
              <input type="radio" name="paymentType" checked={!isDeposit} onChange={() => { setIsDeposit(false); setDepositAmount(""); }} style={{ accentColor: '#D4AF37' }} />
              <span style={{ color: !isDeposit ? '#F3E5AB' : 'var(--text-muted)', fontWeight: !isDeposit ? 600 : 400, fontSize: '0.9rem' }}>Full Payment (${total.toFixed(2)})</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}>
              <input type="radio" name="paymentType" checked={isDeposit} onChange={() => setIsDeposit(true)} style={{ accentColor: '#D4AF37' }} />
              <span style={{ color: isDeposit ? '#F3E5AB' : 'var(--text-muted)', fontWeight: isDeposit ? 600 : 400, fontSize: '0.9rem' }}>Deposit Only</span>
            </label>
          </div>
          {isDeposit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '1.2rem' }}>$</span>
              <input
                type="number"
                className="form-control"
                placeholder="Enter deposit amount"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                min="1"
                max={total}
                style={{ flex: 1 }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>of ${total.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || selectedItems.length === 0 || !clientName || !clientEmail || !clientPhone || (isDeposit && (!depositAmount || parseFloat(depositAmount) <= 0 || parseFloat(depositAmount) >= total))}
        className="btn btn-primary"
        style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
      >
        {loading ? "Creating Invoice..." : isDeposit && depositAmount ? `Generate Invoice — $${parseFloat(depositAmount).toFixed(2)} Deposit` : `Generate Invoice Link ($${total.toFixed(2)})`}
      </button>
    </div>
  );
}
