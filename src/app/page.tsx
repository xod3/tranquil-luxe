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
    </div>
  );
}
