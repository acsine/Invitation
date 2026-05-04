'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Loader from '@/components/Loader';
import { toast } from 'react-hot-toast';
import cn from 'classnames';
import { FiCheck, FiStar, FiZap, FiTarget, FiMessageSquare, FiShield } from 'react-icons/fi';

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        setPlans(data);
        setLoading(false);
      });
  }, []);

  const handleSubscribe = (planId) => {
    toast.success("Redirection vers le paiement sécurisé...");
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <Loader className="!h-10 !w-10 !text-primary" />
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chargement des offres...</span>
      </div>
    </div>
  );

  const currentPlanId = session?.user?.subscription?.planId;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Abonnement</h2>
           <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Optimisez votre puissance événementielle</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Serveurs Opérationnels</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {plans.map((plan) => {
          const isActive = currentPlanId === plan.id;
          const features = JSON.parse(plan.features || '[]');
          const isPremium = plan.price > 0;
          
          return (
            <div 
              key={plan.id} 
              className={cn(
                "group relative rounded-[48px] p-10 transition-all duration-500 flex flex-col border",
                isActive 
                  ? 'border-primary bg-primary/[0.02] shadow-2xl shadow-primary/10' 
                  : 'border-gray-100 bg-white hover:border-primary/30 hover:shadow-xl hover:-translate-y-2'
              )}
            >
              {isActive && (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2">
                  <FiCheck /> Votre Plan Actuel
                </div>
              )}
              
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{plan.name}</h3>
                   <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500", 
                     isPremium ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-gray-100 text-gray-400'
                   )}>
                      {isPremium ? <FiStar className={cn(isActive && "animate-spin")} style={{ animationDuration: '5s' }} /> : <FiZap />}
                   </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-gray-900 tracking-tighter">{plan.price.toLocaleString()}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">FCFA / mois</span>
                </div>
              </div>

              <div className="flex-1 space-y-8">
                <div>
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6">Capacités & Limites</p>
                   <ul className="space-y-4">
                     <li className="flex items-center gap-4 text-sm font-bold text-gray-900">
                       <div className="w-6 h-6 rounded-lg bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0">
                         <FiCheck size={14} />
                       </div>
                       {plan.maxEvents} Événement{plan.maxEvents > 1 ? 's' : ''}
                     </li>
                     <li className="flex items-center gap-4 text-sm font-bold text-gray-900">
                       <div className="w-6 h-6 rounded-lg bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0">
                         <FiCheck size={14} />
                       </div>
                       {plan.maxGuests} Invités
                     </li>
                   </ul>
                </div>

                {features.length > 0 && (
                   <div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6">Fonctionnalités</p>
                      <ul className="space-y-4">
                        {features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-4 text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">
                            <FiTarget size={14} className="text-primary/40 group-hover:text-primary transition-colors" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                   </div>
                )}
              </div>

              <button
                disabled={isActive}
                onClick={() => handleSubscribe(plan.id)}
                className={cn(
                  "w-full h-16 rounded-[24px] mt-12 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                  isActive
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : 'bg-primary text-white hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20'
                )}
              >
                {isActive ? 'Plan Actif' : 'Choisir ce plan'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="relative rounded-[48px] bg-white border border-gray-100 p-12 overflow-hidden shadow-sm group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl transition-all group-hover:bg-primary/10" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-gray-500 text-[10px] font-black uppercase tracking-widest">
               <FiMessageSquare /> Support Dédié
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Vous avez des besoins <span className="text-primary italic">spécifiques ?</span></h3>
            <p className="text-gray-500 font-medium max-w-xl">
              Pour les événements de grande envergure (+5 000 invités) ou les besoins institutionnels, contactez nos experts pour un devis personnalisé.
            </p>
          </div>
          <button className="h-16 px-10 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-primary hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group">
            <FiShield className="group-hover:rotate-12 transition-transform" /> Contacter le support
          </button>
        </div>
      </div>
    </div>
  );
}
