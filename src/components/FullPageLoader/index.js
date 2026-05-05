'use client';

import React from 'react';
import Loader from '../Loader';

const FullPageLoader = ({ message = 'Chargement en cours...' }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/20 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full animate-pulse" />
        <Loader className="!h-16 !w-16 !border-[4px] relative z-10" color="primary" />
      </div>
      <p className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-gray-900 animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default FullPageLoader;
