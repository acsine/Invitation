'use client';

import React, { useState } from 'react';
import { FiDollarSign, FiPhone, FiCheckCircle, FiClock, FiXCircle, FiTrendingUp, FiCreditCard } from 'react-icons/fi';
import cn from 'classnames';
import Button from '@/components/ui/Button';

export default function WithdrawalForm({ availableBalance }) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !phone) return;
    if (parseInt(amount) > availableBalance) {
      setMsg({ type: 'error', text: 'Solde insuffisant' });
      return;
    }

    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const res = await fetch('/api/dashboard/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(amount), phone }),
      });

      if (res.ok) {
        setMsg({ type: 'success', text: 'Demande de retrait envoyée avec succès !' });
        setAmount('');
        setPhone('');
      } else {
        const data = await res.json();
        setMsg({ type: 'error', text: data.error || 'Une erreur est survenue' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm"><FiCreditCard size={24} /></div>
        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Faire un retrait</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {msg.text && (
          <div className={cn("p-4 rounded-2xl text-xs font-black uppercase tracking-widest", {
            "bg-green-50 text-green-500 border border-green-100": msg.type === 'success',
            "bg-red-50 text-red-500 border border-red-100": msg.type === 'error'
          })}>
            {msg.text}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Montant (FCFA)</label>
          <div className="relative group">
            <FiDollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Min. 5 000" 
              required
              className="w-full h-16 bg-gray-50 border border-gray-100 rounded-[24px] pl-14 pr-6 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-primary transition-all shadow-sm" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Numéro Mobile Money</label>
          <div className="relative group">
            <FiPhone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0700000000" 
              required
              className="w-full h-16 bg-gray-50 border border-gray-100 rounded-[24px] pl-14 pr-6 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-primary transition-all shadow-sm" 
            />
          </div>
        </div>

        <Button 
          type="submit"
          loading={loading}
          className="w-full h-16 rounded-[24px]"
        >
          Confirmer le retrait
        </Button>
      </form>
    </div>
  );
}
