import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import FeaturedProductSection from '../components/FeaturedProductSection';
import HowToBuySection from '../components/HowToBuySection';
import AboutUsSection from '../components/AboutUsSection';
import AboutNigdizSection from '../components/AboutNigdizSection';
import SizeGuideSection from '../components/SizeGuideSection';
import ContactSection from '../components/ContactSection';

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTarget = params.get('scroll');
    if (['como-comprar', 'acerca-de-nosotros', 'acerca-de-nigdiz', 'guia-de-talles', 'contacto'].includes(scrollTarget)) {
      let elementId = 'como-comprar-section';
      if (scrollTarget === 'acerca-de-nosotros') elementId = 'acerca-de-nosotros-section';
      if (scrollTarget === 'acerca-de-nigdiz') elementId = 'acerca-de-nigdiz-section';
      if (scrollTarget === 'guia-de-talles') elementId = 'guia-de-talles-section';
      if (scrollTarget === 'contacto') elementId = 'contacto-section';
      
      setTimeout(() => {
        const target = document.getElementById(elementId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="w-full">
      {/* Full-width Hero Banner (Golden Announcement + Edge-to-Edge Dog Photo) */}
      <Hero />

      {/* Featured Product Section (Arnés Luminoso) */}
      <FeaturedProductSection />

      {/* Cómo Comprar Section (Guía de 9 Pasos) */}
      <HowToBuySection />

      {/* Acerca de Nosotros Section (Laura, Sebastián y Horacio) */}
      <AboutUsSection />

      {/* Acerca de Nigdiz Section (La Historia de Nigdiz) */}
      <AboutNigdizSection />

      {/* Guía de Talles Section */}
      <SizeGuideSection />

      {/* Contacto Section */}
      <ContactSection />
    </div>
  );
}



