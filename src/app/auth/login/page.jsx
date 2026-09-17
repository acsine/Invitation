'use client';

import React from 'react';
import OAuth from '@/components/OAuth';
import Image from 'next/image';
import AppLink from '@/components/AppLink';
import { FiStar, FiShield, FiCheckCircle, FiLock } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';

export default function LoginPage() {
  return (
    <div className="relative flex h-screen items-stretch overflow-hidden bg-[#F4F6FB]">
      
      {/* Left Side: Illustration & Branding (5/12 width) */}
      <div className="relative hidden lg:flex w-5/12 flex-col justify-between p-14 overflow-hidden">
        <Image
          className="absolute inset-0 h-full w-full object-cover animate-float-slow"
          src="/images/Gemini_Generated_Image_dut6h2dut6h2dut6.png"
          alt="Illustration"
          fill
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B52E8]/90 via-[#3B52E8]/60 to-[#FF6500]/35" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
        
        {/* Brand Header */}
        <div className="relative z-10">
          <AppLink href="/" className="inline-flex items-center gap-2 cursor-pointer">
             <span className="text-2xl font-black tracking-tight text-white uppercase">
               Invite<span className="text-[#FF6500]">Manager</span>
             </span>
          </AppLink>
        </div>

        {/* Floating Feature Badges */}
        <div className="relative z-10 max-w-xl text-white space-y-8 animate-in slide-in-from-bottom-10 duration-1000">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-black uppercase tracking-widest text-white">
              <FiStar className="text-[#FF6500]" size={16} /> <span>Plateforme N°1 de Gestion Événementielle</span>
           </div>
           
           <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight">
             L'élégance au service de vos <br />
             <span className="text-[#FF6500] relative inline-block">
               événements
             </span>
           </h2>

           <p className="text-base font-medium text-blue-50 leading-relaxed max-w-lg">
             Gérez vos invités, générez des badges HD et effectuez le check-in en temps réel avec la puissance du digital.
           </p>

           {/* Micro Feature Chips */}
           <div className="flex flex-wrap items-center gap-3 pt-2">
             <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 flex items-center gap-2 text-xs font-bold text-white">
               <FiCheckCircle className="text-emerald-400" size={15} />
               <span>Check-in &lt; 0.5s</span>
             </div>
             <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 flex items-center gap-2 text-xs font-bold text-white">
               <BsQrCode className="text-[#FF6500]" size={15} />
               <span>Badges HD & Pass QR</span>
             </div>
             <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 flex items-center gap-2 text-xs font-bold text-white">
               <FiShield className="text-amber-300" size={15} />
               <span>100% Anti-Fraude</span>
             </div>
           </div>
        </div>

        {/* Bottom copyright / tag */}
        <div className="relative z-10 text-xs font-semibold text-white/70">
          © {new Date().getFullYear()} InviteManager. Tous droits réservés.
        </div>
      </div>

      {/* Right Side: Login Form (7/12 width - Slightly Larger) */}
      <div className="flex w-full lg:w-7/12 flex-col justify-center items-center px-8 sm:px-16 bg-white relative z-20 shadow-2xl overflow-y-auto">
        <div className="w-full max-w-lg py-12 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          
          <div className="text-center space-y-3">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight text-center">Connexion</h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base text-center max-w-md mx-auto">
              Bon retour parmi nous ! Connectez-vous à votre espace organisateur.
            </p>
          </div>

          <OAuth className="!shadow-none !p-0 !bg-transparent" disable />

          <div className="bg-[#F4F6FB] p-6 rounded-2xl border border-slate-200/70 space-y-3">
             <div className="flex items-center gap-3 text-slate-900 justify-center">
                <div className="w-8 h-8 bg-[#3B52E8]/10 rounded-xl flex items-center justify-center text-[#3B52E8] font-bold"><FiLock size={16} /></div>
                <div className="text-xs font-black uppercase tracking-wider text-slate-900">Accès Sécurisé</div>
             </div>
             <p className="text-xs text-slate-500 font-medium leading-relaxed text-center">
               Cet accès est strictement réservé aux organisateurs et hôtes autorisés.
             </p>
          </div>

          <div className="pt-6 text-center border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 text-center">
              Pas encore de compte ?{' '}
              <AppLink href="/auth/register" className="font-black text-[#FF6500] hover:text-[#e05900] uppercase text-xs tracking-wider ml-1 transition-colors">
                Créer mon compte →
              </AppLink>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
