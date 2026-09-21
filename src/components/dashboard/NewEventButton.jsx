'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus } from 'react-icons/fi';
import cn from 'classnames';

export default function NewEventButton({ 
  className = "inline-flex items-center justify-center rounded-2xl bg-[#FF6500] hover:bg-[#e05900] py-4 px-8 text-center text-sm font-black text-white uppercase tracking-widest shadow-xl shadow-[#FF6500]/20 hover:scale-105 active:scale-95 transition-all gap-2 cursor-pointer", 
  children, 
  href = '/dashboard/events/new' 
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    router.push(href);
  };

  return (
    <button 
      onClick={handleClick}
      disabled={loading}
      className={cn(className, "disabled:opacity-80 disabled:cursor-wait cursor-pointer")}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : null}
      <span>{loading ? 'Chargement...' : (children || 'Nouvel événement')}</span>
    </button>
  );
}
