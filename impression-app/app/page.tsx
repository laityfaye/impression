'use client';

import { useEffect } from 'react';
import { Printer, Upload, MapPin } from 'lucide-react';
import { DocumentUploader } from '@/components/DocumentUploader';
import { useOrderStore } from '@/lib/store';
import { PARTNER_INSTITUTES } from '@/types/order';

const features = [
  { emoji: '🛡️', label: 'Sécurisé',     desc: 'Fichiers supprimés après impression' },
  { emoji: '⚡',  label: 'Ultra rapide', desc: 'Traitement en 24–48h'                },
  { emoji: '⭐',  label: 'Qualité pro',  desc: 'Impression professionnelle'           },
];

const howItWorks = [
  { emoji: '📄', num: 1, label: 'Uploadez votre document',   desc: 'PDF ou Word (.docx) — glissez ou sélectionnez' },
  { emoji: '🎨', num: 2, label: 'Choisissez vos finitions', desc: 'Reliure spirale ou format livre' },
  { emoji: '📦', num: 3, label: 'Choisissez la livraison',  desc: 'Institut partenaire ou autre adresse' },
  { emoji: '✅', num: 4, label: "Validez — c'est parti !",  desc: 'Confirmation et prise en charge immédiate' },
];

const pills = [
  { icon: '🛡️', label: 'Sécurisé' },
  { icon: '⚡',  label: '24–48h' },
  { icon: '⭐',  label: 'Qualité pro' },
  { icon: '💰',  label: '60–80 FCFA / page' },
];

export default function UploadPage() {
  const { resetOrder } = useOrderStore();

  useEffect(() => {
    resetOrder();
  }, [resetOrder]);

  return (
    <main className="min-h-screen">

      {/* ═══════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <div className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden">

        {/* Image de fond */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/finitions/images.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        />

        {/* Overlay bleu semi-transparent pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-700/80 via-blue-700/75 to-blue-800/90 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 pt-10 sm:pt-14 pb-28 sm:pb-40">

          {/* ── Contenu hero ── */}
          <div className="text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 mb-5 sm:mb-6">
              <span className="text-sm sm:text-base">✨</span>
              <span className="text-white text-[11px] sm:text-xs font-bold tracking-wide">
                Service d&apos;impression UIDT · Thiès
              </span>
            </div>

            {/* Titre */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-[1.1] tracking-tight mb-3 sm:mb-4">
              Imprimez vos documents <br />
              <span className="text-blue-200">sans stress et sans vous déplacer</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-blue-100 text-sm sm:text-base md:text-lg leading-relaxed max-w-sm sm:max-w-3xl mx-auto mb-6 sm:mb-8">
              Téléversez votre fichier, payez seulement 60 F la page et recevez vos impressions gratuitement directement sur votre campus à Thiès.✔ Rapide • ✔ Économique • ✔ Fiable
            </p>

            {/* Pills — 2 colonnes sur mobile, 4 sur sm+ */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {pills.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5"
                >
                  <span className="text-sm leading-none">{icon}</span>
                  <span className="text-white text-[11px] sm:text-xs font-bold">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          CONTENU PRINCIPAL (chevauche le hero)
      ════════════════════════════════════════ */}
      <div className="max-w-3xl mx-auto px-3 sm:px-4 -mt-16 sm:-mt-28 relative z-10 pb-12 flex flex-col gap-3 sm:gap-4">

        {/* ── Carte uploader ── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header carte — flex-wrap sur très petit écran */}
          <div className="bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-white font-bold text-sm leading-none">Déposez votre document</h2>
                <p className="text-blue-200 text-xs mt-0.5 truncate">PDF · Word (.docx) · Max 50 Mo · Min 10 pages</p>
              </div>
            </div>
            {/* Badge "En ligne" — masqué sur mobile */}
            <div className="hidden sm:flex items-center gap-2 bg-white/15 rounded-full px-3 py-1.5 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white text-xs font-bold">En ligne</span>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <DocumentUploader />
          </div>
        </div>

        {/* ── Atouts ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {features.map(({ emoji, label, desc }) => (
            <div
              key={label}
              className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center text-center gap-2 sm:gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-blue-50 border border-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl">
                {emoji}
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-bold text-gray-800 leading-snug">{label}</p>
                {/* Description masquée sur mobile */}
                <p className="hidden sm:block text-xs text-gray-500 leading-snug mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Comment ça marche ── */}
        <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-2xl p-5 sm:p-7 relative overflow-hidden">
          {/* Décors */}
          <div className="absolute -top-10 -right-10 w-52 h-52 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Titre */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-white/10" />
            <p className="text-[11px] font-bold text-blue-400 uppercase tracking-[0.18em] px-2">
              Comment ça marche
            </p>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Étapes — 2 colonnes mobile, 4 colonnes sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {howItWorks.map((step) => (
              <div
                key={step.num}
                className="relative flex flex-col items-center text-center gap-3 px-3 py-5 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors"
              >
                {/* Badge numéro */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-600 border-2 border-gray-900 flex items-center justify-center text-[10px] font-black text-white shadow-md">
                  {step.num}
                </div>

                {/* Emoji */}
                <div className="w-12 h-12 rounded-xl bg-white/8 flex items-center justify-center text-2xl mt-2">
                  {step.emoji}
                </div>

                {/* Texte */}
                <div>
                  <p className="text-white font-bold text-[11px] sm:text-xs leading-snug">{step.label}</p>
                  <p className="text-slate-500 text-[10px] sm:text-[11px] mt-1 leading-snug">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Instituts partenaires ── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">
              Livraison gratuite dans les instituts suivants
            </p>
            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
              <MapPin className="w-3 h-3" />
              <span className="hidden sm:inline">Thiès, Sénégal</span>
              <span className="sm:hidden">Thiès</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {PARTNER_INSTITUTES.map((inst) => (
              <div
                key={inst.id}
                className="flex flex-col items-center gap-2 sm:gap-2.5 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200 text-center hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <p className="text-[11px] sm:text-xs font-bold text-gray-700 leading-snug">{inst.name}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
