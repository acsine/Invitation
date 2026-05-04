'use client';

import React from 'react';
import AppLink from '../AppLink';
import Image from 'next/image';

const Footers = () => {
  return (
    <footer className="relative pt-32 pb-16 bg-primary overflow-hidden text-white">
      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
      
      <div className="container mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary font-black shadow-lg shadow-black/10">I</div>
              <span className="text-2xl font-black tracking-tighter uppercase">InviteManager</span>
            </div>
            <p className="text-white/70 text-lg font-medium max-w-sm leading-relaxed">
              L'outil indispensable pour les organisateurs d'événements exigeants. Créativité, automatisation et performance.
            </p>
          </div>
          
          <div className="space-y-6">
            <h5 className="text-xs font-black text-white uppercase tracking-[0.3em]">Navigation</h5>
            <ul className="space-y-4 text-sm text-white/60 font-bold">
              <li><AppLink href="/dashboard/events" className="hover:text-white transition-colors">Événements</AppLink></li>
              <li><AppLink href="/dashboard/subscription" className="hover:text-white transition-colors">Abonnement</AppLink></li>
              <li><AppLink href="/dashboard/finances" className="hover:text-white transition-colors">Finances</AppLink></li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h5 className="text-xs font-black text-white uppercase tracking-[0.3em]">Contact</h5>
            <ul className="space-y-4 text-sm text-white/60 font-bold">
              <li className="flex items-center gap-2">support@invitemanager.com</li>
              <li>Abidjan, Côte d'Ivoire</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            © 2026 InviteManager — Powered by Excellence.
          </p>
          <div className="flex gap-8">
            <AppLink href="#" className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">Confidentialité</AppLink>
            <AppLink href="#" className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">C.G.U</AppLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footers;
