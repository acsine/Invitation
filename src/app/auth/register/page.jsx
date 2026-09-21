'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import cn from 'classnames';
import Button from '@/components/ui/Button';
import AppLink from '@/components/AppLink';
import Image from 'next/image';
import { FiArrowLeft, FiCheck, FiUser, FiMail, FiLock, FiStar, FiEye, FiEyeOff, FiArrowRight, FiShield, FiCheckCircle } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import { signIn } from 'next-auth/react';
import FullPageLoader from '@/components/FullPageLoader';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

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
    <div className="relative flex flex-col min-h-screen bg-[#F4F6FB] overflow-x-hidden">
      {isNavigating && <FullPageLoader message="Vers la connexion..." />}

      {/* TOP NAVBAR (Always Visible & Sticky at top) */}
      <header className="sticky top-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-12 py-3.5 flex items-center justify-between z-50 shadow-xs">
        <AppLink href="/" className="inline-flex items-center gap-2 cursor-pointer">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
            Invite<span className="text-[#FF6500]">Manager</span>
          </span>
        </AppLink>

        <nav className="hidden md:flex items-center gap-6 text-xs font-extrabold text-slate-600">
          <AppLink href="/" className="hover:text-[#3B52E8] transition-colors">Accueil</AppLink>
          <AppLink href="/#solutions" className="hover:text-[#3B52E8] transition-colors">Solutions</AppLink>
          <AppLink href="/#badges" className="hover:text-[#3B52E8] transition-colors">Badges & Pass</AppLink>
          <AppLink href="/#tarifs" className="hover:text-[#3B52E8] transition-colors">Tarifs</AppLink>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleGoHome}
            disabled={returnLoading}
            className="text-xs font-extrabold text-slate-600 hover:text-[#3B52E8] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FiArrowLeft size={16} />
            <span className="hidden sm:inline">Accueil</span>
          </button>
          
          <AppLink 
            href="/auth/login" 
            onClick={handleLoginNav}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#3B52E8] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
          >
            Se connecter
          </AppLink>
        </div>
      </header>

      {/* STEP 1: Split Screen Layout */}
      {step === 1 && (
        <div className="flex-1 flex flex-col lg:flex-row items-stretch">
          
          {/* Left Side: Illustration & Branding (5/12 width) */}
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

            {/* Hero Content & Micro Chips */}
            <div className="relative z-10 max-w-xl text-white space-y-8 animate-in slide-in-from-bottom-10 duration-1000 my-auto">
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

            <div className="relative z-10 text-xs font-semibold text-white/70">
              © {new Date().getFullYear()} InviteManager. Tous droits réservés.
            </div>
          </div>

          {/* Right Side: Register Form (7/12 width) */}
          <div className="flex w-full lg:w-7/12 flex-col justify-center items-center px-8 sm:px-16 bg-white py-12 relative z-20 shadow-xl overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
              
              <div className="text-center space-y-3">
                 <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-[#3B52E8]/10 text-[#3B52E8] text-xs font-black uppercase tracking-wider mb-1">
                    Étape 1 sur 2
                 </div>
                 <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight text-center">
                   Créer un compte
                 </h1>
                 <p className="text-slate-500 font-medium text-sm sm:text-base text-center max-w-md mx-auto">
                   Rejoignez InviteManager et commencez à organiser des événements d'exception.
                 </p>
              </div>

              <div className="space-y-6">
                {error && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-3">
                     <div className="w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center text-white font-black text-xs">!</div>
                     <span>{error}</span>
                  </div>
                )}
                
                {/* Google Sign-Up Button */}
                <button
                  type="button"
                  disabled={googleLoading || loading}
                  onClick={handleGoogleSignUp}
                  className="w-full relative py-4 px-6 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] group disabled:opacity-70"
                >
                  {googleLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Inscription Google en cours...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>S'inscrire avec Google</span>
                    </>
                  )}
                </button>

                {/* Or Divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-4 text-xs font-extrabold uppercase text-slate-400 absolute">ou par e-mail</span>
                </div>

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

            </div>
          </div>
        </div>
      )}

      {/* STEP 2: HORIZONTAL PLAN CARDS SELECTION (Side-by-Side Cards) */}
      {step === 2 && (
        <div className="flex-1 py-12 px-6 sm:px-12 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-full max-w-5xl space-y-10">
            
            {/* Header */}
            <div className="text-center space-y-3 max-w-xl mx-auto">
               <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-[#3B52E8]/10 text-[#3B52E8] text-xs font-black uppercase tracking-wider">
                  Étape 2 sur 2
               </div>
               <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight text-center">
                 Choisir votre offre
               </h1>
               <p className="text-slate-500 font-medium text-sm sm:text-base text-center">
                 Sélectionnez le plan qui correspond à vos ambitions événementielles.
               </p>
            </div>

            {/* HORIZONTAL CARDS GRID (Side-by-Side on Tablet/Desktop, Stacked on Mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 items-stretch max-w-4xl mx-auto pt-2">
              
              {/* Basic / Gratuit Plan */}
              <div className="group relative bg-white rounded-[24px] sm:rounded-[32px] border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-sm hover:border-[#3B52E8] hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                     <h3 className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tighter">Gratuit</h3>
                     <div className="w-9 h-9 sm:w-12 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-[#3B52E8] group-hover:text-white transition-all">
                       <FiUser size={18} className="sm:hidden" />
                       <FiUser size={20} className="hidden sm:block" />
                     </div>
                  </div>
                  <div className="flex items-baseline flex-wrap gap-1 mb-6 sm:mb-8">
                    <span className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter">0</span>
                    <span className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest">FCFA / mois</span>
                  </div>
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {['1 Événement actif', '50 Invités maximum', 'Pass QR Mobile'].map((f, i) => (
                      <li key={i} className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 text-[11px] sm:text-xs font-bold text-slate-700">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-blue-50 text-[#3B52E8] flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                          <FiCheck size={12} className="sm:hidden" />
                          <FiCheck size={14} className="hidden sm:block" />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button
                  onClick={() => handleSelectPlan('free')}
                  className="w-full py-3.5 sm:py-4 px-3 sm:px-6 rounded-xl sm:rounded-2xl border-2 border-slate-200 bg-white hover:bg-[#3B52E8] hover:text-white hover:border-[#3B52E8] text-slate-800 font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer mt-4 sm:mt-6"
                >
                  Choisir ce plan
                </button>
              </div>

              {/* Premium Plan (Featured) */}
              <div className="group relative bg-white rounded-[24px] sm:rounded-[32px] border-2 border-[#FF6500] p-5 sm:p-8 lg:p-10 shadow-2xl ring-4 ring-[#FF6500]/15 flex flex-col justify-between">
                <div className="absolute -top-3.5 sm:-top-4 right-4 sm:right-8 bg-[#FF6500] text-white px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-md">
                   Le plus populaire
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4 sm:mb-6 pt-1 sm:pt-2">
                     <h3 className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tighter">Premium</h3>
                     <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#FF6500] rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-md">
                       <FiStar size={18} className="sm:hidden animate-spin" style={{ animationDuration: '6s' }} />
                       <FiStar size={20} className="hidden sm:block animate-spin" style={{ animationDuration: '6s' }} />
                     </div>
                  </div>
                  <div className="flex items-baseline flex-wrap gap-1 mb-6 sm:mb-8">
                    <span className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter">10 000</span>
                    <span className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest">FCFA / mois</span>
                  </div>
                  <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {['Événements illimités', 'Badges HD illimités (PDF)', 'Scan illimité anti-fraude', 'Support prioritaire 24/7'].map((f, i) => (
                      <li key={i} className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 text-[11px] sm:text-xs font-bold text-slate-900">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-orange-50 text-[#FF6500] flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                          <FiCheck size={12} className="sm:hidden" />
                          <FiCheck size={14} className="hidden sm:block" />
                        </div>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan('premium')}
                  className="w-full py-3.5 sm:py-4 px-3 sm:px-6 rounded-xl sm:rounded-2xl bg-[#FF6500] hover:bg-[#e05900] text-white font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all cursor-pointer mt-4 sm:mt-6"
                >
                  M'abonner maintenant →
                </button>
              </div>

            </div>

            {/* Bottom link */}
            <div className="pt-4 text-center">
              <button
                onClick={() => handleSelectPlan(null)}
                className="text-xs font-extrabold text-slate-500 uppercase tracking-wider hover:text-[#3B52E8] transition-colors underline underline-offset-4 cursor-pointer"
              >
                Continuer avec l'offre gratuite pour l'instant
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
