"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";

const slides = [
  {
    id: 1,
    image: "/slide-team.png",
    title: "Private. Exclusive. Unforgettable.",
    subtitle: "Our handpicked male and female specialists deliver the ultimate in sensual relaxation.",
  },
  {
    id: 2,
    image: "/slide-session.png",
    title: "Surrender to the Touch",
    subtitle: "Intimate treatments designed to awaken your senses and leave you breathless.",
  },
  {
    id: 3,
    image: "/slide-oils.png",
    title: "Indulge in Luxury",
    subtitle: "Signature oils and exclusive blends crafted for an experience beyond compare.",
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.homeContainer}>
      <header className={styles.heroSlider}>
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
            style={{ backgroundImage: `linear-gradient(rgba(17, 17, 17, 0.4), rgba(17, 17, 17, 0.6)), url(${slide.image})` }}
          >
            <div className={styles.slideContent}>
              <h1 className={styles.slideTitle}>{slide.title}</h1>
              <p className={styles.slideSubtitle}>{slide.subtitle}</p>
              <Link href="/prices" className="btn btn-primary mt-8">
                View Premium Services
              </Link>
            </div>
          </div>
        ))}
        
        <div className={styles.sliderControls}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </header>

      <section className="container mt-8 mb-8 text-center" style={{ padding: '4rem 0' }}>
        <h2 className="section-title">Welcome to Tranquil Luxe</h2>
        <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
          Enter a world where desire meets luxury. Our alluring male and female specialists are masters of the body — dedicated to providing men and women with deeply intimate, therapeutic experiences in a private, discreet, and highly professional environment. Every session is tailored to your deepest needs.
        </p>
        <p style={{ maxWidth: '600px', margin: '2rem auto 0', fontSize: '1rem', color: 'var(--text-muted)' }}>
          By appointment only. Reach us at{' '}
          <a href="mailto:bookings@tranquilluxemassage.fit" style={{ color: '#D4AF37', fontWeight: 'bold', textDecoration: 'underline' }}>bookings@tranquilluxemassage.fit</a>{' '}
          to arrange your private session.
        </p>
      </section>

      <section style={{ padding: '4rem 0', background: 'linear-gradient(180deg, rgba(212,175,55,0.03) 0%, transparent 100%)' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: '#F3E5AB' }}>What Our Clients Say</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', marginTop: '-1.5rem', fontSize: '1.1rem' }}>
            Trusted by clients worldwide
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { name: "Isabella R.", location: "Los Angeles, USA", stars: 5, text: "Absolutely divine. The sensual massage was unlike anything I've ever experienced. My therapist knew exactly where to apply pressure. I left feeling like a new woman." },
              { name: "James T.", location: "London, UK", stars: 5, text: "I've been to spas across Europe, but nothing compares to Tranquil Luxe. The atmosphere, the skill, the intimacy — it's a masterclass in relaxation. Highly recommended." },
              { name: "Amara O.", location: "Lagos, Nigeria", stars: 5, text: "From the moment I walked in, I was treated like royalty. The deep tissue therapy melted every bit of stress from my body. Worth every dollar." },
              { name: "Sophie M.", location: "Paris, France", stars: 5, text: "Incroyable! The hot stone session was pure indulgence. The oil blends smelled heavenly and my skin felt like silk for days after. I'm already planning my next visit." },
              { name: "David K.", location: "Toronto, Canada", stars: 5, text: "The 120-minute Elite Body Renewal was the most relaxing two hours of my life. Discreet, professional, and deeply satisfying. This place is a hidden gem." },
              { name: "Yuki H.", location: "Tokyo, Japan", stars: 5, text: "Exceptional attention to detail. Every touch was precise and purposeful. The private setting made me feel completely at ease. A truly premium experience." },
              { name: "Carlos M.", location: "Dubai, UAE", stars: 5, text: "I travel the world for business and this is the one place where I truly unwind. The therapists are incredibly skilled and the environment is absolute luxury." },
              { name: "Lena W.", location: "Berlin, Germany", stars: 5, text: "I booked the sensual massage on a friend's recommendation and I'm so glad I did. It was intimate, professional, and left me feeling completely rejuvenated." }
            ].map((review, i) => (
              <div key={i} style={{
                background: '#1A1A1A',
                border: '1px solid rgba(212,175,55,0.12)',
                borderRadius: '12px',
                padding: '1.8rem',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,175,55,0.4)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(212,175,55,0.12)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ color: '#D4AF37', fontSize: '1.1rem', letterSpacing: '2px' }}>
                  {'★'.repeat(review.stars)}
                </div>
                <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic', flex: 1 }}>
                  &ldquo;{review.text}&rdquo;
                </p>
                <div style={{ borderTop: '1px solid rgba(212,175,55,0.1)', paddingTop: '0.8rem', marginTop: '0.5rem' }}>
                  <p style={{ fontWeight: 600, color: '#F3E5AB', margin: 0, fontSize: '0.95rem' }}>{review.name}</p>
                  <p style={{ color: 'var(--text-light)', margin: 0, fontSize: '0.85rem' }}>{review.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
