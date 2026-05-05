import Image from 'next/image';
import DeleteEventButton from '@/components/dashboard/DeleteEventButton';
import ManageEventButton from '@/components/dashboard/ManageEventButton';
import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AppLink from '@/components/AppLink';
import cn from 'classnames';
import { FiPlus, FiUsers, FiCalendar, FiExternalLink, FiSettings, FiImage } from 'react-icons/fi';

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <div>Accès refusé</div>;
  }

  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { guests: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Mes Événements</h2>
           <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Gérez vos cérémonies et invités</p>
        </div>
        <AppLink 
          className="inline-flex items-center justify-center rounded-2xl bg-primary py-4 px-8 text-center text-sm font-black text-white uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all gap-2" 
          href="/dashboard/events/new"
        >
          <FiPlus size={20} />
          <span>Nouvel événement</span>
        </AppLink>
      </div>
      
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-gray-100 shadow-sm text-center px-6">
          <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mb-8">
            <FiCalendar size={48} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">Aucun événement trouvé</h3>
          <p className="text-gray-400 font-medium max-w-sm mb-10 leading-relaxed">
            Commencez par créer votre premier événement pour générer des invitations et gérer vos invités.
          </p>
          <AppLink 
            className="inline-flex items-center justify-center rounded-2xl bg-gray-900 py-4 px-10 text-center text-sm font-black text-white uppercase tracking-widest hover:bg-primary transition-all shadow-xl" 
            href="/dashboard/events/new"
          >
            Créer mon premier événement
          </AppLink>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="group relative bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col">
              <div className="relative h-56 w-full overflow-hidden">
                {event.backgroundImageUrl ? (
                  <Image 
                    src={event.backgroundImageUrl} 
                    alt={event.name} 
                    fill
                    style={{ objectFit: 'cover' }}
                    className="transition duration-1000 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-200">
                    <FiImage size={48} />
                  </div>
                )}
                <div className="absolute top-6 right-6 flex gap-2">
                   <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-gray-900 uppercase tracking-widest shadow-sm">
                      {new Date(event.createdAt).toLocaleDateString()}
                   </div>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-black text-gray-900 mb-4 truncate group-hover:text-primary transition-colors">
                  {event.name}
                </h3>
                
                <div className="flex items-center gap-6 mb-8 text-xs font-bold text-gray-400">
                  <div className="flex items-center gap-2">
                    <FiUsers size={16} className="text-primary" />
                    <span>{event._count.guests} invités</span>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  <ManageEventButton 
                    href={`/dashboard/events/${event.id}`}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-gray-900 py-4 text-xs font-black text-white uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
                  />
                  <AppLink 
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white border border-gray-100 py-4 text-xs font-black text-gray-900 uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm" 
                    href={`/invite/${event.shareCode}`} 
                    target="_blank"
                  >
                    <FiExternalLink size={14} />
                    Lien
                  </AppLink>
                  <DeleteEventButton 
                    eventId={event.id} 
                    eventName={event.name} 
                    className="col-span-2 mt-2 flex items-center justify-center gap-2 rounded-2xl bg-red-50/50 py-4 text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
