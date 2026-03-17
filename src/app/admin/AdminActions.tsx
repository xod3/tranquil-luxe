"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminActions({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const router = useRouter();

  const handleAction = async (action: 'confirm' | 'decline') => {
    if (action === 'decline' && !adminNote) {
      return alert("Please provide a note explaining why the payment was declined.");
    }

    if (!confirm(`Are you sure you want to ${action} this payment?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action, adminNote }),
      });
      if (res.ok) {
        alert(`Payment ${action}ed successfully!`);
        router.refresh(); // Refresh RSC data
      } else {
        alert(`Failed to ${action} payment.`);
      }
    } catch (err) {
      console.error(err);
      alert(`Error ${action}ing payment.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
      <label style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
        <strong>Admin Note (sent to client):</strong>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Reason for declining, or a thank you note..."
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          style={{ width: '100%', marginTop: '0.5rem', resize: 'vertical' }}
        />
      </label>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => handleAction('confirm')} 
          disabled={loading}
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', flex: 1 }}
        >
          {loading ? "Processing..." : "Confirm Payment"}
        </button>
        <button 
          onClick={() => handleAction('decline')} 
          disabled={loading}
          className="btn"
          style={{ 
            padding: '0.5rem 1rem', 
            fontSize: '0.9rem', 
            flex: 1, 
            backgroundColor: '#d32f2f', 
            color: 'white',
            borderColor: '#b71c1c'
          }}
        >
          {loading ? "Processing..." : "Decline Payment"}
        </button>
      </div>
    </div>
  );
}
