'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import AppLink from '@/components/AppLink';
import DeleteEventButton from './DeleteEventButton';
import ManageEventButton from './ManageEventButton';
import GlobalBadgeButton from './GlobalBadgeButton';
import NewEventButton from './NewEventButton';
import EventDetailModal from './EventDetailModal';
import { 
  FiSearch, 
  FiList, 
  FiGrid, 
  FiEye, 
  FiUsers, 
  FiCalendar, 
  FiExternalLink, 
  FiImage, 
  FiDollarSign, 
  FiTag, 
  FiSettings, 
  FiLayers
} from 'react-icons/fi';

export default function EventsTable({ events = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'PAID', 'FREE'
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Compute summary stats
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const paidEvents = events.filter(e => e.isPaid).length;
    const freeEvents = totalEvents - paidEvents;
    const totalGuests = events.reduce((acc, e) => acc + (e._count?.guests || 0), 0);

    return { totalEvents, paidEvents, freeEvents, totalGuests };
  }, [events]);

  // Filter events based on search query and type filter
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        !searchQuery ||
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.shareCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = 
        filterType === 'ALL' ||
        (filterType === 'PAID' && event.isPaid) ||
        (filterType === 'FREE' && !event.isPaid);

      return matchesSearch && matchesFilter;
    });
  }, [events, searchQuery, filterType]);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mes Événements
            </h2>
            <span className="bg-indigo-50 text-indigo-600 font-bold text-xs px-3 py-1 rounded-full border border-indigo-100">
              {events.length} {events.length > 1 ? 'événements' : 'événement'}
            </span>
          </div>
          <p className="text-slate-500 font-medium text-xs">
            Gérez vos cérémonies, suivez les inscrits et imprimez vos badges d'invitation
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <GlobalBadgeButton />
          <NewEventButton />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Événements</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FiLayers size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalEvents}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Invités</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <FiUsers size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalGuests}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Événements Payants</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <FiDollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{stats.paidEvents}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Événements Gratuits</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FiTag size={16} />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{stats.freeEvents}</p>
        </div>
      </div>

      {/* Toolbar: Search, Filters & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Rechercher par nom d'événement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'ALL' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterType('PAID')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'PAID' 
                  ? 'bg-white text-amber-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Payants
            </button>
            <button
              onClick={() => setFilterType('FREE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'FREE' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Gratuits
            </button>
          </div>

          {/* View Switcher Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              title="Vue Tableau"
              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'table' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiList size={16} />
              <span className="hidden md:inline">Tableau</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Vue Grille"
              className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiGrid size={16} />
              <span className="hidden md:inline">Grille</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {filteredEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm text-center px-6">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
            <FiCalendar size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            {events.length === 0 ? 'Aucun événement' : 'Aucun résultat trouvé'}
          </h3>
          <p className="text-slate-500 text-xs font-medium max-w-sm mb-6">
            {events.length === 0 
              ? 'Créez votre premier événement pour commencer à ajouter des invités et imprimer des badges.'
              : 'Aucun événement ne correspond à vos critères de recherche.'}
          </p>
          {events.length === 0 && (
            <NewEventButton className="inline-flex items-center justify-center rounded-xl bg-indigo-600 py-3 px-6 text-center text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-md cursor-pointer">
              Créer un événement
            </NewEventButton>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* ULTRA-CLEAN SLIM TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Événement</th>
                  <th className="py-3.5 px-6">Accès / Tarif</th>
                  <th className="py-3.5 px-6 text-center">Invités</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs bg-white">
                {filteredEvents.map((event) => (
                  <tr 
                    key={event.id}
                    className="hover:bg-slate-50/70 transition-colors group bg-white"
                  >
                    {/* Event & Poster column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div 
                          onClick={() => setSelectedEvent(event)}
                          className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80 cursor-pointer shadow-sm group-hover:scale-105 transition-transform"
                          title="Cliquez pour afficher les détails et l'affiche"
                        >
                          {event.backgroundImageUrl ? (
                            <Image 
                              src={event.backgroundImageUrl} 
                              alt={event.name} 
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <FiImage size={20} />
                            </div>
                          )}
                        </div>

                        <div>
                          <button 
                            onClick={() => setSelectedEvent(event)}
                            className="font-extrabold text-sm text-slate-900 hover:text-indigo-600 transition-colors text-left line-clamp-1 cursor-pointer block"
                          >
                            {event.name}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Pricing column */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        event.isPaid 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {event.isPaid ? 'Payant' : 'Gratuit'}
                      </span>
                    </td>

                    {/* Guests column */}
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 font-extrabold px-3 py-1 rounded-full border border-indigo-100 text-xs">
                        <FiUsers size={13} />
                        <span>{event._count?.guests || 0} invités</span>
                      </div>
                    </td>

                    {/* Actions column */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* ICON DETAILS BUTTON (POPUP TRIGGER) */}
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100 transition-all cursor-pointer shadow-sm"
                          title="Voir tous les détails et l'affiche"
                        >
                          <FiEye size={16} />
                        </button>

                        {/* Manage button */}
                        <ManageEventButton 
                          href={`/dashboard/events/${event.id}`}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        />

                        {/* Share link button */}
                        <AppLink 
                          href={`/invite/${event.shareCode}`} 
                          target="_blank"
                          className="p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200/70 transition-all cursor-pointer"
                          title="Ouvrir la page publique d'invitation"
                        >
                          <FiExternalLink size={16} />
                        </AppLink>

                        {/* Delete button */}
                        <DeleteEventButton 
                          eventId={event.id} 
                          eventName={event.name} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Poster Header */}
                <div 
                  onClick={() => setSelectedEvent(event)}
                  className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 mb-4 cursor-pointer"
                >
                  {event.backgroundImageUrl ? (
                    <Image 
                      src={event.backgroundImageUrl} 
                      alt={event.name} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <FiImage size={40} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase shadow-sm border ${
                      event.isPaid 
                        ? 'bg-white text-amber-700 border-amber-200' 
                        : 'bg-white text-emerald-700 border-emerald-200'
                    }`}>
                      {event.isPaid ? 'Payant' : 'Gratuit'}
                    </span>
                  </div>
                </div>

                {/* Event Name */}
                <h3 
                  onClick={() => setSelectedEvent(event)}
                  className="text-base font-bold text-slate-900 truncate mb-1 cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  {event.name}
                </h3>
                
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-5">
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <FiUsers size={13} className="text-indigo-500" />
                    <span>{event._count?.guests || 0} invités</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white py-2.5 text-xs font-bold border border-indigo-100 transition-all cursor-pointer"
                >
                  <FiEye size={15} /> Voir Détails & Affiche
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <ManageEventButton 
                    href={`/dashboard/events/${event.id}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                  />
                  <AppLink 
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 py-2.5 text-xs font-bold text-slate-800 transition-all" 
                    href={`/invite/${event.shareCode}`} 
                    target="_blank"
                  >
                    <FiExternalLink size={13} />
                    Lien
                  </AppLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Detail Modal Popup */}
      <EventDetailModal 
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
