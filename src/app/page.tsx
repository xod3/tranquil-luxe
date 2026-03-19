"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";

const slides = [
  {
    id: 1,
    image: "/slide-team.png",
    title: "Meet Our Expert Team",
    subtitle: "Professional male and female masseuses dedicated to your comfort and relaxation.",
  },
  {
    id: 2,
    image: "/slide-session.png",
    title: "Velvet Touch Luxury",
    subtitle: "Exclusive treatments tailored for complete body renewal — for both men and women.",
  },
  {
    id: 3,
    image: "/slide-oils.png",
    title: "Premium Products",
    subtitle: "Curated Tranquil Luxe signature oils and blends for the ultimate spa experience.",
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
          Step into a world of pure exclusivity and serenity. Our expert male and female masseuses are dedicated to providing both men and women with therapeutic, restorative treatments in a private and highly professional environment. We welcome all clients — your comfort and relaxation are our priority.
        </p>
        <p style={{ maxWidth: '600px', margin: '2rem auto 0', fontSize: '1rem', color: 'var(--text-muted)' }}>
          Appointments only. Email us at{' '}
          <a href="mailto:bookings@tranquilluxemassage.fit" style={{ color: '#D4AF37', fontWeight: 'bold', textDecoration: 'underline' }}>bookings@tranquilluxemassage.fit</a>{' '}
          to reserve your session.
        </p>
      </section>
    </div>
  );
}
