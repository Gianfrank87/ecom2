import React from 'react';

const WHATSAPP_NUMBER = '5493446373972';
const DEFAULT_MESSAGE = 'Hola NigDiz, quiero hacer una consulta sobre sus productos.';

export default function WhatsAppFloat() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_28px_rgba(37,211,102,0.35)] transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#25D366]/30 sm:bottom-6 sm:right-6"
      aria-label="Consultar por WhatsApp"
      title="Consultar por WhatsApp"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-7 w-7 fill-current">
        <path d="M16.02 3.2A12.74 12.74 0 0 0 5.11 22.51L3.7 28.8l6.42-1.34A12.75 12.75 0 1 0 16.02 3.2Zm0 23.24a10.43 10.43 0 0 1-5.3-1.45l-.38-.23-3.8.8.82-3.7-.25-.39a10.43 10.43 0 1 1 8.91 4.97Zm5.92-7.82c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.84 1.05-1.03 1.27-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.6-1.6-.96-.86-1.6-1.92-1.79-2.24-.19-.32-.02-.5.14-.66.15-.15.32-.38.49-.57.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.57-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.54-.73-.55h-.62c-.22 0-.57.08-.86.4-.3.32-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.16.21 2.3 3.52 5.58 4.93.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.9-.78 2.17-1.54.27-.75.27-1.39.19-1.54-.08-.13-.3-.21-.62-.38Z" />
      </svg>
    </a>
  );
}
