'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Modal from '@/components/Modal';
import AppLink from '@/components/AppLink';
import DeleteEventButton from './DeleteEventButton';
import { toast } from 'react-hot-toast';
import { 
  FiCalendar, 
  FiUsers, 
  FiExternalLink, 
  FiCopy, 
  FiCheck, 
  FiDollarSign, 
  FiTag, 
  FiClock, 
  FiLayers, 
  FiSettings, 
  FiImage, 
  FiShield, 
  FiPhone, 
  FiCreditCard,
  FiMaximize2
} from 'react-icons/fi';

export default function EventDetailModal({ event, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [showFullPoster, setShowFullPoster] = useState(false);

  if (!event) return null;

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/invite/${event.shareCode}`
    : `/invite/${event.shareCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Lien d\'invitation copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse custom fields safely
  let customFields = [];
  try {
    if (typeof event.customFields === 'string') {
      customFields = JSON.parse(event.customFields || '[]');
    } else if (Array.isArray(event.customFields)) {
      customFields = event.customFields;
    }
  } catch (e) {
    customFields = [];
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const createdDate = formatDate(event.createdAt);
  const startDate = formatDate(event.startDate);
  const endDate = formatDate(event.endDate);

  return (
    <>
      <Modal 
        visible={isOpen} 
        onClose={onClose}
        outerClassName="max-w-4xl"
        containerClassName="!p-0 overflow-hidden bg-white border border-slate-200/80 shadow-2xl rounded-3xl"
      >
        <div className="max-h-[85vh] overflow-y-auto custom-scrollbar bg-white">
          {/* Header Banner & Title */}
          <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    event.isPaid 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {event.isPaid ? 'Événement Payant' : 'Événement Gratuit'}
                  </span>
                  <span className="bg-white/10 text-white/90 text-xs px-3 py-1 rounded-full font-mono border border-white/10">
                    #{event.shareCode}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-2">
                  {event.name}
                </h3>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
            {/* Grid: Poster Image + Key Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Poster Column */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 group">
                  {event.backgroundImageUrl ? (
                    <>
                      <Image 
                        src={event.backgroundImageUrl} 
                        alt={`Affiche ${event.name}`} 
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                        <button 
                          onClick={() => setShowFullPoster(true)}
                          className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-lg hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                        >
                          <FiMaximize2 size={14} />
                          Agrandir l'affiche
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                      <FiImage size={44} className="mb-2 text-slate-300" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Aucune affiche</p>
                      <p className="text-[11px] text-slate-400 mt-1">Ajoutez une affiche dans l'éditeur d'événement.</p>
                    </div>
                  )}
                </div>
                {event.backgroundImageUrl && (
                  <button 
                    onClick={() => setShowFullPoster(true)}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FiMaximize2 size={12} /> Voir l'affiche en grand
                  </button>
                )}
              </div>

              {/* Summary Stats Column */}
              <div className="md:col-span-7 space-y-4">
                {/* Share URL card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <FiExternalLink size={14} className="text-indigo-600" /> Lien public d'invitation
                  </span>
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <input 
                      type="text" 
                      readOnly 
                      value={shareUrl}
                      className="bg-transparent text-xs font-mono text-slate-700 flex-1 outline-none truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        copied 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                      <span>{copied ? 'Copié' : 'Copier'}</span>
                    </button>
                  </div>
                </div>

                {/* Grid of details info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                      <FiUsers size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Invités inscrits</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                      {event._count?.guests || 0}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                      <FiCalendar size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jours de présence</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                      {event.attendanceDays || 1} <span className="text-xs font-medium text-slate-500">jour(s)</span>
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                      <FiClock size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sessions / Jour</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                      {event.sessionsPerDay || 1} <span className="text-xs font-medium text-slate-500">session(s)</span>
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                      <FiShield size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unicité</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 capitalize truncate">
                      {event.uniquenessField === 'phone' ? 'Téléphone' : (event.uniquenessField || 'Aucune')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Info Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tarification & Paiement */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FiDollarSign size={18} className="text-amber-500" />
                  Tarification & Paiement
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Statut du tarif:</span>
                    <span className={`font-extrabold px-2.5 py-0.5 rounded-full text-[11px] uppercase ${
                      event.isPaid ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {event.isPaid ? 'PAYANT' : 'GRATUIT'}
                    </span>
                  </div>

                  {event.isPaid && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Prix du billet / passe:</span>
                        <span className="text-base font-black text-slate-900">
                          {Number(event.price || 0).toLocaleString('fr-FR')} FCFA
                        </span>
                      </div>

                      {event.paymentMethod && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <FiCreditCard size={12} /> Mode de paiement:
                          </span>
                          <span className="font-bold text-slate-800">
                            {event.paymentMethod}
                          </span>
                        </div>
                      )}

                      {event.paymentNumber && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium flex items-center gap-1">
                            <FiPhone size={12} /> Numéro de réception:
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {event.paymentNumber}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Dates & Formulaire */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FiCalendar size={18} className="text-indigo-600" />
                  Dates & Formulaire
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Créé le:</span>
                    <span className="font-bold text-slate-800">
                      {createdDate || 'Non spécifiée'}
                    </span>
                  </div>

                  {(startDate || endDate) && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Période:</span>
                      <span className="font-bold text-indigo-600">
                        {startDate || '...'} au {endDate || '...'}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-medium block mb-2">Champs personnalisés ({customFields.length}):</span>
                    {customFields.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {customFields.map((field, idx) => (
                          <span key={idx} className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                            {field.label || field.name} {field.required ? '*' : ''}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Formulaire par défaut (Nom & Téléphone)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar in Modal */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 bg-white">
              <DeleteEventButton 
                eventId={event.id} 
                eventName={event.name} 
                className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-500 hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              />

              <div className="flex flex-wrap items-center gap-3">
                <AppLink 
                  href={`/invite/${event.shareCode}`} 
                  target="_blank"
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FiExternalLink size={14} /> Page Invitation
                </AppLink>

                <AppLink 
                  href={`/dashboard/events/${event.id}`}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <FiSettings size={14} /> Gérer l'événement
                </AppLink>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Lightbox Modal for Full Poster view */}
      {showFullPoster && event.backgroundImageUrl && (
        <Modal
          visible={showFullPoster}
          onClose={() => setShowFullPoster(false)}
          outerClassName="max-w-5xl"
          containerClassName="!p-2 bg-slate-950 border-slate-800"
        >
          <div className="relative w-full h-[80vh] flex items-center justify-center bg-black/90 rounded-2xl overflow-hidden">
            <Image 
              src={event.backgroundImageUrl} 
              alt={`Affiche complète ${event.name}`} 
              fill
              className="object-contain"
            />
          </div>
        </Modal>
      )}
    </>
  );
}
