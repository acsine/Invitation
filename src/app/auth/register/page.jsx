'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import cn from 'classnames';
import Button from '@/components/ui/Button';
import AppLink from '@/components/AppLink';
import Image from 'next/image';
import { FiArrowLeft, FiCheck, FiUser, FiMail, FiLock, FiStar, FiEye, FiEyeOff, FiArrowRight, FiShield, FiCheckCircle } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import FullPageLoader from '@/components/FullPageLoader';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { push } = useRouter();

  const handleLoginNav = (e) => {
    e.preventDefault();
    setIsNavigating(true);
    setTimeout(() => {
      push('/auth/login');
    }, 800);
  };

  const handleGoHome = () => {
    setReturnLoading(true);
    push('/');
  };

  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2); // Move to subscription step
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId) => {
    push('/auth/login?msg=registered');
  };

  return (
    <div className="relative flex h-screen items-stretch overflow-hidden bg-[#F4F6FB]">
      {isNavigating && <FullPageLoader message="Vers la connexion..." />}

      {/* Left Side: Illustration & Branding (5/12 width - Same as Login) */}
      <div className="relative hidden lg:flex w-5/12 flex-col justify-between p-14 overflow-hidden">
        <Image
          className="absolute inset-0 h-full w-full object-cover animate-float-slow"
          src="/images/Gemini_Generated_Image_eg2gk8eg2gk8eg2g.png"
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

        {/* Hero Content & Micro Chips */}
        <div className="relative z-10 max-w-xl text-white space-y-8 animate-in slide-in-from-bottom-10 duration-1000">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-black uppercase tracking-widest text-white">
              <FiStar className="text-[#FF6500]" size={16} /> <span>Plateforme N°1 de Gestion Événementielle</span>
           </div>
           
           <h2 className="text-4xl lg:text-5xl font-black leading-[1.1] tracking-tight">
             Organisez des moments <br />
             <span className="text-[#FF6500] relative inline-block">
               inoubliables
             </span>
           </h2>

           <p className="text-base font-medium text-blue-50 leading-relaxed max-w-lg">
             Des mariages aux galas, nous automatisons la logistique pour que vous puissiez vous concentrer sur vos invités.
           </p>

           {/* Micro Feature Chips */}
           <div className="flex flex-wrap items-center gap-3 pt-2">
             <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 flex items-center gap-2 text-xs font-bold text-white">
               <FiCheckCircle className="text-emerald-400" size={15} />
               <span>100% Gratuit au démarrage</span>
             </div>
             <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 flex items-center gap-2 text-xs font-bold text-white">
               <BsQrCode className="text-[#FF6500]" size={15} />
               <span>Badges HD & Pass QR</span>
             </div>
             <div className="bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 flex items-center gap-2 text-xs font-bold text-white">
               <FiShield className="text-amber-300" size={15} />
               <span>Données 100% Sécurisées</span>
             </div>
           </div>

           {/* Stats */}
           <div className="flex gap-8 pt-4 border-t border-white/15">
              <div className="flex flex-col">
                 <span className="text-3xl font-black text-white">500+</span>
                 <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-100">Événements réussis</span>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="flex flex-col">
                 <span className="text-3xl font-black text-white">2min</span>
                 <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-100">Temps de création</span>
              </div>
           </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs font-semibold text-white/70">
          © {new Date().getFullYear()} InviteManager. Tous droits réservés.
        </div>
      </div>

      {/* Right Side: Register Form Section (7/12 width - Same as Login) */}
      <div className="flex w-full lg:w-7/12 flex-col justify-center items-center px-8 sm:px-16 bg-white relative z-20 shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-lg py-12 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          
          {/* Form Header */}
          <div className="text-center space-y-3">
             <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-[#3B52E8]/10 text-[#3B52E8] text-xs font-black uppercase tracking-wider mb-1">
                Étape {step} sur 2
             </div>
             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight text-center">
               {step === 1 ? 'Créer un compte' : 'Choisir votre offre'}
             </h1>
             <p className="text-slate-500 font-medium text-sm sm:text-base text-center max-w-md mx-auto">
               {step === 1 
                 ? 'Rejoignez InviteManager et commencez à organiser des événements d\'exception.' 
                 : 'Sélectionnez le plan qui correspond à vos ambitions événementielles.'}
             </p>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-3">
                   <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center text-white font-black text-xs">!</div>
                   <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleRegister} className="space-y-5">
                
                {/* Full Name */}
                <div className="space-y-2 text-left">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">Nom Complet</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <FiUser size={18} />
                    </div>
                    <input
                      type="text"
                      name="name"
                      placeholder="ex: Jean Dupont"
                      onChange={handleChange}
                      value={fields.name}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-[#F4F6FB] py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-[#3B52E8] focus:ring-4 focus:ring-[#3B52E8]/10"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2 text-left">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">Adresse E-mail</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <FiMail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="ex: jean@exemple.com"
                      onChange={handleChange}
                      value={fields.email}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-[#F4F6FB] py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-[#3B52E8] focus:ring-4 focus:ring-[#3B52E8]/10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2 text-left">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">Mot de passe</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <FiLock size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Min. 6 caractères"
                      onChange={handleChange}
                      value={fields.password}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-[#F4F6FB] py-3.5 pl-11 pr-11 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-[#3B52E8] focus:ring-4 focus:ring-[#3B52E8]/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-2xl bg-[#FF6500] hover:bg-[#e05900] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/25 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-70"
                  >
                    {loading ? (
                      <span>Création du compte...</span>
                    ) : (
                      <>
                        <span>Démarrer l'aventure</span>
                        <FiArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleGoHome}
                    disabled={returnLoading}
                    className="w-full py-3.5 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <FiArrowLeft size={16} />
                    <span>Retour à l'accueil</span>
                  </button>
                </div>
              </form>

              <div className="pt-6 text-center border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 text-center">
                  Déjà membre ?{' '}
                  <AppLink 
                    href="/auth/login" 
                    onClick={handleLoginNav}
                    className="font-black text-[#FF6500] hover:text-[#e05900] uppercase text-xs tracking-wider ml-1 transition-colors"
                  >
                    Se connecter →
                  </AppLink>
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-6 w-full max-w-lg">
              <div className="grid grid-cols-1 gap-6">
                {/* Basic Plan */}
                <div className="group relative bg-white rounded-[32px] border border-slate-200 p-8 shadow-none hover:border-[#3B52E8] hover:shadow-xl transition-all duration-500">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Gratuit</h3>
                     <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-[#3B52E8] group-hover:text-white transition-all"><FiUser /></div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">0</span>
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">FCFA / mois</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {['1 Événement actif', '50 Invités maximum', 'Pass QR Mobile'].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-700">
                        <FiCheck className="text-[#3B52E8]" size={16} /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSelectPlan('free')}
                    className="w-full py-3.5 px-6 rounded-2xl border-2 border-slate-200 bg-white hover:bg-[#3B52E8] hover:text-white text-slate-800 font-extrabold text-xs transition-all cursor-pointer"
                  >
                    Choisir ce plan
                  </button>
                </div>

                {/* Premium Plan */}
                <div className="group relative bg-white rounded-[32px] border-2 border-[#FF6500] p-8 shadow-xl ring-4 ring-[#FF6500]/20 scale-105">
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#FF6500] text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-md">
                     Le plus populaire
                  </div>
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Premium</h3>
                     <div className="w-10 h-10 bg-[#FF6500] rounded-xl flex items-center justify-center text-white"><FiStar className="animate-spin" style={{ animationDuration: '4s' }} /></div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">10 000</span>
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">FCFA / mois</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {['Événements illimités', 'Badges HD illimités (PDF)', 'Scan illimité anti-fraude', 'Support prioritaire 24/7'].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-900">
                        <FiCheck className="text-[#FF6500]" size={16} /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSelectPlan('premium')}
                    className="w-full py-4 px-6 rounded-2xl bg-[#FF6500] hover:bg-[#e05900] text-white font-black text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                  >
                    M'abonner maintenant →
                  </button>
                </div>
              </div>

              <div className="pt-8 text-center">
                <button
                  onClick={() => handleSelectPlan(null)}
                  className="text-xs font-extrabold text-slate-400 uppercase tracking-wider hover:text-[#3B52E8] transition-colors underline underline-offset-4 cursor-pointer"
                >
                  Continuer avec l'offre gratuite pour l'instant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
