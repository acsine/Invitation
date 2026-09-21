import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import DeleteEventButton from '@/components/dashboard/DeleteEventButton';
import AppLink from '@/components/AppLink';
import { FiUsers, FiCheckCircle, FiClock, FiArrowLeft, FiExternalLink, FiDollarSign } from 'react-icons/fi';
import EventViewSwitcher from '@/components/dashboard/EventViewSwitcher';

export default async function EventDetailsPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      guests: {
        orderBy: { submittedAt: 'desc' },
      },
    },
  });

  if (!event || event.userId !== session.user.id) {
    return <div className="flex h-screen items-center justify-center text-red-500 font-bold">Événement non trouvé ou accès refusé</div>;
  }

  const validatedCount = event.guests.filter(g => g.status === 'PAID').length;
  const pendingCount = event.guests.filter(g => g.status === 'PENDING').length;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <AppLink 
            href="/dashboard/events" 
            className="w-11 h-11 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-200/80 shrink-0"
            title="Retour à la liste"
          >
            <FiArrowLeft size={20} />
          </AppLink>
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{event.name}</h2>
              <span className="bg-slate-100 font-mono font-semibold text-slate-700 text-xs px-3 py-1 rounded-full border border-slate-200">
                #{event.shareCode}
              </span>
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                event.isPaid ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {event.isPaid ? 'Payant' : 'Gratuit'}
              </span>
            </div>
            <p className="text-slate-500 text-xs font-medium">
              Tableau de bord de gestion de l'événement et suivi des présences
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AppLink 
            href={`/invite/${event.shareCode}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <FiExternalLink size={14} /> Page d'Invitation
          </AppLink>
          <DeleteEventButton 
            eventId={event.id} 
            eventName={event.name} 
          />
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FiUsers size={24} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{event.guests.length}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invités</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FiCheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">{validatedCount}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invités Validés</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <FiClock size={24} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600">{pendingCount}</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">En attente</div>
          </div>
        </div>
      </div>

      {/* Content Switcher */}
      <EventViewSwitcher event={event} guests={event.guests} />
    </div>
  );
}
