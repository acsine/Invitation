import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import cn from 'classnames';
import Icon from '@/components/Icon';
import Image from 'next/image';
import DeleteEventButton from '@/components/dashboard/DeleteEventButton';
import AppLink from '@/components/AppLink';
import { FiUsers, FiCheckCircle, FiClock, FiDownload, FiPrinter, FiPlus } from 'react-icons/fi';

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

  const stats = [
    { label: 'Total Invités', value: event.guests.length, icon: FiUsers, color: 'text-primary bg-primary/10' },
    { label: 'Validés', value: event.guests.filter(g => g.status === 'PAID').length, icon: FiCheckCircle, color: 'text-green-500 bg-green-500/10' },
    { label: 'En attente', value: event.guests.filter(g => g.status === 'PENDING').length, icon: FiClock, color: 'text-yellow-500 bg-yellow-500/10' },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-stroke dark:border-white/10">
        <div>
          <h2 className="text-3xl font-bold text-dark dark:text-white mb-2">{event.name}</h2>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-gray-100 dark:bg-dark-3 rounded-full text-xs font-bold text-gray-500 uppercase tracking-wider">Code: {event.shareCode}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DeleteEventButton 
            eventId={event.id} 
            eventName={event.name} 
            className="px-4 py-2 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition font-medium text-sm"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-dark-2 p-8 rounded-3xl border border-stroke dark:border-white/10 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>
              <stat.icon size={28} />
            </div>
            <div>
              <div className="text-3xl font-bold text-dark dark:text-white">{stat.value}</div>
              <div className="text-xs font-bold uppercase text-body-color tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Guests Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
           <FiUsers className="text-primary" /> Liste des Invités
        </h3>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-3 text-dark dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-dark-4 transition text-sm font-bold">
             <FiDownload /> Exporter
           </button>
           <AppLink 
            href={`/dashboard/events/${id}/badges`}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition text-sm font-bold shadow-lg shadow-pink-500/20"
           >
             <FiPrinter /> Générer Badges (Bulk)
           </AppLink>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-2 rounded-3xl border border-stroke dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stroke dark:border-white/10 bg-gray-50/50 dark:bg-dark-3/50">
                <th className="p-6 text-xs font-bold uppercase text-body-color tracking-wider">Nom de l'invité</th>
                <th className="p-6 text-xs font-bold uppercase text-body-color tracking-wider text-center">Date</th>
                <th className="p-6 text-xs font-bold uppercase text-body-color tracking-wider text-center">Statut</th>
                <th className="p-6 text-xs font-bold uppercase text-body-color tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-white/10">
              {event.guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50 dark:hover:bg-dark-3/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white dark:border-dark-3 shadow-sm transition-transform group-hover:scale-105">
                        {guest.photoUrl ? (
                          <img src={guest.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                            <FiUsers size={20} />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-dark dark:text-white">{guest.name}</span>
                    </div>
                  </td>
                  <td className="p-6 text-center text-sm text-body-color font-medium">
                    {new Date(guest.submittedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="p-6 text-center">
                    <span className={cn("inline-flex px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border", {
                      "bg-green-500/10 text-green-500 border-green-500/20": guest.status === 'PAID',
                      "bg-yellow-500/10 text-yellow-500 border-yellow-500/20": guest.status === 'PENDING'
                    })}>
                      {guest.status === 'PAID' ? 'Validé' : 'En attente'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      {guest.generatedImageUrl && (
                        <a href={guest.generatedImageUrl} target="_blank" className="p-2 text-primary hover:bg-primary/10 rounded-lg transition" title="Voir l'affiche">
                          <FiDownload size={18} />
                        </a>
                      )}
                      {guest.status === 'PENDING' && (
                        <button className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition" title="Valider">
                          <FiCheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {event.guests.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <div className="flex flex-col items-center">
                      <FiUsers size={48} className="text-gray-200 mb-4" />
                      <p className="text-body-color font-medium italic">Aucun invité pour le moment.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
