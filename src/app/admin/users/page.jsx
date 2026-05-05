'use client';

import React, { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import { FiTrash2, FiShield, FiUser, FiSearch, FiBan, FiPlusCircle, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import cn from 'classnames';
import Button from '@/components/ui/Button';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showPlanModal, setShowPlanModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [uRes, pRes] = await Promise.all([
      fetch('/api/admin/users'),
      fetch('/api/admin/plans')
    ]);
    const uData = await uRes.json();
    const pData = await pRes.json();
    setUsers(uData);
    setPlans(pData);
    setLoading(false);
  };

  const handleToggleRole = (user) => {
    const newRole = user.role === 'ADMIN' ? 'ORGANIZER' : 'ADMIN';
    setConfirmModal({
      title: 'Changer le rôle',
      message: `Voulez-vous vraiment passer ${user.name || user.email} en tant que ${newRole} ?`,
      type: 'primary',
      onConfirm: async () => {
        setIsConfirming(true);
        const res = await fetch(`/api/admin/users`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id, role: newRole })
        });
        if (res.ok) {
          toast.success('Rôle mis à jour');
          fetchData();
        }
        setIsConfirming(false);
        setConfirmModal(null);
      }
    });
  };

  const handleDeleteUser = (user) => {
    setConfirmModal({
      title: 'Supprimer l\'utilisateur',
      message: `Attention : Toutes les données de ${user.email} seront définitivement supprimées. Cette action est irréversible.`,
      type: 'danger',
      onConfirm: async () => {
        setIsConfirming(true);
        const res = await fetch(`/api/admin/users?id=${user.id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Utilisateur supprimé');
          fetchData();
        }
        setIsConfirming(false);
        setConfirmModal(null);
      }
    });
  };

  const applyPlan = async (userId, planId) => {
    setIsConfirming(true);
    const res = await fetch(`/api/admin/users/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, planId })
    });

    if (res.ok) {
      toast.success('Abonnement appliqué');
      setShowPlanModal(null);
      fetchData();
    }
    setIsConfirming(false);
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex h-full items-center justify-center py-20"><Loader /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center gap-6 flex-wrap">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Utilisateurs</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Gestion des comptes membres</p>
        </div>
        <div className="relative w-full max-w-md group">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher par nom ou email..." 
            className="w-full bg-white border border-gray-200 rounded-[20px] py-4 pl-14 pr-6 text-gray-900 text-sm focus:border-primary shadow-sm focus:shadow-xl focus:shadow-primary/5 outline-none transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Utilisateur</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Rôle</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Abonnement</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Events</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-400 border border-gray-100 group-hover:scale-105 transition shadow-sm">
                        {user.name?.charAt(0) || <FiUser />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{user.name || 'Sans nom'}</div>
                        <div className="text-[11px] text-gray-400 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-center">
                    <span className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border", user.role === 'ADMIN' ? "bg-red-50 text-red-600 border-red-100" : "bg-primary/5 text-primary border-primary/10")}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-8 text-center">
                    <button 
                      onClick={() => setShowPlanModal(user)}
                      className="text-xs font-bold text-gray-400 hover:text-primary flex items-center gap-2 justify-center w-full group/btn transition-colors"
                    >
                      <span className={cn(user.subscription?.plan?.name ? "text-gray-900 font-black uppercase tracking-tighter" : "opacity-40 italic font-medium")}>
                        {user.subscription?.plan?.name || 'Aucun'}
                      </span>
                      <FiPlusCircle className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </button>
                  </td>
                  <td className="p-8 text-center">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-gray-50 flex items-center justify-center text-sm font-black text-gray-900 border border-gray-100">
                       {user._count.events}
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex justify-end gap-3">
                       <button 
                        onClick={() => handleToggleRole(user)}
                        className="p-3 text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white rounded-2xl transition shadow-sm" 
                        title="Changer le rôle"
                       >
                         <FiShield size={18} />
                       </button>
                       <button 
                        onClick={() => handleDeleteUser(user)}
                        className="p-3 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-2xl transition shadow-sm"
                        title="Supprimer"
                       >
                         <FiTrash2 size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-gray-50 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Appliquer un Plan</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">{showPlanModal.email}</p>
              </div>
              <button onClick={() => setShowPlanModal(null)} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition">✕</button>
            </div>
            <div className="p-10 space-y-4">
               {plans.map(plan => (
                 <Button 
                   key={plan.id}
                   onClick={() => applyPlan(showPlanModal.id, plan.id)}
                   variant="ghost"
                   loading={isConfirming}
                   className="w-full flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-primary hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all group text-left h-auto"
                 >
                   <div>
                     <div className="text-sm font-black text-gray-900 uppercase tracking-widest">{plan.name}</div>
                     <div className="text-xs text-gray-400 font-bold mt-1">{plan.price.toLocaleString()} FCFA</div>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                     <FiCheckCircle size={18} />
                   </div>
                 </Button>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[48px] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-12 text-center">
              <div className={cn(
                "w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-xl",
                confirmModal.type === 'danger' ? "bg-red-50 text-red-500 shadow-red-100" : "bg-primary/5 text-primary shadow-primary/5"
              )}>
                {confirmModal.type === 'danger' ? <FiAlertTriangle size={40} /> : <FiShield size={40} />}
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tight">{confirmModal.title}</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-12">
                {confirmModal.message}
              </p>
              <div className="flex flex-col gap-4">
                <Button 
                  onClick={confirmModal.onConfirm}
                  loading={isConfirming}
                  variant={confirmModal.type === 'danger' ? 'danger' : 'primary'}
                  className="w-full py-5 rounded-[24px] text-xs h-14"
                >
                  Confirmer
                </Button>
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="w-full py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs text-gray-400 hover:text-gray-900 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
