import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, GripVertical, Loader2, Pencil, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import { api } from '../services/api';

const CONTENT_KEY = 'home-hero';
const dogImage = 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1790178202/banner_ll2xjw.png';
const defaultContent = {
  eyebrow: 'Seguridad pensada para quienes forman parte de nuestra familia',
  kicker: 'Cada producto nace de una idea simple',
  title: 'Diseñados para protegerlos. Porque verlos a tiempo hace la diferencia.',
  body: 'Cada producto que ofrecemos, nace de algo muy simple: querer que nuestras mascotas estén más seguras, cómodas, y felices',
};

defaultContent.body = '\u004d\u00e1s seguridad, comodidad y felicidad para ellos.';

export default function Hero() {
  const { isAdmin } = useClientAuth();
  const [content, setContent] = useState(defaultContent);
  const [draft, setDraft] = useState(defaultContent);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [panelPosition, setPanelPosition] = useState(null);
  const panelRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    api.getContentBlock(CONTENT_KEY)
      .then((nextContent) => {
        if (ignore) return;
        const loadedContent = { ...defaultContent, ...nextContent };
        if (loadedContent.body.startsWith('Cada producto que ofrecemos')) {
          loadedContent.body = defaultContent.body;
        }
        setContent(loadedContent);
        setDraft(loadedContent);
      })
      .catch(() => {
        if (!ignore) setFeedback('No se pudo cargar el texto actualizado.');
      });

    return () => {
      ignore = true;
    };
  }, []);

  const previewContent = isEditing ? draft : content;

  const startEditing = () => {
    setDraft(content);
    setFeedback('');
    setPanelPosition(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(content);
    setFeedback('');
    setIsEditing(false);
    setPanelPosition(null);
  };

  const saveContent = async () => {
    setIsSaving(true);
    setFeedback('');
    try {
      const savedContent = await api.updateContentBlock(CONTENT_KEY, draft);
      setContent(savedContent);
      setDraft(savedContent);
      setIsEditing(false);
      setPanelPosition(null);
    } catch (error) {
      setFeedback(error.message || 'No se pudo guardar el banner.');
    } finally {
      setIsSaving(false);
    }
  };

  const startPanelDrag = (event) => {
    if (event.button !== 0 || !panelRef.current || event.target.closest('button')) return;
    const bounds = panelRef.current.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
      height: bounds.height,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.currentTarget.classList.add('cursor-grabbing');
  };

  const movePanel = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const maxLeft = Math.max(16, window.innerWidth - drag.width - 16);
    const maxTop = Math.max(16, window.innerHeight - drag.height - 16);
    setPanelPosition({
      left: Math.min(Math.max(16, drag.left + event.clientX - drag.startX), maxLeft),
      top: Math.min(Math.max(16, drag.top + event.clientY - drag.startY), maxTop),
    });
  };

  const stopPanelDrag = (event) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      event.currentTarget.classList.remove('cursor-grabbing');
    }
  };

  return (
    <>
      <section className="w-full bg-[#d3ad2f] px-5 py-3 text-[#352820] shadow-[inset_0_-1px_0_rgba(53,40,32,0.08)] sm:py-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1 text-center text-sm leading-tight sm:flex-row sm:gap-4 sm:text-base">
          <p className="font-medium">{previewContent.eyebrow}</p>
          <span className="hidden text-lg font-black sm:inline" aria-hidden="true">•</span>
          <p className="font-hero font-bold italic">{previewContent.title}</p>
        </div>
      </section>

      <section className="relative w-full overflow-hidden bg-[#f6efe2]">
        <div className="hero-texture relative mx-auto grid min-h-[700px] w-full overflow-hidden px-7 pt-16 pb-14 sm:px-12 lg:grid-cols-[0.52fr_0.48fr] lg:px-[8.5%] lg:pt-0 lg:pb-0">
          <div className="relative z-10 flex max-w-[780px] flex-col justify-center py-10 text-left sm:py-16 lg:justify-start lg:py-[118px]">
            <p className="mb-7 font-hero text-xs font-bold uppercase tracking-[0.3em] text-[#c88f16] sm:text-sm">
              {previewContent.kicker}
            </p>
            <p className="max-w-[780px] font-hero text-[2.9rem] font-extrabold leading-[1.08] tracking-normal text-[#090807] sm:text-[4rem] lg:text-[4.65rem]">
              {previewContent.body}
            </p>

            <Link
              to="/catalog"
              className="mt-9 inline-flex w-fit items-center gap-7 rounded-full bg-[#d3a52d] px-9 py-4 font-hero text-lg font-bold text-[#17120d] shadow-[0_12px_24px_rgba(167,122,19,0.16)] transition-colors hover:bg-[#e4bd49]"
            >
              Ver productos
              <ArrowRight className="h-6 w-6" strokeWidth={1.8} />
            </Link>

          </div>

          <div className="relative flex min-h-[430px] items-end justify-center lg:min-h-[700px]">
            <div className="hero-dog-shape absolute left-[84%] top-[4%] z-0 h-[86%] w-[88%] -translate-x-1/2" aria-hidden="true" />
            <img
              src={dogImage}
              alt="Perrito NigDiz"
              className="relative z-10 h-auto max-h-[480px] w-full max-w-[640px] object-contain object-bottom sm:max-h-[610px] lg:absolute lg:bottom-[-300px] lg:right-[-150px] lg:h-[1020px] lg:max-h-none lg:w-[1050px] lg:max-w-none"
            />
          </div>

          {isAdmin && !isEditing && (
            <button
              type="button"
              onClick={startEditing}
              className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center border border-[#d3ad2f]/60 bg-white/90 text-[#352820] shadow-premium hover:bg-[#fff9e6] hover:text-[#705812] sm:right-6 sm:top-6"
              title="Editar banner"
              aria-label="Editar banner"
            >
              <Pencil className="h-5 w-5" />
            </button>
          )}
        </div>
      </section>
      {isAdmin && isEditing && (
        <div
          ref={panelRef}
          className="fixed z-[80] w-[min(92vw,420px)] max-h-[calc(100dvh-6rem)] overflow-y-auto border border-[#d8b437] bg-white text-left shadow-2xl"
          style={panelPosition ? { left: panelPosition.left, top: panelPosition.top } : { right: '1rem', top: '5.5rem' }}
        >
          <div
            className="flex touch-none cursor-grab items-center justify-between gap-3 border-b border-[#d8b437]/50 bg-[#352820] px-4 py-3 text-[#f0dc78]"
            onPointerDown={startPanelDrag}
            onPointerMove={movePanel}
            onPointerUp={stopPanelDrag}
            onPointerCancel={stopPanelDrag}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-white/70" aria-hidden="true" />
              <p className="text-sm font-extrabold">Editar banner</p>
            </div>
            <button type="button" onClick={cancelEditing} disabled={isSaving} className="inline-flex h-8 w-8 items-center justify-center text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50" title="Cerrar editor" aria-label="Cerrar editor">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            <label className="label-xs" htmlFor="hero-eyebrow">Franja superior</label>
            <input id="hero-eyebrow" className="mb-4 w-full border border-gray-200 bg-white px-3 py-2 text-sm text-[#352820] outline-none focus:border-[#d3ad2f] focus:ring-2 focus:ring-[#f0dc78]" maxLength={140} value={draft.eyebrow} onChange={(event) => setDraft((current) => ({ ...current, eyebrow: event.target.value }))} />

            <label className="label-xs" htmlFor="hero-title">Frase destacada de la franja</label>
            <input id="hero-title" className="mb-4 w-full border border-gray-200 bg-white px-3 py-2 text-sm text-[#352820] outline-none focus:border-[#d3ad2f] focus:ring-2 focus:ring-[#f0dc78]" maxLength={220} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />

            <label className="label-xs" htmlFor="hero-kicker">Etiqueta superior del hero</label>
            <input id="hero-kicker" className="mb-4 w-full border border-gray-200 bg-white px-3 py-2 text-sm text-[#352820] outline-none focus:border-[#d3ad2f] focus:ring-2 focus:ring-[#f0dc78]" maxLength={100} value={draft.kicker} onChange={(event) => setDraft((current) => ({ ...current, kicker: event.target.value }))} />

            <label className="label-xs" htmlFor="hero-body">Texto grande del banner</label>
            <textarea id="hero-body" className="min-h-32 w-full resize-none border border-gray-200 bg-white px-3 py-2 text-sm text-[#352820] outline-none focus:border-[#d3ad2f] focus:ring-2 focus:ring-[#f0dc78]" maxLength={320} value={draft.body} onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))} />

            {feedback && <p className="mt-3 text-sm font-semibold text-[#947516]">{feedback}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={saveContent} disabled={isSaving || !draft.eyebrow.trim() || !draft.title.trim() || !draft.kicker.trim() || !draft.body.trim()} className="inline-flex items-center gap-2 bg-[#352820] px-4 py-2 text-sm font-bold text-white hover:bg-[#4b382b] disabled:cursor-not-allowed disabled:opacity-70">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Guardar
              </button>
              <button type="button" onClick={cancelEditing} disabled={isSaving} className="inline-flex items-center gap-2 border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-[#352820] hover:border-[#d3ad2f] hover:text-[#705812] disabled:cursor-not-allowed disabled:opacity-70">
                <X className="h-4 w-4" /> Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="h-7 w-full bg-[#a57a13]" aria-hidden="true" />
    </>
  );
}
