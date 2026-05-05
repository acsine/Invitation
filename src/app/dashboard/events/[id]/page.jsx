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
import GuestManagerTable from '@/components/dashboard/GuestManagerTable';

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
      <GuestManagerTable event={event} guests={event.guests} />
    </div>
  );
}
