'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSettings } from 'react-icons/fi';
import cn from 'classnames';

export default function ManageEventButton({ href, className }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    setLoading(true);
    router.push(href);
  };

  return (
    <button 
      onClick={handleClick}
      disabled={loading}
      className={cn(className, "disabled:opacity-70 disabled:cursor-not-allowed")}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <FiSettings size={14} />
      )}
      <span>{loading ? 'Chargement...' : 'Gérer'}</span>
    </button>
  );
}
