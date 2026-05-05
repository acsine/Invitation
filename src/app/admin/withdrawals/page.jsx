'use client';

import React, { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import { FiCheck, FiX, FiClock, FiPhone } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import cn from 'classnames';
import Button from '@/components/ui/Button';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    const res = await fetch('/api/admin/withdrawals');
    const data = await res.json();
    setWithdrawals(data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    const action = status === 'COMPLETED' ? 'Approuver' : 'Rejeter';
    if (!confirm(`${action} cette demande de retrait ?`)) return;

    setProcessingId(id + status);
    const res = await fetch(`/api/admin/withdrawals`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });

    if (res.ok) {
      toast.success(`Demande ${status === 'COMPLETED' ? 'approuvée' : 'rejetée'}`);
      fetchWithdrawals();
    }
    setProcessingId(null);
  };

  if (loading) return <div className="flex h-full items-center justify-center py-20"><Loader /></div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Demandes de Retrait</h2>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Paiements aux organisateurs</p>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Organisateur</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Montant</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">N° Mobile Money</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Date</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Statut</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-400 border border-gray-100 group-hover:scale-105 transition shadow-sm">
                        {w.user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{w.user.name || 'Utilisateur'}</div>
                        <div className="text-[11px] text-gray-400 font-medium">{w.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <div className="text-2xl font-black text-primary tracking-tighter">
                      {w.amount.toLocaleString()} <span className="text-[10px] font-bold text-gray-400 uppercase">FCFA</span>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm font-black text-gray-900 bg-gray-50/50 py-2 px-4 rounded-xl border border-gray-100 inline-flex mx-auto">
                      <FiPhone className="text-primary" /> {w.mobileNumber}
                    </div>
                  </td>
                  <td className="p-8 text-center text-[11px] font-black text-gray-300 uppercase tracking-widest">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-8 text-center">
                    <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border", {
                      "bg-green-50 text-green-600 border-green-100": w.status === 'COMPLETED',
                      "bg-yellow-50 text-yellow-600 border-yellow-100": w.status === 'PENDING',
                      "bg-red-50 text-red-600 border-red-100": w.status === 'REJECTED'
                    })}>
                      {w.status === 'COMPLETED' ? 'Terminé' : w.status === 'PENDING' ? 'En attente' : 'Rejeté'}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    {w.status === 'PENDING' && (
                      <div className="flex justify-end gap-3">
                        <Button 
                          onClick={() => updateStatus(w.id, 'COMPLETED')}
                          className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition shadow-sm border border-green-100 h-12 w-12"
                          title="Approuver"
                          loading={processingId === w.id + 'COMPLETED'}
                        >
                          <FiCheck size={20} />
                        </Button>
                        <Button 
                          onClick={() => updateStatus(w.id, 'REJECTED')}
                          className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition shadow-sm border border-red-100 h-12 w-12"
                          title="Rejeter"
                          loading={processingId === w.id + 'REJECTED'}
                        >
                          <FiX size={20} />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-32 text-center text-gray-400 italic font-medium">
                    <FiClock size={48} className="mx-auto mb-4 opacity-10" />
                    Aucune demande de retrait en cours.
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
