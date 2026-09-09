import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, BookOpen, X, Quote } from 'lucide-react';

export default function AboutNigdizSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dogPhoto = 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1788910431/solo_Nigdiz_tcjkyq.png';

  // Close modal on Escape key
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') setIsModalOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isModalOpen]);

  const fullStoryParagraphs = [
    "Hola, me llamo Nigdiz.",
    "Dicen que soy un perrito mestizo, de tamaño mediano, con el pelito negro, algunas manchitas blancas y unos toques marrones que me hacen único. También dicen que tengo una mirada capaz de conquistar cualquier corazón... y creo que tienen un poquito de razón.",
    "Hoy tengo una familia, una camita calentita y un hogar lleno de amor. Pero no siempre fue así.",
    "Durante muchos años fui un perrito de la calle.",
    "Llegué a Gualeguaychú después de dejar el campo. Cuentan que me fui porque tenía la costumbre de correr a las gallinas. No sé si fue exactamente así... lo único que recuerdo es que un día estaba solo y tuve que aprender a arreglármelas.",
    "En el barrio de la Vía conocí personas maravillosas. Muchos vecinos me daban comida, agua y alguna caricia. Varias familias intentaron adoptarme. La idea de una cama blandita y un plato lleno era hermosa... pero había algo dentro de mí que siempre me hacía volver a la calle.",
    "Volvía al frío, a la lluvia, a dormir sobre el suelo, a buscar un rincón donde pasar las noches de invierno y a esperar que algún vecino guardara un pedacito de su almuerzo para mí.",
    "Hasta que un día dejé de estar solo.",
    "Conocí a La Noni, mi hermanita del corazón. Ella tenía una familia, pero igual elegía acompañarme en mis aventuras. Desde entonces compartimos caminos, noches y esperanzas. No teníamos un hogar... pero nos teníamos el uno al otro.",
    "Una tarde de mucha tormenta ocurrió algo que cambió mi vida.",
    "Una familia que acababa de abrir un negocio en el barrio nos dejó entrar para refugiarnos. Yo solo me animé porque también recibieron a La Noni. Si ella no entraba, yo tampoco.",
    "Nos hicimos amigos. Ellos nos daban de comer, nos cuidaban y siempre nos esperaban con una sonrisa.",
    "Tiempo después se mudaron. Pensé que nuestra historia juntos había terminado, pero la vida tenía preparado otro capítulo.",
    "Ellos tenían una perrita a la que amaban profundamente. Un día ella cruzó el puente del arcoíris y la tristeza llenó la casa.",
    "Yo no entendía muchas cosas, pero sí entendía el dolor. Así que hice lo único que sabía hacer: me quedé a su lado. La Noni también.",
    "Y fue entonces cuando ocurrió el milagro más lindo de mi vida. Ellos decidieron transformar ese inmenso dolor en amor.",
    "De pronto aparecieron dos camitas, frazaditas calentitas, platitos con comida, abrazos, juegos, tardes de televisión, pijamadas y una familia que empezó a llamarnos hijos.",
    "Al principio todo era nuevo para mí. Nunca había sentido lo que era que alguien me esperara para cenar, que me cepillara el pelo, que me tapara cuando hacía frío o que se preocupara si tardaba en volver.",
    "Sin darme cuenta, aprendí que eso era tener un hogar. Y aprendí algo todavía más importante: que el amor también puede adoptar.",
    "Hoy sigo siendo un poquito callejero. Me encanta salir a caminar, recorrer el barrio y disfrutar del aire libre. Mis papás humanos lo saben y respetan esa parte de mí. Pero también viven con un pequeño miedo: que una noche no me vean, que un auto no me alcance a distinguir o que algo malo pueda pasarme.",
    "Por eso nació NIGDIZ. No como una simple marca. Nació como una forma de cuidarme. Y si puede cuidarme a mí, también puede cuidar a muchos otros perritos que, como yo, disfrutan de salir a caminar cuando cae el sol.",
    "Porque detrás de cada arnés luminoso hay mucho más que un producto. Hay una historia de segundas oportunidades. La historia de un perrito que un día dejó de buscar un hogar... porque un hogar lo encontró a él.",
    "Y antes de despedirme, quiero pedirte un favor. Si alguna vez te cruzás con un perrito en la calle, no pienses que es uno más. Tal vez esté esperando una oportunidad, una caricia o simplemente que alguien lo mire con el corazón.",
    "Yo tuve esa oportunidad. Alguien creyó en mí cuando no tenía nada para ofrecer, más que mi lealtad y mis ganas de querer.",
    "Hoy mi nombre acompaña esta marca porque mi historia nos recuerda que el amor puede cambiar un destino. Ojalá que cada arnés que salga de NIGDIZ ayude a que muchos perritos vuelvan seguros a casa, y que cada paseo termine con un abrazo de esos que hacen sentir que, por fin, uno pertenece.",
    "Con cariño,\n\nNigdiz 🐾"
  ];

  return (
    <section id="acerca-de-nigdiz-section" className="w-full bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#fdfbf7] border border-[#e8dfd0] p-6 sm:p-10 shadow-xs relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* ─── Left Column: Nigdiz Photo Card ─── */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute -inset-2 bg-[#d3ad2f]/20 border border-[#d3ad2f]/25 transform rotate-1" />
                <div className="relative bg-white p-3 shadow-md border border-[#e8dfd0] overflow-hidden text-center">
                  <div className="bg-[#f8f4ec] rounded-xl p-4 flex items-center justify-center min-h-[260px]">
                    <img
                      src={dogPhoto}
                      alt="Nigdiz - El perro inspirador de la marca"
                      className="w-full max-h-72 object-contain filter drop-shadow-md"
                    />
                  </div>
                  <div className="pt-3 pb-1">
                    <h3 className="font-extrabold text-lg text-[#352820]">Nigdiz 🐾</h3>
                    <p className="text-xs text-gray-500 font-medium">El alma e inspiración de nuestra marca</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Right Column: Story Teaser ─── */}
            <div className="lg:col-span-7 text-left">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#d3ad2f] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#d3ad2f]" />
                La historia de nuestro perrito
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#352820] mt-2 tracking-tight">
                Acerca de NIGDIZ
              </h2>

              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mt-4">
                <em>"Hola, me llamo Nigdiz. Dicen que soy un perrito mestizo, con el pelito negro, algunas manchitas blancas y una mirada capaz de conquistar cualquier corazón..."</em>
              </p>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-3">
                Durante años fui un perrito callejero en Gualeguaychú, hasta que una familia decidió transformar un inmenso dolor en amor y darme un verdadero hogar. De ese amor y del deseo de protegerme nació esta marca.
              </p>

              {/* Quote highlight */}
              <div className="mt-5 p-4 bg-[#d3ad2f]/10 border-l-4 border-[#d3ad2f]">
                <p className="text-xs sm:text-sm font-bold italic text-[#352820]">
                  “Algunos perros encuentran una familia. Yo tuve la suerte de encontrar una que también encontró en mí una razón para cuidar a muchos otros.”
                </p>
              </div>

              {/* Read Full Story Button */}
              <div className="mt-6 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-[#352820] hover:bg-[#4b382b] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-xs group"
                >
                  <BookOpen className="w-4 h-4 text-[#d3ad2f] group-hover:scale-110 transition-transform" />
                  Leer historia completa de Nigdiz
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Full Story Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#352820] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#d3ad2f] fill-[#d3ad2f]" />
                <h3 className="font-extrabold text-base sm:text-lg">La Historia de Nigdiz 🐾</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed bg-[#fcfbf9]">
              <div className="flex justify-center mb-4">
                <img src={dogPhoto} alt="Nigdiz" className="h-44 object-contain" />
              </div>

              {fullStoryParagraphs.map((paragraph, index) => (
                <p key={index} className={index === 0 ? "font-bold text-lg text-[#352820]" : ""}>
                  {paragraph}
                </p>
              ))}

              <div className="mt-8 p-5 bg-[#fdf6ea] border-l-4 border-[#d3ad2f]">
                <p className="font-bold italic text-sm sm:text-base text-[#352820]">
                  “Algunos perros encuentran una familia. Yo tuve la suerte de encontrar una que también encontró en mí una razón para cuidar a muchos otros.”
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-gray-100 border-t border-gray-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-[#352820] hover:bg-[#4b382b] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
