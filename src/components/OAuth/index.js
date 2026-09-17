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

  return (
    <div className={cn("w-full space-y-6", className)}>
      
      {fillFiledMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-300">
          <FiAlertCircle size={18} className="flex-shrink-0" />
          <span>{fillFiledMessage}</span>
        </div>
      )}

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

