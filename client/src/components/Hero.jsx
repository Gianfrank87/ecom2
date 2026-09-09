import React from 'react';

export default function Hero() {
  const dogImage = 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1788906233/banner_qah4gm.png';

  return (
    <section className="w-full mb-0 relative">
      {/* ─── Golden Announcement Banner ─── */}
      <div className="w-full bg-[#d8b538] py-4 px-4 text-center shadow-xs">
        <p className="text-xs sm:text-sm text-[#352820] font-normal tracking-wide">
          Seguridad pensada para quienes forman parte de nuestra familia
        </p>
        <p className="text-base sm:text-lg text-[#352820] font-bold italic mt-0.5">
          Diseñados para protegerlos. Porque verlos a tiempo hace la diferencia.
        </p>
      </div>

      {/* ─── Full-width Dog Image Container (Height allows next section to peek subtly at the bottom) ─── */}
      <div className="w-full relative overflow-hidden bg-[#f6efe2] flex justify-center items-center h-[calc(100vh-210px)] min-h-[400px] max-h-[680px]">
        <img
          src={dogImage}
          alt="NIGDIZ Mascotas - Diseñados para protegerlos"
          className="w-full h-full object-cover sm:object-contain object-top block transition-all"
        />
      </div>
    </section>
  );
}
