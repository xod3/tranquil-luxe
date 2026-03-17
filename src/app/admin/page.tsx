import { PrismaClient } from "@prisma/client";
import styles from "./admin.module.css";
import ConfirmButton from "./ConfirmButton";

const prisma = new PrismaClient();

export default async function AdminPage() {
  const orders = await prisma.order.findMany({
    include: { paymentProofs: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mt-8 mb-8" style={{ minHeight: '80vh', paddingTop: '80px' }}>
      <h1 className="section-title">Admin Dashboard</h1>
      <p className="text-center mb-8">Manage incoming bookings and confirm payments.</p>

      <div className={styles.orderList}>
        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-sans)', color: 'var(--gold-dark)' }}>Order #{order.id.slice(-6).toUpperCase()}</h3>
                <small>{new Date(order.createdAt).toLocaleString()}</small>
              </div>
              <div className={styles.statusBadge} data-status={order.status}>
                {order.status.toUpperCase()}
              </div>
            </div>

            <div className={styles.orderDetails}>
              <p><strong>Client:</strong> {order.clientName} ({order.clientEmail} | {order.clientPhone})</p>
              <p><strong>Total:</strong> ${order.totalAmount}</p>
              <p><strong>Method:</strong> {order.paymentMethod}</p>
            </div>

            <div className={styles.proofsSection}>
              <h4 style={{ marginBottom: '0.5rem' }}>Attached Proof(s):</h4>
              <div className={styles.imagesGrid}>
                {order.paymentProofs.map(proof => (
                  <div key={proof.id} style={{ display: 'flex', gap: '1rem' }}>
                    {proof.cardImageUrl && (
                      <a href={proof.cardImageUrl} target="_blank" rel="noreferrer" className={styles.imgLink}>View Card</a>
                    )}
                    {proof.receiptImageUrl && (
                      <a href={proof.receiptImageUrl} target="_blank" rel="noreferrer" className={styles.imgLink}>View Receipt/Proof</a>
                    )}
                  </div>
                ))}
                {order.paymentProofs.length === 0 && <p className="text-muted">No proofs uploaded.</p>}
              </div>
            </div>

            {order.status === "pending" && (
              <div className={styles.actionSection}>
                <ConfirmButton orderId={order.id} />
              </div>
            )}

            {order.status === "confirmed" && order.paymentConfirmedCode && (
              <div className={styles.confirmedSection}>
                <strong>Confirmation Code:</strong> {order.paymentConfirmedCode}
              </div>
            )}
          </div>
        ))}

        {orders.length === 0 && <p className="text-center">No orders found.</p>}
      </div>
    </div>
  );
}
