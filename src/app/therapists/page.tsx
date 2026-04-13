import styles from "./therapists.module.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Elite Therapists — Tranquil Luxe Massage",
  description: "Meet our handpicked, highly rated massage professionals. Each therapist is trusted by hundreds of happy clients to deliver unforgettable relaxation experiences.",
};

const therapists = [
  { img: "1.jpeg" }, { img: "2.jpeg" }, { img: "3.jpeg" }, { img: "4.jpeg" },
  { img: "5.jpeg" }, { img: "6.jpeg" }, { img: "7.jpeg" }, { img: "8.jpeg" },
  { img: "9.jpeg" }, { img: "10.jpeg" }, { img: "11.jpeg" }, { img: "12.jpeg" },
  { img: "13.jpeg" }, { img: "14.jpeg" }, { img: "15.jpeg" }, { img: "16.jpeg" },
];

export default function TherapistsPage() {
  return (
    <div className={styles.therapistsContainer}>
      {/* Hero */}
      <header className={styles.heroSection}>
        <h1 className={styles.pageTitle}>Meet Our Elite Therapists</h1>
        <p className={styles.pageSubtitle}>Handpicked. Highly Rated. Ready to serve you.</p>
        <div className={styles.divider} />
        <p className={styles.tagline}>
          Our professionals are trusted by hundreds of happy clients to deliver the most unforgettable relaxation experience — right at your door.
        </p>
        <div className={styles.ratingBadge}>
          ⭐ All Therapists 5-Star Rated
        </div>
      </header>

      {/* 10% Promo Banner */}
      <div className={styles.promoBanner}>
        <h2 className={styles.promoTitle}>✨ 10% OFF Your First Session ✨</h2>
        <p className={styles.promoSub}>Automatically applied at checkout for all first-time clients. No code needed.</p>
      </div>

      {/* Gallery Grid */}
      <section className={styles.gridSection}>
        <div className={styles.modelGrid}>
          {therapists.map((t, i) => (
            <div key={i} className={styles.modelCard}>
              <img
                src={`/therapists/${t.img}`}
                alt={`Elite Therapist ${i + 1}`}
                className={styles.modelImage}
                loading="lazy"
              />
              <div className={styles.modelOverlay}>
                <span className={styles.modelStars}>★★★★★</span>
                <span className={styles.modelLabel}>Highly Rated Professional</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <p className={styles.ctaText}>Ready to experience total relaxation?</p>
        <p className={styles.ctaHighlight}>Choose your therapist. Book your session.</p>
        <Link href="/prices" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
          View Services & Book Now →
        </Link>
      </section>
    </div>
  );
}
