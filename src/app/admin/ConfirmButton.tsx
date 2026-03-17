"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (res.ok) {
        alert("Payment confirmed successfully!");
        router.refresh(); // Refresh RSC data
      } else {
        alert("Failed to confirm payment.");
      }
    } catch (err) {
      console.error(err);
      alert("Error confirming payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleConfirm} 
      disabled={loading}
      className="btn btn-primary"
      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
    >
      {loading ? "Confirming..." : "Confirm Payment"}
    </button>
  );
}
