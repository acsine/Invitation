'use client';

import React, { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import { FiActivity, FiUser, FiClock, FiInfo } from 'react-icons/fi';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/dashboard/logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action) => {
    switch (action) {
      case 'SYNC_GUESTS': return 'Synchronisation des invités';
      case 'SCAN_INVITATION': return 'Scan d\'invitation';
      default: return action;
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center py-20"><Loader /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Logs d'activité</h2>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Actions effectuées par votre équipe mobile</p>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Heure</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilisateur</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => {
                const details = JSON.parse(log.details || '{}');
                return (
                  <tr key={log.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="p-8">
                      <div className="flex items-center gap-3 text-gray-900 font-bold text-sm">
                        <FiClock className="text-gray-300" />
                        {dayjs(log.createdAt).format('DD MMM YYYY [à] HH:mm')}
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs">
                          {log.user.name?.charAt(0) || <FiUser />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{log.user.name || log.user.email}</div>
                          <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{log.user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-widest">
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex justify-end gap-2 text-[11px] font-bold text-gray-500">
                        {details.guestCount && <span>{details.guestCount} invités traités</span>}
                        {details.eventId && <FiInfo className="text-gray-300" title={`Event ID: ${details.eventId}`} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-gray-400 font-bold italic">
                    Aucune activité enregistrée pour le moment.
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
