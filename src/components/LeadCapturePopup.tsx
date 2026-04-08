"use client";

import { useState, useEffect } from "react";

export default function LeadCapturePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Don't show if already submitted or dismissed
    const dismissed = sessionStorage.getItem("lead-dismissed");
    if (dismissed) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 8000); // Show after 8 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, source: "popup" }),
      });
      setSubmitted(true);
      sessionStorage.setItem("lead-dismissed", "true");
      setTimeout(() => setIsVisible(false), 3000);
    } catch {
      // Fail silently
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("lead-dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.4s ease-out',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{
        background: 'linear-gradient(145deg, #1E1E1E, #141414)',
        border: '1px solid rgba(212,175,55,0.25)',
        borderRadius: '16px',
        padding: '2.5rem',
        maxWidth: '420px',
        width: '100%',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.08)',
        animation: 'slideUp 0.5s ease-out',
      }}>
        <button onClick={handleClose} style={{
          position: 'absolute', top: '12px', right: '16px',
          background: 'none', border: 'none', color: '#666',
          fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1,
        }}>&times;</button>

        {!submitted ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>✨</p>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#F3E5AB', fontSize: '1.5rem', margin: '0 0 0.5rem' }}>
                Exclusive Access
              </h3>
              <div style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(243,229,171,0.08))',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                margin: '0.75rem 0',
              }}>
                <p style={{ color: '#F3E5AB', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.2rem', letterSpacing: '0.3px' }}>
                  🎉 Get <span style={{ color: '#D4AF37', fontSize: '1.3rem' }}>10% OFF</span> Your First Session
                </p>
                <p style={{ color: '#A89F8F', fontSize: '0.82rem', margin: 0 }}>
                  Discount applied automatically at checkout
                </p>
              </div>
              <p style={{ color: '#A89F8F', fontSize: '0.92rem', lineHeight: 1.6, marginTop: '0.6rem' }}>
                Join our VIP list for private session deals, early access offers, and new service announcements.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%', padding: '0.8rem 1rem',
                    background: '#0D0D0D', border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: '8px', color: '#E8E0D0',
                    fontFamily: "'Inter', sans-serif", fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <input
                  type="email"
                  required
                  placeholder="Your Email *"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%', padding: '0.8rem 1rem',
                    background: '#0D0D0D', border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: '8px', color: '#E8E0D0',
                    fontFamily: "'Inter', sans-serif", fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>
              <button type="submit" disabled={isSubmitting} style={{
                width: '100%', padding: '0.9rem',
                background: 'linear-gradient(135deg, #F3E5AB 0%, #D4AF37 100%)',
                border: 'none', borderRadius: '8px',
                color: '#111', fontWeight: 700, fontSize: '1rem',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.3px',
                boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
              }}>
                {isSubmitting ? "Submitting..." : "🔓 Unlock 10% OFF & Exclusive Offers"}
              </button>
              <p style={{ textAlign: 'center', color: '#888', fontSize: '0.78rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
                No spam, ever — just VIP deals delivered to your inbox.
              </p>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 0.8rem' }}>🎉</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#F3E5AB', fontSize: '1.4rem', margin: '0 0 0.5rem' }}>
              You&apos;re In — 10% OFF Unlocked!
            </h3>
            <p style={{ color: '#A89F8F', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1rem' }}>
              Your discount is automatically applied at checkout. Book now while slots are available!
            </p>
            <a href="/prices" style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #F3E5AB 0%, #D4AF37 100%)',
              color: '#111', fontWeight: 700, fontSize: '0.95rem',
              borderRadius: '8px', textDecoration: 'none',
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
            }}>
              Book Your Session Now →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
