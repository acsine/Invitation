'use client';

import React from 'react';
import OAuth from '@/components/OAuth';
import Image from 'next/image';
import AppLink from '@/components/AppLink';
import { FiArrowLeft, FiStar, FiHeart, FiLock } from 'react-icons/fi';

export default function LoginPage() {
  return (
    <div className="relative flex h-screen items-stretch overflow-hidden bg-gray-50">
      

      {/* Left Side: Illustration & Branding */}
      <div className="relative hidden lg:flex w-7/12 flex-col justify-between p-20 overflow-hidden">
        <Image
          className="absolute inset-0 h-full w-full object-cover animate-float"
          src="/images/Gemini_Generated_Image_dut6h2dut6h2dut6.png"
          alt="Illustration"
          fill
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/40 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary font-black shadow-2xl">I</div>
             <span className="text-2xl font-black tracking-tighter uppercase">InviteManager</span>
          </div>
        </div>

        <div className="relative z-10 max-w-xl text-white space-y-8 animate-in slide-in-from-bottom-10 duration-1000">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-black uppercase tracking-widest">
              <FiStar className="text-yellow-400" /> Plateforme n°1
           </div>
           <h2 className="text-6xl font-black leading-[1.1] tracking-tighter">
             L'élégance au service de vos <span className="italic opacity-80 underline decoration-white/30 underline-offset-8">invités.</span>
           </h2>
           <p className="text-xl font-medium opacity-90 leading-relaxed">
             Gérez vos événements avec la puissance du digital et la finesse du design professionnel.
           </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex w-full flex-col justify-center items-center px-8 lg:w-5/12 bg-white relative z-20">
        <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-right-8 duration-700">
          
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">Connexion</h1>
            <p className="text-gray-400 font-medium">Bon retour parmi nous ! Veuillez vous connecter pour accéder à vos événements.</p>
          </div>

          <div className="space-y-8">
            <OAuth className="!shadow-none !px-0 !py-0 !bg-transparent text-left" disable />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span className="bg-white px-4">Sécurité maximale</span>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 space-y-6">
               <div className="flex items-center gap-4 text-gray-900">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm"><FiLock /></div>
                  <div className="text-sm font-bold uppercase tracking-widest">Compte Organisateur</div>
               </div>
               <p className="text-xs text-gray-400 leading-relaxed">
                 L'accès est réservé aux organisateurs enregistrés. Utilisez vos accès Google ou Email pour continuer.
               </p>
            </div>
          </div>

          <div className="pt-8 text-center border-t border-gray-50">
            <p className="text-sm font-medium text-gray-400">
              Pas encore de compte ?{' '}
              <AppLink href="/auth/register" className="font-black text-primary hover:underline uppercase text-[10px] tracking-widest ml-2">
                Rejoignez l'élite
              </AppLink>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
