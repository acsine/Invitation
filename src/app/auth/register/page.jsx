'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import cn from 'classnames';
import Button from '@/components/ui/Button';
import AppLink from '@/components/AppLink';
import Image from 'next/image';
import { FiArrowLeft, FiCheck, FiUser, FiMail, FiLock, FiStar, FiZap } from 'react-icons/fi';
import FullPageLoader from '@/components/FullPageLoader';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [fields, setFields] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [error, setError] = useState('');
  const { push } = useRouter();

  const handleLoginNav = (e) => {
    e.preventDefault();
    setIsNavigating(true);
    // Small delay to feel premium
    setTimeout(() => {
      push('/auth/login');
    }, 800);
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
    <div className="relative flex h-screen items-stretch overflow-hidden bg-gray-50">
      {isNavigating && <FullPageLoader message="Vers la connexion..." />}
      

      {/* Left Side: Form Section */}
      <div className="flex w-full flex-col justify-center items-center px-8 lg:w-5/12 bg-white relative z-20 overflow-y-auto custom-scrollbar">
        <div className="w-full max-w-md py-20 space-y-12">
          
          <div className="text-center lg:text-left">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                Étape {step} sur 2
             </div>
             <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">
               {step === 1 ? 'Rejoindre l\'élite' : 'Choisir votre offre'}
             </h1>
             <p className="text-gray-400 font-medium">
               {step === 1 
                 ? 'Créez votre compte en quelques secondes et commencez à organiser des événements d\'exception.' 
                 : 'Sélectionnez le plan qui correspond à vos ambitions événementielles.'}
             </p>
          </div>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-left-8 duration-700 space-y-8">
              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-xs font-bold text-red-500 flex items-center gap-3">
                   <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-black">!</div>
                   {error}
                </div>
              )}
              
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Nom Complet</label>
                  <div className="relative group">
                    <FiUser className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Ex: Jean Dupont"
                      onChange={handleChange}
                      value={fields.name}
                      required
                      className="w-full h-14 bg-gray-50 border border-gray-100 rounded-[20px] pl-14 pr-6 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-primary transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Adresse Email</label>
                  <div className="relative group">
                    <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      name="email"
                      placeholder="jean@exemple.com"
                      onChange={handleChange}
                      value={fields.email}
                      required
                      className="w-full h-14 bg-gray-50 border border-gray-100 rounded-[20px] pl-14 pr-6 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-primary transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Mot de passe</label>
                  <div className="relative group">
                    <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Min. 6 caractères"
                      onChange={handleChange}
                      value={fields.password}
                      required
                      className="w-full h-14 bg-gray-50 border border-gray-100 rounded-[20px] pl-14 pr-6 text-sm font-bold text-gray-900 outline-none focus:bg-white focus:border-primary transition-all shadow-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full h-16 rounded-[24px] mt-4"
                >
                  Démarrer l'aventure <FiArrowLeft className="rotate-180" />
                </Button>
              </form>

              <div className="pt-8 text-center border-t border-gray-50">
                <p className="text-sm font-medium text-gray-400">
                  Déjà membre ?{' '}
                  <AppLink 
                    href="/auth/login" 
                    onClick={handleLoginNav}
                    className="font-black text-primary hover:underline uppercase text-[10px] tracking-widest ml-2"
                  >
                    Connectez-vous
                  </AppLink>
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-8 w-full max-w-lg">
              <div className="grid grid-cols-1 gap-6">
                {/* Basic Plan */}
                <div className="group relative bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm hover:border-primary hover:shadow-xl transition-all duration-500">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Gratuit</h3>
                     <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all"><FiUser /></div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">0</span>
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">FCFA / mois</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {['1 Événement', '50 Invités maximum'].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-500">
                        <FiCheck className="text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSelectPlan('free')}
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-2 border-gray-100 !bg-white hover:!bg-primary hover:!text-white"
                  >
                    Choisir ce plan
                  </Button>
                </div>

                {/* Premium Plan */}
                <div className="group relative bg-white rounded-[32px] border-4 border-primary p-8 shadow-2xl scale-105">
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/30">
                     Le plus populaire
                  </div>
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Premium</h3>
                     <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white"><FiStar className="animate-spin" style={{ animationDuration: '4s' }} /></div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">10 000</span>
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">FCFA / mois</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {['Événements illimités', 'Badges HD illimités', 'Support prioritaire 24/7'].map((f, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-900">
                        <FiCheck className="text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSelectPlan('premium')}
                    className="w-full h-14 rounded-2xl"
                  >
                    M'abonner maintenant
                  </Button>
                </div>
              </div>

              <div className="pt-10 text-center">
                <button
                  onClick={() => handleSelectPlan(null)}
                  className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors underline underline-offset-4"
                >
                  Continuer avec l'offre gratuite pour l'instant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Immersive Illustration */}
      <div className="relative hidden lg:flex w-7/12 flex-col justify-end p-20 overflow-hidden">
        <Image
          className="absolute inset-0 h-full w-full object-cover animate-float"
          src="/images/Gemini_Generated_Image_eg2gk8eg2gk8eg2g.png"
          alt="Illustration"
          fill
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />
        
        <div className="relative z-10 max-w-xl text-white space-y-8 animate-in slide-in-from-bottom-10 duration-1000">
           <div className="w-16 h-1.5 bg-white rounded-full" />
           <h2 className="text-6xl font-black leading-[1.1] tracking-tighter">
             Organisez des moments <br/> <span className="italic opacity-80 underline decoration-white/30 underline-offset-8">inoubliables.</span>
           </h2>
           <p className="text-xl font-medium opacity-90 leading-relaxed">
             Des mariages aux galas, nous automatisons la logistique pour que vous puissiez vous concentrer sur l'essentiel.
           </p>
           <div className="flex gap-8 pt-4">
              <div className="flex flex-col">
                 <span className="text-3xl font-black">500+</span>
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Événements réussis</span>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="flex flex-col">
                 <span className="text-3xl font-black">2min</span>
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Temps de création</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
