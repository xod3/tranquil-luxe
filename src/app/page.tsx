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

const reviews = [
  { name: "Isabella R.", location: "Los Angeles, USA", stars: 5, text: "They came right to my home and set up everything perfectly. The sensual massage was unlike anything I've ever experienced — my therapist knew exactly how to make me melt. Pure heaven." },
  { name: "James T.", location: "London, UK", stars: 5, text: "I've booked private massage services across Europe, but nothing compares to Tranquil Luxe. The discretion, the skill, the intimacy — all from the comfort of my own suite. A masterclass." },
  { name: "Amara D.", location: "California, USA", stars: 5, text: "Booking was seamless and my therapist arrived right on time. The deep tissue session in my living room felt like a 5-star experience. Worth every dollar, and I didn't even have to leave home." },
  { name: "Sophie M.", location: "Paris, France", stars: 5, text: "Incroyable! They brought everything — the table, the oils, the candles. The hot stone session in my apartment was pure indulgence. My skin felt like silk for days. Already booked my next one." },
  { name: "David K.", location: "Toronto, Canada", stars: 5, text: "The 120-minute Elite Body Renewal at my place was the most relaxing two hours of my life. Completely discreet, deeply professional, and I didn't have to step outside. A hidden gem of a service." },
  { name: "Yuki H.", location: "Tokyo, Japan", stars: 5, text: "Exceptional attention to detail from start to finish. They arrived at my hotel, set up quietly, and every touch was precise and purposeful. Having this level of luxury come to you is unmatched." },
  { name: "Carlos M.", location: "Dubai, UAE", stars: 5, text: "I travel the world for business and always book Tranquil Luxe wherever I stay. They send the most skilled therapists right to my suite — the convenience and quality are in a league of their own." },
  { name: "Lena W.", location: "Berlin, Germany", stars: 5, text: "A friend recommended booking a private session and I'm so glad I did. The therapist came to my home, created the perfect ambiance, and left me feeling completely rejuvenated. Absolutely 10/10." }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 6000);
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

          <div className={styles.reviewsCarousel}>
            {reviews.map((review, i) => (
              <div
                key={i}
                className={`${styles.reviewSlide} ${i === currentReview ? styles.reviewActive : ''}`}
              >
                <div className={styles.reviewCard}>
                  <div style={{ color: '#D4AF37', fontSize: '1.3rem', letterSpacing: '3px', marginBottom: '1rem' }}>
                    {'★'.repeat(review.stars)}
                  </div>
                  <p className={styles.reviewText}>
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div className={styles.reviewAuthor}>
                    <p style={{ fontWeight: 600, color: '#F3E5AB', margin: 0, fontSize: '1.05rem' }}>{review.name}</p>
                    <p style={{ color: 'var(--text-light)', margin: 0, fontSize: '0.9rem' }}>{review.location}</p>
                  </div>
                </div>
              </div>
            ))}

            <button
              className={`${styles.reviewArrow} ${styles.reviewArrowLeft}`}
              onClick={() => setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length)}
              aria-label="Previous review"
            >
              ‹
            </button>
            <button
              className={`${styles.reviewArrow} ${styles.reviewArrowRight}`}
              onClick={() => setCurrentReview((prev) => (prev + 1) % reviews.length)}
              aria-label="Next review"
            >
              ›
            </button>

            <div className={styles.reviewDots}>
              {reviews.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.reviewDot} ${i === currentReview ? styles.reviewDotActive : ''}`}
                  onClick={() => setCurrentReview(i)}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
