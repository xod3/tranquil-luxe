import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank You — Tranquil Luxe Massage",
  description: "Your booking has been submitted successfully. Our team will review and confirm shortly.",
};

export default function ThankYouPage() {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '550px',
        background: '#1A1A1A',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: '16px',
        padding: '3rem 2.5rem',
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{
          color: '#F3E5AB',
          fontSize: '2rem',
          marginBottom: '0.5rem',
          fontFamily: 'var(--font-serif)',
        }}>
          Payment Submitted!
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1rem',
          lineHeight: '1.7',
          marginBottom: '1.5rem',
        }}>
          Thank you for choosing Tranquil Luxe Massage. Your payment is being reviewed by our team. 
          We&apos;ll send a confirmation to your email once verified.
        </p>

        <div style={{
          background: 'rgba(212,175,55,0.08)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: '10px',
          padding: '1.2rem',
          marginBottom: '2rem',
        }}>
          <p style={{ color: '#D4AF37', fontWeight: 600, margin: '0 0 0.3rem', fontSize: '0.9rem' }}>
            What happens next?
          </p>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem', lineHeight: '1.6' }}>
            Our team will verify your payment and reach out within 1-2 hours to confirm your booking details, 
            preferred time, and location.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
            Return Home
          </Link>
          <Link href="/prices" className="btn btn-outline" style={{ padding: '0.8rem 2rem' }}>
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}
