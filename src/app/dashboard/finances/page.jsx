import React from 'react';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import cn from 'classnames';
import { FiTrendingUp, FiClock, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import WithdrawalForm from '@/components/dashboard/WithdrawalForm';

export default async function FinancesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) return null;

  const payments = await prisma.payment.findMany({
    where: { 
      guest: { 
        event: { userId: session.user.id } 
      }, 
      status: 'CONFIRMED' 
    },
  });

  const totalEarnings = payments.reduce((acc, curr) => acc + curr.netAmount, 0);
  const totalCommission = payments.reduce((acc, curr) => acc + curr.commission, 0);

  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'COMPLETED' || w.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const availableBalance = Math.max(0, totalEarnings - totalWithdrawn);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
         <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Finances</h2>
         <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Gestion des revenus et retraits</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-primary p-10 rounded-[48px] shadow-2xl shadow-primary/30 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000" />
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">
                <FiTrendingUp /> Revenus Disponibles
             </div>
             <div className="text-5xl font-black text-white tracking-tighter">
                {availableBalance.toLocaleString()} <span className="text-xl opacity-60">FCFA</span>
             </div>
             <div className="pt-4 flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest">
                <FiCheckCircle /> Prêt pour le retrait
             </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
             <div className="flex items-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <FiInfo /> Frais de Service (3%)
             </div>
             <div className="text-4xl font-black text-gray-900 tracking-tighter">
                {totalCommission.toLocaleString()} <span className="text-lg opacity-30 text-gray-400">FCFA</span>
             </div>
             <p className="text-xs text-gray-400 font-medium">
               Ces frais nous permettent de maintenir la plateforme et sécuriser vos paiements.
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Withdrawal Form Section */}
        <WithdrawalForm availableBalance={availableBalance} />

        {/* History Section */}
        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10 px-2">
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Historique des retraits</h3>
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300"><FiClock /></div>
          </div>

          <div className="flex-1 overflow-hidden">
            {withdrawals.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center text-gray-200"><FiClock size={32} /></div>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Aucune activité enregistrée</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {withdrawals.map((w) => (
                  <div key={w.id} className="flex justify-between items-center p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:bg-white hover:border-primary/20 transition-all group">
                    <div className="space-y-1">
                      <div className="font-black text-lg text-gray-900 tracking-tighter">{w.amount.toLocaleString()} FCFA</div>
                      <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        {new Date(w.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div className={cn("text-[10px] font-black px-5 py-2 rounded-2xl uppercase tracking-[0.2em] border shadow-sm", {
                      "bg-green-500 text-white border-transparent": w.status === 'COMPLETED',
                      "bg-yellow-50 text-yellow-600 border-yellow-100": w.status === 'PENDING',
                      "bg-red-50 text-red-600 border-red-100": w.status === 'REJECTED'
                    })}>
                      {w.status === 'COMPLETED' ? 'Validé' : w.status === 'PENDING' ? 'En attente' : 'Refusé'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
