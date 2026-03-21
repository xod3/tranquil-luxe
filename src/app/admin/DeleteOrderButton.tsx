"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      } else {
        alert("Failed to delete order.");
      }
    } catch {
      alert("Error deleting order.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        background: 'transparent',
        border: '1px solid #ff4d4f',
        color: '#ff4d4f',
        padding: '0.4rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: 500,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { (e.currentTarget).style.background = '#ff4d4f'; (e.currentTarget).style.color = '#fff'; }}
      onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = '#ff4d4f'; }}
    >
      {isDeleting ? "Deleting..." : "🗑 Delete Order"}
    </button>
  );
}
