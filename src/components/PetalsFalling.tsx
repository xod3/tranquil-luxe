"use client";

import { useEffect } from "react";

export default function PetalsFalling() {
  useEffect(() => {
    const container = document.createElement("div");
    container.id = "petals-container";
    container.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;";
    document.body.appendChild(container);

    const petalColors = ["#D4AF37", "#F3E5AB", "#C5A028", "#E8C84A", "#B89A2A"];
    const petalShapes = ["🌸", "🪷", "✿"];

    function createPetal() {
      const petal = document.createElement("span");
      const color = petalColors[Math.floor(Math.random() * petalColors.length)];
      const shape = petalShapes[Math.floor(Math.random() * petalShapes.length)];
      const size = 10 + Math.random() * 14;
      const startX = Math.random() * 100;
      const duration = 8 + Math.random() * 7;
      const delay = Math.random() * 2;
      const drift = -30 + Math.random() * 60;

      petal.textContent = shape;
      petal.style.cssText = `
        position:absolute;
        top:-30px;
        left:${startX}%;
        font-size:${size}px;
        color:${color};
        opacity:${0.25 + Math.random() * 0.35};
        pointer-events:none;
        animation: petalFall ${duration}s linear ${delay}s forwards;
        filter: drop-shadow(0 0 2px rgba(212,175,55,0.3));
        --drift: ${drift}px;
      `;
      container.appendChild(petal);

      setTimeout(() => {
        petal.remove();
      }, (duration + delay) * 1000 + 500);
    }

    // Inject keyframes
    const style = document.createElement("style");
    style.textContent = `
      @keyframes petalFall {
        0% { transform: translateY(0) translateX(0) rotate(0deg); }
        25% { transform: translateY(25vh) translateX(calc(var(--drift) * 0.5)) rotate(90deg); }
        50% { transform: translateY(50vh) translateX(var(--drift)) rotate(180deg); }
        75% { transform: translateY(75vh) translateX(calc(var(--drift) * 0.3)) rotate(270deg); }
        100% { transform: translateY(110vh) translateX(calc(var(--drift) * -0.2)) rotate(360deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Spawn petals at intervals
    const interval = setInterval(() => {
      createPetal();
    }, 1200);

    return () => {
      clearInterval(interval);
      container.remove();
      style.remove();
    };
  }, []);

  return null;
}
