'use client';

import React, { useState, useEffect } from 'react';
import Loader from '@/components/Loader';
import Button from '@/components/ui/Button';
import { FiUsers, FiUserPlus, FiTrash2, FiMail, FiLock, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/dashboard/staff');
      const data = await res.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Erreur lors du chargement de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success('Membre de l\'équipe ajouté !');
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '' });
        fetchStaff();
      } else {
        toast.error(data.error || 'Une erreur est survenue');
      }
    } catch (error) {
      toast.error('Erreur lors de la création');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce membre ?')) return;

    try {
      const res = await fetch(`/api/dashboard/staff?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Membre supprimé');
        fetchStaff();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur serveur');
    }
  };

  if (loading) return <div className="flex h-full items-center justify-center py-20"><Loader /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Gestion de l'Équipe</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Créez des comptes pour vos agents mobiles</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="rounded-2xl px-8 py-4 h-auto shadow-xl shadow-primary/20 flex items-center gap-3"
        >
          <FiUserPlus size={18} />
          <span>Ajouter un agent</span>
        </Button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm text-[#23262F]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rôle</th>
                <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black text-xs">
                        {member.name?.charAt(0) || <FiUser />}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="p-8 text-sm text-gray-500 font-medium">{member.email}</td>
                  <td className="p-8">
                    <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-widest">
                      {member.role}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    <button 
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-gray-400 font-bold italic">
                    Aucun agent configuré pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Nouvel Agent</h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Accès application mobile</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <FiUsers size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Nom complet</label>
                <div className="relative group">
                  <FiUser className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Jean Dupont"
                    className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Adresse Email</label>
                <div className="relative group">
                  <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="agent@exemple.com"
                    className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Mot de passe provisoire</label>
                <div className="relative group">
                  <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-2xl py-5 h-auto text-sm font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  loading={submitting}
                  className="flex-1 rounded-2xl py-5 h-auto text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                  Créer le compte
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
