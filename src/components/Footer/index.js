'use client';

import React from 'react';
import AppLink from '../AppLink';
import { FiMail, FiMapPin, FiSend, FiGlobe, FiShield, FiHeart } from 'react-icons/fi';
import Button from '../ui/Button';

const Footers = () => {
  return (
    <footer className="relative pt-24 pb-12 bg-slate-950 text-slate-100 overflow-hidden border-t border-slate-900">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-slate-800/60">
          
          {/* Brand Info */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/25">
                I
              </div>
              <span className="text-2xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                InviteManager
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
              La plateforme de référence pour concevoir, distribuer et gérer vos invitations d'événements physiques & virtuels avec élégance.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 w-fit">
              <FiGlobe className="text-indigo-400" size={16} />
              <span>Disponible partout en Afrique & International</span>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="space-y-4">
            <h5 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Navigation</h5>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              <li><AppLink href="/dashboard/events" className="hover:text-white transition-colors flex items-center gap-1.5">Événements</AppLink></li>
              <li><AppLink href="/dashboard/subscription" className="hover:text-white transition-colors flex items-center gap-1.5">Abonnement</AppLink></li>
              <li><AppLink href="/dashboard/finances" className="hover:text-white transition-colors flex items-center gap-1.5">Finances</AppLink></li>
              <li><AppLink href="/scan" className="hover:text-white transition-colors flex items-center gap-1.5">Scanner Pass</AppLink></li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div className="space-y-4">
            <h5 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Solutions</h5>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              <li><a href="#solutions" className="hover:text-white transition-colors">Mariages & Galas</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Conférences B2B</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Offres Entreprises</a></li>
              <li><a href="#demo" className="hover:text-white transition-colors">Démonstration</a></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="space-y-4">
            <h5 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">Restez informé</h5>
            <p className="text-xs text-slate-400 leading-relaxed">Recevez nos dernières innovations produit.</p>
            <div className="space-y-2">
              <div className="relative flex items-center">
                <input 
                  type="email" 
                  placeholder="votre@email.com" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all pr-10"
                />
                <button type="button" className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors">
                  <FiSend size={12} />
                </button>
              </div>
            </div>
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-2"><FiMail className="text-indigo-400" size={14} /> support@invitemanager.com</p>
              <p className="flex items-center gap-2"><FiMapPin className="text-indigo-400" size={14} /> Abidjan, Côte d'Ivoire</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
          <p className="flex items-center gap-1.5">
            © 2026 InviteManager. Conçu avec <FiHeart className="text-rose-500 fill-rose-500" size={12} /> pour vos événements.
          </p>
          <div className="flex gap-6">
            <AppLink href="#" className="hover:text-slate-300 transition-colors">Confidentialité</AppLink>
            <AppLink href="#" className="hover:text-slate-300 transition-colors">Conditions Générales</AppLink>
            <AppLink href="#" className="hover:text-slate-300 transition-colors">Sécurité</AppLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footers;
