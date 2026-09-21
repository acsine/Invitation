'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import cn from 'classnames';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '../ui/Button';
import registerFields from '../../utils/constants/registerFields';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle, FiHome } from 'react-icons/fi';

const OAuth = ({ className, handleClose, disable }) => {
  const { push } = useRouter();

  const [{ email, password }, setFields] = useState(() => registerFields);
  const [fillFiledMessage, setFillFiledMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputElement = useRef(null);

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus();
    }
  }, [disable]);

  const handleGoHome = () => {
    setReturnLoading(true);
    push('/');
  };

  const handleChange = ({ target: { name, value } }) =>
    setFields(prevFields => ({
      ...prevFields,
      [name]: value,
    }));

  const submitForm = useCallback(
    async e => {
      e.preventDefault();
      fillFiledMessage?.length && setFillFiledMessage('');
      setLoading(true);
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setFillFiledMessage('Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.');
      } else {
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        
        handleClose && handleClose();
        
        if (session?.user?.role === 'STAFF') {
          push('/scan');
        } else {
          push('/dashboard');
        }
      }
      
      setLoading(false);
    },
    [
      fillFiledMessage?.length,
      email,
      password,
      handleClose,
      push
    ]
  );

  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      
      {fillFiledMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-300">
          <FiAlertCircle size={18} className="flex-shrink-0" />
          <span>{fillFiledMessage}</span>
        </div>
      )}

      {/* Prominent Google Authentication Button */}
      <button
        type="button"
        disabled={googleLoading || loading}
        onClick={handleGoogleSignIn}
        className="w-full relative py-4 px-6 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] group disabled:opacity-70"
      >
        {googleLoading ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Connexion Google en cours...</span>
          </div>
        ) : (
          <>
            <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Se connecter avec Google</span>
          </>
        )}
      </button>

      {/* Or Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-4 text-xs font-extrabold uppercase text-slate-400 absolute">ou par e-mail</span>
      </div>

      <form onSubmit={submitForm} className="space-y-5">
        
        {/* Email Field */}
        <div className="space-y-2 text-left">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
            Adresse E-mail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <FiMail size={18} />
            </div>
            <input
              ref={inputElement}
              type="email"
              name="email"
              placeholder="ex: organisateur@evenement.com"
              className="w-full rounded-2xl border border-slate-200 bg-[#F4F6FB] py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-[#3B52E8] focus:ring-4 focus:ring-[#3B52E8]/10"
              onChange={handleChange}
              value={email}
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Mot de passe
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <FiLock size={18} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-[#F4F6FB] py-3.5 pl-11 pr-11 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-[#3B52E8] focus:ring-4 focus:ring-[#3B52E8]/10"
              onChange={handleChange}
              value={password}
              required
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

        {/* Actions */}
        <div className="pt-2 space-y-3">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-[#FF6500] hover:bg-[#e05900] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/25 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-70"
          >
            {loading ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                <span>Se connecter</span>
                <FiArrowRight size={18} />
              </>
            )}
          </button>

          {disable && (
            <button
              type="button"
              onClick={handleGoHome}
              disabled={returnLoading}
              className="w-full py-3.5 px-6 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FiHome size={16} />
              <span>Retour à l'accueil</span>
            </button>
          )}
        </div>

      </form>
    </div>
  );
};

export default OAuth;

