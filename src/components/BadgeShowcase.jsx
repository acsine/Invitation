'use client';

import React from 'react';
import Image from 'next/image';
import { FiCheckCircle, FiShield, FiPrinter, FiZap, FiCheck, FiArrowRight, FiSmartphone, FiAward, FiShare2 } from 'react-icons/fi';
import AppLink from '@/components/AppLink';
import { BsQrCode, BsStars } from 'react-icons/bs';

export default function BadgeShowcase() {
  return (
    <div className="space-y-16">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="text-xs font-black text-[#FF6500] uppercase tracking-widest">
          Badges & Pass Électroniques ▸▸▸▸
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Des badges HD professionnels & Pass QR anti-fraude
        </h2>
        <p className="text-slate-600 text-base sm:text-lg">
          Offrez des badges physiques élégants et des pass digitaux haute définition prêts pour le scan à l'entrée.
        </p>
      </div>

      {/* 3 Premium Badge Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
        
        {/* Card 1: Pass Mobile Digital */}
        <div className="bg-white rounded-3xl p-8 lg:p-9 border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[#3B52E8] border-none text-xs font-black uppercase tracking-wider">
                Pass Smartphone
              </span>
              <FiSmartphone className="text-[#3B52E8]" size={22} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Pass Digital Mobile</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Envoyé directement sur le smartphone de l'invité par WhatsApp ou SMS. Enregistrement instantané dans le wallet.
              </p>
            </div>

            {/* Mobile Pass Preview Mockup */}
            <div className="bg-gradient-to-br from-[#3B52E8] to-indigo-800 rounded-2xl p-5 text-white shadow-lg space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-black uppercase text-blue-200">InviteManager Pass</div>
                  <div className="text-base font-black">Conférence VIP 2026</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-extrabold uppercase">
                  PASS VIP
                </span>
              </div>

              <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl backdrop-blur-md">
                <div>
                  <div className="text-[10px] text-blue-200 font-semibold">Invité Honoré</div>
                  <div className="text-sm font-black truncate max-w-[120px]">Sarah Lawson</div>
                  <div className="text-[10px] text-emerald-300 font-bold mt-0.5">● Table 04 - Range A</div>
                </div>
                <div className="p-1.5 bg-white rounded-lg text-[#3B52E8]">
                  <BsQrCode size={36} />
                </div>
              </div>
            </div>

            <ul className="space-y-2.5 pt-2">
              {[
                'Réception instantanée sans impression',
                'Code QR dynamique sécurisé anti-doublon',
                'Confirmation d\'arrivée en temps réel'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <FiCheck className="text-emerald-500 flex-shrink-0" size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <AppLink href="/auth/register" className="w-full btn-edu-blue py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md border-none">
              <span>Créer des Pass Digitaux</span>
              <FiArrowRight size={14} />
            </AppLink>
          </div>
        </div>

        {/* Card 2: Badge Physique HD Lanière (Print PDF) */}
        <div className="bg-white rounded-3xl p-8 lg:p-9 border-none shadow-2xl transition-all duration-300 scale-[1.02] flex flex-col justify-between relative">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FF6500] text-white text-xs font-black uppercase tracking-widest shadow-md">
            Le plus demandé
          </span>

          <div className="space-y-6">
            <div className="flex items-center justify-between pt-2">
              <span className="px-3.5 py-1.5 rounded-full bg-amber-50 text-[#FF6500] border-none text-xs font-black uppercase tracking-wider">
                Impression HD
              </span>
              <FiPrinter className="text-[#FF6500]" size={22} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Badge Imprimable HD</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Exportation PDF vectorielle haute définition prête à l'impression avec trou de lanière, logo et photo d'identité.
              </p>
            </div>

            {/* Printed Badge Preview Mockup */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl space-y-4 border-none">
              <div className="bg-gradient-to-r from-[#FF6500] to-amber-500 p-3 rounded-xl flex justify-between items-center">
                <div>
                  <div className="text-[9px] font-black uppercase text-white/80">Badge Officiel</div>
                  <div className="text-xs font-black">SOMMET DU NUMÉRIQUE</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-black/30 text-[9px] font-black">
                  SPEAKER
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Nom & Organisme</div>
                  <div className="text-sm font-black text-white">Dr. K. Brou</div>
                  <div className="text-[10px] text-amber-400 font-bold">Tech Ivory Corp</div>
                </div>
                <div className="p-2 bg-white rounded-xl text-slate-900 flex-shrink-0">
                  <BsQrCode size={40} className="text-[#FF6500]" />
                </div>
              </div>
            </div>

            <ul className="space-y-2.5 pt-2">
              {[
                'Format PDF prêt pour toutes les imprimantes',
                'Personnalisation complète (couleurs, logos, rôles)',
                'Génération en masse (100+ badges en 5 sec)'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <FiCheck className="text-[#FF6500] flex-shrink-0" size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <AppLink href="/auth/register" className="w-full btn-edu-orange py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 border-none">
              <span>Générer mes Badges PDF</span>
              <FiArrowRight size={14} />
            </AppLink>
          </div>
        </div>

        {/* Card 3: Badge VIP Prestige / Red Carpet */}
        <div className="bg-white rounded-3xl p-8 lg:p-9 border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border-none text-xs font-black uppercase tracking-wider">
                Sécurité & Gala
              </span>
              <FiShield className="text-emerald-600" size={22} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Badge VIP Anti-Fraude</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Conçu pour les soirées de gala et événements sous haute sécurité. Cryptage renforcé et alerte visuelle au scan.
              </p>
            </div>

            {/* Prestige Badge Preview Mockup */}
            <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 rounded-2xl p-5 text-white shadow-lg space-y-4 border-none">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-black uppercase text-amber-200">Gala Red Carpet</div>
                  <div className="text-sm font-black">INVITATION PRESTIGE</div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                  ZONE GOLD
                </span>
              </div>

              <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl backdrop-blur-md">
                <div>
                  <div className="text-[10px] text-amber-200 font-semibold">Accès Backstage</div>
                  <div className="text-sm font-black truncate max-w-[120px]">Membre Honneur</div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5">● Accès VIP Déjà Validé</div>
                </div>
                <div className="p-1.5 bg-white rounded-lg text-amber-700">
                  <BsQrCode size={36} />
                </div>
              </div>
            </div>

            <ul className="space-y-2.5 pt-2">
              {[
                'Hologramme et filigrane de sécurité anti-copie',
                'Contrôle d\'accès différencié par zone VIP',
                'Notification sonore instantanée à l\'entrée'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <FiCheck className="text-emerald-500 flex-shrink-0" size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <AppLink href="/auth/register" className="w-full btn-edu-blue py-3.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md border-none">
              <span>Créer des Badges VIP</span>
              <FiArrowRight size={14} />
            </AppLink>
          </div>
        </div>

      </div>

      {/* Bottom Features Banner */}
      <div className="bg-white rounded-3xl p-8 border-none shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { label: "Génération Instantanée", desc: "100+ badges en 5 secondes", icon: FiZap },
          { label: "Exportation PDF HD", desc: "Formats A4, A6 et badges lanière", icon: FiPrinter },
          { label: "QR Code Crypté", desc: "Protection anti-fraude intégrée", icon: FiShield },
          { label: "Partage WhatsApp & SMS", desc: "Envoi direct sur smartphone", icon: FiShare2 }
        ].map((f, i) => (
          <div key={i} className="space-y-2 p-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#FF6500] flex items-center justify-center font-bold mx-auto border-none shadow-xs">
              <f.icon size={20} />
            </div>
            <div className="text-sm font-black text-slate-900">{f.label}</div>
            <div className="text-[11px] font-semibold text-slate-500">{f.desc}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
