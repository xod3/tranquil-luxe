"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Navbar from "../../components/Navbar";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const errorData = await res.json();
        setMessage(errorData.error || "Failed to unsubscribe. Please try again.");
        setStatus("error");
      }
    } catch (err) {
      setMessage("An unexpected error occurred.");
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D0D0D", color: "#F3E5AB", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ maxWidth: "500px", width: "100%", backgroundColor: "#1A1A1A", padding: "40px", borderRadius: "8px", border: "1px solid #D4AF37", textAlign: "center" }}>
          <h1 style={{ color: "#D4AF37", marginBottom: "20px", fontSize: "28px", textTransform: "uppercase", letterSpacing: "2px" }}>Unsubscribe</h1>
          
          {status === "success" ? (
            <div style={{ marginTop: "20px" }}>
              <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#A89F8F" }}>
                <strong>{email}</strong> has been successfully removed from our mailing list.
              </p>
              <p style={{ fontSize: "14px", marginTop: "15px", color: "#7A7060" }}>
                You will no longer receive marketing communications. If this was a mistake, please contact support.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUnsubscribe} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
              <p style={{ fontSize: "16px", lineHeight: "1.6", color: "#A89F8F" }}>
                Are you sure you want to stop receiving luxury updates and exclusive offers? If you wish to unsubscribe, confirm your email below.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{ padding: "12px 15px", backgroundColor: "#0D0D0D", border: "1px solid #333", color: "#F3E5AB", borderRadius: "4px", fontSize: "16px" }}
              />
              <button 
                type="submit" 
                disabled={status === "loading" || !email}
                style={{ padding: "14px 24px", backgroundColor: "#D4AF37", color: "#111", border: "none", borderRadius: "4px", fontWeight: "bold", fontSize: "16px", cursor: status === "loading" ? "not-allowed" : "pointer", transition: "all 0.3s ease" }}
              >
                {status === "loading" ? "Processing..." : "Unsubscribe Me"}
              </button>
              {status === "error" && (
                <p style={{ color: "#ff4d4d", fontSize: "14px", marginTop: "10px" }}>{message}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#0D0D0D", color: "#F3E5AB", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
