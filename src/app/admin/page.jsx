'use client';

import React, { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import { FiUsers, FiCalendar, FiDollarSign, FiTrendingUp, FiExternalLink } from 'react-icons/fi';
import cn from 'classnames';
import AppLink from '@/components/AppLink';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><Loader /></div>;

  const statCards = [
    { label: 'Utilisateurs', value: stats.usersCount, icon: FiUsers, color: 'bg-blue-600', shadow: 'shadow-blue-200' },
    { label: 'Événements', value: stats.eventsCount, icon: FiCalendar, color: 'bg-purple-600', shadow: 'shadow-purple-200' },
    { label: 'Revenu Total', value: `${stats.totalRevenue.toLocaleString()} FCFA`, icon: FiDollarSign, color: 'bg-emerald-600', shadow: 'shadow-emerald-200' },
    { label: 'Abonnements Actifs', value: stats.activeSubscriptions, icon: FiTrendingUp, color: 'bg-pink-600', shadow: 'shadow-pink-200' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Vue d'ensemble</h2>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Tableau de bord de pilotage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group relative overflow-hidden">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 transition-transform group-hover:rotate-12 shadow-xl", s.color, s.shadow)}>
              <s.icon size={28} />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{s.value}</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Users Table */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Nouveaux Inscrits</h3>
            <AppLink href="/admin/users" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Voir tout</AppLink>
          </div>
          <div className="overflow-x-auto custom-scrollbar max-h-[450px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-6 border-b border-gray-100">Utilisateur</th>
                  <th className="p-6 border-b border-gray-100 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentUsers.map(u => (
                  <tr key={u.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-xs font-black text-gray-400 group-hover:text-primary transition-colors">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{u.name || 'Utilisateur'}</div>
                          <div className="text-[10px] text-gray-400 font-medium">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <span className="text-[11px] font-black text-gray-300 uppercase tracking-tighter">{new Date(u.createdAt).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Events Table */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Activités Récentes</h3>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="overflow-x-auto custom-scrollbar max-h-[450px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="p-6 border-b border-gray-100">Événement</th>
                  <th className="p-6 border-b border-gray-100 text-center">Invités</th>
                  <th className="p-6 border-b border-gray-100 text-right">Lien</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentEvents.map(e => (
                  <tr key={e.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{e.name}</div>
                        <div className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Par {e.user.name || 'Anonyme'}</div>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="bg-primary/10 px-3 py-1.5 rounded-full text-[10px] font-black text-primary uppercase tracking-widest">{e._count.guests}</span>
                    </td>
                    <td className="p-6 text-right">
                      <AppLink href={`/invite/${e.shareCode}`} className="w-10 h-10 inline-flex items-center justify-center bg-gray-50 rounded-xl text-gray-300 hover:text-primary hover:bg-primary/5 transition-all">
                        <FiExternalLink size={18} />
                      </AppLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
