import { PrismaClient } from "@prisma/client";
import styles from "./admin.module.css";
import AdminActions from "./AdminActions";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export default async function AdminPage() {
  const orders = await prisma.order.findMany({
    include: { paymentProofs: true },
    orderBy: { createdAt: "desc" }
  });

  let leads: any[] = [];
  try {
    leads = await (prisma as any).lead.findMany({ orderBy: { createdAt: "desc" } });
  } catch { /* Lead model may not exist in DB yet */ }

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
              {(order.clientStreetAddress || order.clientCity || order.clientState || order.clientCountry) && (
                <p><strong>Location:</strong> {[order.clientStreetAddress, order.clientCity, order.clientState, order.clientZipCode, order.clientCountry].filter(Boolean).join(', ')}</p>
              )}
              <p><strong>Total:</strong> ${order.totalAmount} {order.currency && order.currency !== 'USD' ? `(${order.currency})` : ''}</p>
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
                <AdminActions orderId={order.id} />
              </div>
            )}

            {(order.status === "confirmed" || order.status === "declined") && (
              <div className={styles.confirmedSection} style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: '1rem' }}>
                {order.status === "confirmed" && order.paymentConfirmedCode && (
                  <p><strong>Confirmation Code:</strong> {order.paymentConfirmedCode}</p>
                )}
                {order.adminNote && (
                  <p><strong>Admin Note:</strong> {order.adminNote}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {orders.length === 0 && <p className="text-center">No orders found.</p>}
      </div>

      {/* Leads Section */}
      <div style={{ marginTop: '4rem' }}>
        <h2 className="section-title" style={{ fontSize: '2rem' }}>📍 Leads &amp; Visitors</h2>
        <p className="text-center mb-8" style={{ color: 'var(--text-muted)' }}>
          Potential clients captured from popup — {leads.length} total
        </p>

        {leads.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(212,175,55,0.2)' }}>
                  <th style={{ textAlign: 'left', padding: '0.8rem', color: '#D4AF37' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '0.8rem', color: '#D4AF37' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '0.8rem', color: '#D4AF37' }}>City</th>
                  <th style={{ textAlign: 'left', padding: '0.8rem', color: '#D4AF37' }}>Region</th>
                  <th style={{ textAlign: 'left', padding: '0.8rem', color: '#D4AF37' }}>Country</th>
                  <th style={{ textAlign: 'left', padding: '0.8rem', color: '#D4AF37' }}>Source</th>
                  <th style={{ textAlign: 'left', padding: '0.8rem', color: '#D4AF37' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead: any) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                    <td style={{ padding: '0.7rem', color: '#F3E5AB' }}>{lead.name || '—'}</td>
                    <td style={{ padding: '0.7rem' }}><a href={`mailto:${lead.email}`} style={{ color: '#D4AF37' }}>{lead.email}</a></td>
                    <td style={{ padding: '0.7rem', color: 'var(--text-muted)' }}>{lead.city || '—'}</td>
                    <td style={{ padding: '0.7rem', color: 'var(--text-muted)' }}>{lead.region || '—'}</td>
                    <td style={{ padding: '0.7rem', color: 'var(--text-muted)' }}>{lead.country || '—'}</td>
                    <td style={{ padding: '0.7rem', color: 'var(--text-light)' }}>{lead.source || 'popup'}</td>
                    <td style={{ padding: '0.7rem', color: 'var(--text-light)', fontSize: '0.8rem' }}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center" style={{ color: 'var(--text-muted)' }}>No leads captured yet.</p>
        )}
      </div>
    </div>
  );
}
