'use client';

import React, { useState, useEffect } from 'react';
import AppLink from '@/components/AppLink';
import Icon from '@/components/Icon';
import cn from 'classnames';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FiUsers, FiBox, FiDollarSign, FiLogOut, FiHome, FiPieChart } from 'react-icons/fi';
import Loader from '@/components/Loader';

const adminMenu = [
  { title: 'Vue d\'ensemble', icon: FiPieChart, url: '/admin' },
  { title: 'Utilisateurs', icon: FiUsers, url: '/admin/users' },
  { title: 'Forfaits & Plans', icon: FiBox, url: '/admin/plans' },
  { title: 'Demandes de Retrait', icon: FiDollarSign, url: '/admin/withdrawals' },
  { title: 'Retour Dashboard', icon: FiHome, url: '/dashboard/events' },
];

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [navigatingTo, setNavigatingTo] = useState(null);

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  if (status === 'loading') return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader /></div>;

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="text-4xl font-black text-red-600 mb-4 tracking-tighter">ACCÈS REFUSÉ</h1>
        <p className="text-gray-500 mb-8 font-medium">Vous devez être administrateur pour accéder à cette zone.</p>
        <AppLink href="/dashboard/events" className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition hover:scale-105">
          Retour au Dashboard
        </AppLink>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 text-gray-900 fixed inset-0 z-[9999]">
      {/* Admin Sidebar - Fixed Height, No internal scroll */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full z-[10000] shadow-sm">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">A</div>
             <div>
               <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest">Admin Panel</h1>
               <p className="text-[10px] text-primary font-black uppercase tracking-tighter">Invite Manager</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 p-6 flex flex-col gap-2 overflow-hidden">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Navigation</div>
          {adminMenu.map((item, i) => {
            const isActive = pathname === item.url;
            const isLoading = navigatingTo === item.url;
            return (
              <AppLink 
                key={i} 
                href={item.url} 
                onClick={() => setNavigatingTo(item.url)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200",
                  isActive 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "text-gray-500 hover:text-primary hover:bg-primary/5"
                )}
              >
                {isLoading ? <Loader className="!h-4 !w-4" /> : <item.icon size={20} />}
                <span>{item.title}</span>
              </AppLink>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-3 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
          >
            <FiLogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Only this scrolls */}
      <main className="flex-1 overflow-y-auto h-full p-12 relative bg-gray-50">
        <div className="max-w-6xl mx-auto pb-20">
          {children}
        </div>
      </main>
    </div>
  );
}
