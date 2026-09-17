'use client';

import React, { useState } from 'react';
import { FiCheckCircle, FiShield, FiPrinter, FiUsers, FiAward, FiZap } from 'react-icons/fi';
import { BsQrCode, BsStars } from 'react-icons/bs';

export default function BadgeSimulator() {
  const [guestName, setGuestName] = useState('Sarah M. Lawson');
  const [eventCategory, setEventCategory] = useState('VIP Conference');
  const [accessZone, setAccessZone] = useState('Zone Gold & Backstage');

  const categories = [
    { id: 'VIP Conference', label: '💼 Conférence VIP', color: 'from-[#3B52E8] to-[#2563EB]', badgeText: 'SPEAKER / VIP' },
    { id: 'Mariage Princier', label: '💍 Mariage & Cérémonie', color: 'from-[#FF6500] to-[#EA580C]', badgeText: 'INVITÉ D\'HONNEUR' },
    { id: 'Soirée Anniversaire', label: '🎉 Anniversaire Deluxe', color: 'from-[#3B52E8] to-indigo-700', badgeText: 'PASS VIP' },
    { id: 'Gala de Prestige', label: '🍷 Gala & Red Carpet', color: 'from-[#FF6500] to-rose-600', badgeText: 'TABLE ROUGE' },
  ];

  const currentCat = categories.find(c => c.id === eventCategory) || categories[0];

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[#FF6500] text-xs font-black uppercase tracking-wider">
            <BsStars size={14} className="text-[#FF6500]" />
            <span>Simulateur Interactif de Badges</span>
          </div>

          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            Générez des badges HD uniques en 1 clic
          </h3>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Personnalisez vos badges nominatifs imprimables avec un QR code anti-fraude prêt pour le scan instantané à l'entrée.
          </p>

          {/* Form fields */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Nom de l'invité
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Entrez un nom..."
                className="w-full px-4 py-3.5 rounded-xl bg-[#F4F6FB] border border-slate-200 text-slate-900 font-bold focus:ring-2 focus:ring-[#3B52E8] outline-none transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Type d'événement
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setEventCategory(cat.id)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left truncate ${
                      eventCategory === cat.id
                        ? 'bg-[#3B52E8] text-white shadow-md scale-[1.02]'
                        : 'bg-[#F4F6FB] text-slate-700 hover:bg-slate-200 border border-slate-200/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-600" /> QR Code Authentifié</span>
            <span className="flex items-center gap-1.5"><FiShield className="text-[#3B52E8]" /> Export PDF / HD</span>
          </div>
        </div>

        {/* Live Preview Badge Card Column */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-sm">
            {/* Lanyard Strap Visual */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-14 border-t-8 border-[#3B52E8] rounded-t-full shadow-md z-0" />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-800 rounded-full border-4 border-slate-300 z-10" />

            {/* Main Badge Container */}
            <div className="relative z-20 mt-4 rounded-3xl overflow-hidden bg-slate-900 text-white shadow-2xl border-4 border-white transform transition-transform duration-500 hover:rotate-1">
              {/* Header Gradient */}
              <div className={`p-6 bg-gradient-to-r ${currentCat.color} flex justify-between items-start relative`}>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/80">InviteManager Pass</div>
                  <div className="text-lg font-black tracking-tight">{eventCategory}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest border border-white/20">
                  {currentCat.badgeText}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 bg-slate-900/95 space-y-6">
                {/* Guest Profile & QR Code */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Invité Honoré</div>
                    <div className="text-xl font-black text-white tracking-tight leading-tight mt-0.5 max-w-[160px] truncate">
                      {guestName || 'Nom de l\'invité'}
                    </div>
                    <div className="inline-block mt-2 px-2.5 py-1 rounded-md bg-blue-950 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                      {accessZone}
                    </div>
                  </div>

                  {/* QR Code Visual Box */}
                  <div className="p-2.5 bg-white rounded-2xl shadow-lg border-2 border-blue-500/30 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-slate-900 rounded-lg p-1.5 flex items-center justify-center text-blue-400">
                      <BsQrCode className="w-full h-full text-[#3B52E8]" />
                    </div>
                    <span className="text-[9px] font-extrabold text-slate-800 tracking-widest mt-1">#INV-8924</span>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-emerald-400 font-bold">Valide</span>
                  </div>
                  <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FF6500] text-white font-bold transition-all text-xs shadow-md">
                    <FiPrinter size={14} /> Imprimer Badge
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
