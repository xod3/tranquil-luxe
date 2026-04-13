"use client";

import { useState } from "react";

const WHATSAPP_NUMBER = "15624436439";
const DEFAULT_MESSAGE = "Hi! I'm interested in booking a luxury massage session. Can you help me?";

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <>
      <style jsx>{`
        .wa-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .wa-popup {
          background: #1A1A1A;
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 12px;
          padding: 16px 18px;
          width: 280px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          opacity: 0;
          transform: translateY(10px) scale(0.95);
          pointer-events: none;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .wa-popup.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        .wa-popup-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }

        .wa-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #D4AF37, #AA8C2C);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .wa-name {
          color: #F3E5AB;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .wa-status {
          color: #4caf50;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .wa-status::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #4caf50;
          border-radius: 50%;
          display: inline-block;
        }

        .wa-message {
          background: #222;
          border-radius: 0 10px 10px 10px;
          padding: 10px 14px;
          color: #A89F8F;
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .wa-cta {
          display: block;
          width: 100%;
          padding: 10px;
          background: #25D366;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .wa-cta:hover {
          background: #1da851;
          color: #fff;
        }

        .wa-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #25D366;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(37, 211, 102, 0.35);
          transition: all 0.3s ease;
          position: relative;
        }

        .wa-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 6px 24px rgba(37, 211, 102, 0.5);
        }

        .wa-btn svg {
          width: 32px;
          height: 32px;
          fill: #fff;
        }

        .wa-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(37, 211, 102, 0.3);
          animation: waPulse 2s ease-out infinite;
        }

        @keyframes waPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .wa-close {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #333;
          border: 1px solid rgba(212,175,55,0.2);
          color: #A89F8F;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }

        .wa-close:hover {
          background: #444;
        }

        @media (max-width: 480px) {
          .wa-container {
            bottom: 16px;
            right: 16px;
          }
          .wa-popup {
            width: 260px;
          }
          .wa-btn {
            width: 54px;
            height: 54px;
          }
          .wa-btn svg {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>

      <div className="wa-container">
        {/* Popup */}
        <div className={`wa-popup ${isOpen ? 'open' : ''}`}>
          <button className="wa-close" onClick={() => setIsOpen(false)}>✕</button>
          <div className="wa-popup-header">
            <div className="wa-avatar">✦</div>
            <div>
              <div className="wa-name">Tranquil Luxe</div>
              <div className="wa-status">Online now</div>
            </div>
          </div>
          <div className="wa-message">
            Hey there! 👋 Ready to book your luxury massage experience? Chat with us and we&apos;ll take care of everything.
          </div>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="wa-cta">
            💬 Start Chat on WhatsApp
          </a>
        </div>

        {/* Floating Button */}
        <button className="wa-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Chat on WhatsApp">
          {!isOpen && <span className="wa-pulse" />}
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
      </div>
    </>
  );
}
