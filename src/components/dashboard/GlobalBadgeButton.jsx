'use client';

import React, { useState } from 'react';
import AppLink from '@/components/AppLink';
import { FiFileText } from 'react-icons/fi';

export default function GlobalBadgeButton() {
  const [loading, setLoading] = useState(false);

  return (
    <AppLink 
      className="inline-flex items-center justify-center rounded-2xl bg-white border border-gray-100 py-4 px-8 text-center text-sm font-black text-gray-900 uppercase tracking-widest shadow-sm hover:border-primary hover:text-primary transition-all gap-2 disabled:opacity-70" 
      href="/dashboard/badges/excel"
      onClick={() => setLoading(true)}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <FiFileText size={20} />
      )}
      <span>{loading ? 'Chargement...' : 'Outil Badge Excel'}</span>
    </AppLink>
  );
}
