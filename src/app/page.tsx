"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Relax. Restore. Rejuvenate.",
    subtitle: "Experience the pinnacle of premium massage therapy.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Velvet Touch Luxury",
    subtitle: "Exclusive treatments tailored for complete body renewal.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    title: "Elite Specialists",
    subtitle: "Our model masseuses provide an unparalleled relaxing atmosphere.",
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
          Step into a world of pure exclusivity and serenity. Our expert model masseuses are dedicated to providing you with therapeutic, restorative treatments in a private and highly professional environment. Appointments only.
        </p>
      </section>
    </div>
  );
}
