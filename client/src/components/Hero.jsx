import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Tag, Sparkles } from 'lucide-react';

export default function Hero() {
  const dogImage = 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1788384780/63c2d7ac-6b50-47fd-a123-cab78eea8736_mx9rhk.jpg';

  return (
    <>
      <style>{`
        .hero-shell {
          position: relative;
          overflow: hidden;
          border-radius: 28px;
          background:
            linear-gradient(90deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.74) 38%, rgba(0,0,0,0.7) 100%),
            radial-gradient(circle at 72% 30%, rgba(255,255,255,0.06), transparent 18%),
            #05090d;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 18px 40px rgba(0,0,0,0.2);
          margin-bottom: 1.5rem;
        }

        .hero-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.08fr 0.92fr;
          min-height: 430px;
          align-items: center;
          padding: 1.5rem 2.2rem 1.2rem 2.2rem;
        }

        .hero-copy {
          padding-left: 0.2rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border-radius: 9999px;
          background: linear-gradient(180deg, #ef2e2b 0%, #dd1d1a 100%);
          color: white;
          padding: 0.7rem 1.2rem;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 0.7rem;
          box-shadow: 0 8px 18px rgba(229, 37, 33, 0.22);
        }

        .hero-title {
          margin: 1.2rem 0 0.9rem;
          font-size: clamp(3.1rem, 3.35vw, 6rem);
          line-height: 0.86;
          letter-spacing: -0.08em;
          font-weight: 900;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 0.14em;
        }

        .hero-title > span {
          white-space: nowrap;
        }

        .hero-title .highlight {
          display: inline;
          color: #f5b84d;
        }

        .hero-subtitle {
          max-width: 34rem;
          color: rgba(255,255,255,0.78);
          font-size: 0.97rem;
          line-height: 1.5;
          margin: 0 0 1.5rem;
        }

        .promo-box {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          flex-wrap: wrap;
          width: fit-content;
          padding: 0.75rem 0.8rem 0.75rem 1rem;
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148,163,184,0.25);
        }

        .promo-code {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-size: 0.9rem;
          color: #f8fafc;
          white-space: nowrap;
        }

        .promo-code strong {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 7.8rem;
          height: 2.3rem;
          border-radius: 0.52rem;
          background: rgba(21, 31, 50, 0.95);
          border: 1px solid rgba(148,163,184,0.22);
          color: #f8fafc;
          padding: 0 0.7rem;
          font-weight: 800;
        }

        .hero-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.42rem;
          min-height: 3.15rem;
          padding: 0.9rem 1.4rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: linear-gradient(180deg, #ef2d29 0%, #d91818 100%);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 10px 18px rgba(229, 37, 33, 0.22);
        }

        .hero-art {
          position: relative;
          display: flex;
          align-items: stretch;
          justify-content: center;
          min-height: 360px;
          isolation: isolate;
        }

        .hero-art::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 20%, rgba(255,255,255,0.12), transparent 22%);
          z-index: 0;
        }

        .hero-visual {
          position: relative;
          width: min(38rem, 100%);
          height: 100%;
          min-height: 26rem;
          display: flex;
          align-items: stretch;
          justify-content: center;
          z-index: 1;
          overflow: visible;
        }

        .hero-photo {
          width: 100%;
          height: 100%;
          min-height: 26rem;
          object-fit: contain;
          object-position: center center;
          display: block;
          filter: brightness(0.8) contrast(1.12) saturate(0.8);
          transform: scale(1.08);
          mix-blend-mode: normal;
        }

        @media (max-width: 1030px) {
          .hero-grid {
            grid-template-columns: 1fr;
            padding: 1.5rem 1rem 1.2rem;
          }

          .hero-copy {
            text-align: center;
          }

          .hero-title {
            align-items: center;
          }

          .promo-box {
            margin: 0 auto;
            justify-content: center;
          }
        }

        @media (max-width: 640px) {
          .hero-shell {
            border-radius: 18px;
          }

          .hero-badge {
            letter-spacing: 0.08em;
            font-size: 0.62rem;
            padding: 0.45rem 0.8rem;
          }

          .hero-title {
            font-size: clamp(3.1rem, 16vw, 5rem);
          }

          .hero-title > span {
            white-space: normal;
          }

          .hero-subtitle {
            font-size: 0.96rem;
          }

          .promo-box {
            width: 100%;
            padding: 0.7rem 0.75rem;
          }

          .promo-code {
            width: 100%;
            justify-content: center;
            white-space: normal;
          }

          .promo-code strong {
            min-width: 6.5rem;
          }

          .hero-button {
            width: 100%;
          }
        }
      `}</style>

      <section className="hero-shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-badge">
              <Sparkles size={12} />
              Por tiempo limitado
            </div>

            <h1 className="hero-title">
              <span>Seguridad que se ve</span>
              <span>hasta <span className="highlight">35% OFF</span></span>
            </h1>

            <p className="hero-subtitle">
              Collares luminosos para perros: Visibilidad + estilo para cada paseo.
            </p>

            <div className="promo-box">
              <div className="promo-code">
                <Tag size={16} className="text-[#f5b84d]" />
                <span>
                  Usá el código: <strong>Sehola2026</strong>
                </span>
              </div>

              <Link to="/catalog" className="hero-button">
                Comprar ahora
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-visual">
              <img
                className="hero-photo"
                src={dogImage}
                alt="Perro con collar luminoso"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
