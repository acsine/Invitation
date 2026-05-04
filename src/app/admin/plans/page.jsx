'use client';

import React, { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import { FiPlus, FiTrash2, FiEdit, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import cn from 'classnames';

export default function AdminPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    maxEvents: '',
    maxGuests: '',
    features: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const res = await fetch('/api/admin/plans');
    const data = await res.json();
    setPlans(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingPlan ? 'PUT' : 'POST';
    const body = {
      ...formData,
      price: parseFloat(formData.price),
      maxEvents: parseInt(formData.maxEvents),
      maxGuests: parseInt(formData.maxGuests),
      features: JSON.stringify(formData.features.split('\n').filter(f => f.trim() !== '')),
      id: editingPlan?.id
    };

    try {
      const res = await fetch('/api/admin/plans', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success(editingPlan ? 'Plan mis à jour' : 'Plan créé');
        setShowModal(false);
        fetchPlans();
        setFormData({ name: '', price: '', maxEvents: '', maxGuests: '', features: '' });
        setEditingPlan(null);
      }
    } catch (err) {
      toast.error('Erreur');
    }
  };

  const deletePlan = async (id) => {
    if (!confirm('Supprimer ce plan ?')) return;
    const res = await fetch(`/api/admin/plans?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Supprimé');
      fetchPlans();
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center py-20"><Loader /></div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center gap-6 flex-wrap">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Forfaits & Plans</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Offres d'abonnement et tarifs</p>
        </div>
        <button 
          onClick={() => { setShowModal(true); setEditingPlan(null); }}
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[20px] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          <FiPlus size={18} /> Nouveau Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col">
            <div className="p-10 border-b border-gray-50 bg-gray-50/30">
              <h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-widest">{plan.name}</h3>
              <div className="text-4xl font-black text-primary mb-6 tracking-tighter">{plan.price.toLocaleString()} <span className="text-sm font-bold text-gray-400">FCFA</span></div>
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="text-center">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Events</div>
                  <div className="text-sm font-black text-gray-900">{plan.maxEvents}</div>
                </div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="text-center">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Invités</div>
                  <div className="text-sm font-black text-gray-900">{plan.maxGuests}</div>
                </div>
              </div>
            </div>
            <div className="p-10 space-y-5 flex-1">
               <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Fonctionnalités</div>
               {JSON.parse(plan.features || '[]').map((f, i) => (
                 <div key={i} className="flex items-center gap-4 text-sm text-gray-600 font-bold group/feat">
                   <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-500 group-hover/feat:bg-green-500 group-hover/feat:text-white transition-colors">
                     <FiCheck size={14} />
                   </div>
                   {f}
                 </div>
               ))}
            </div>
            <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => {
                 setEditingPlan(plan);
                 setFormData({
                    name: plan.name,
                    price: plan.price.toString(),
                    maxEvents: plan.maxEvents.toString(),
                    maxGuests: plan.maxGuests.toString(),
                    features: JSON.parse(plan.features || '[]').join('\n')
                 });
                 setShowModal(true);
               }} className="p-3 text-gray-400 hover:text-primary hover:bg-white rounded-xl transition shadow-sm border border-transparent hover:border-gray-100"><FiEdit size={20} /></button>
               <button onClick={() => deletePlan(plan.id)} className="p-3 text-red-400 hover:text-red-500 hover:bg-white rounded-xl transition shadow-sm border border-transparent hover:border-red-50"><FiTrash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[48px] border border-gray-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{editingPlan ? 'Modifier le Plan' : 'Nouveau Plan'}</h3>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm transition">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Nom du forfait</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 text-sm font-bold focus:bg-white focus:border-primary focus:shadow-xl focus:shadow-primary/5 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Prix (FCFA)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 text-sm font-bold focus:bg-white focus:border-primary focus:shadow-xl focus:shadow-primary/5 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Max Événements</label>
                  <input required type="number" value={formData.maxEvents} onChange={e => setFormData({...formData, maxEvents: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 text-sm font-bold focus:bg-white focus:border-primary focus:shadow-xl focus:shadow-primary/5 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Max Invités</label>
                  <input required type="number" value={formData.maxGuests} onChange={e => setFormData({...formData, maxGuests: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 text-sm font-bold focus:bg-white focus:border-primary focus:shadow-xl focus:shadow-primary/5 outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Fonctionnalités (une par ligne)</label>
                <textarea required rows={4} value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 text-sm font-bold focus:bg-white focus:border-primary focus:shadow-xl focus:shadow-primary/5 outline-none transition-all resize-none" />
              </div>
              <button className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all text-xs mt-4">
                {editingPlan ? 'Enregistrer les modifications' : 'Créer le forfait'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
