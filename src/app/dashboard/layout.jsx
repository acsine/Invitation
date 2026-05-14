'use client';

import React, { useState, useEffect } from 'react';
import AppLink from '@/components/AppLink';
import cn from 'classnames';
import { usePathname } from 'next/navigation';
import { useStateContext } from '@/utils/context/StateContext';
import Loader from '@/components/Loader';
import Button from '@/components/ui/Button';
import { FiLogOut, FiHome, FiCalendar, FiCreditCard, FiDollarSign, FiPieChart, FiMenu, FiX, FiLayers, FiActivity, FiUsers } from 'react-icons/fi';
import { signOut, useSession } from 'next-auth/react';

const menu = [
  { title: 'Accueil', icon: FiHome, url: '/' },
  { title: 'Mes Événements', icon: FiCalendar, url: '/dashboard/events' },
  { title: 'Équipe', icon: FiUsers, url: '/dashboard/staff' },
  { title: 'Abonnement', icon: FiLayers, url: '/dashboard/subscription' },
  { title: 'Finances', icon: FiDollarSign, url: '/dashboard/finances' },
  { title: 'Logs d\'activité', icon: FiActivity, url: '/dashboard/logs' },
];

export default function DashboardLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { sidebarVisible, setSidebarVisible } = useStateContext();
  const [navigatingTo, setNavigatingTo] = useState(null);

  const handleNavClick = (url) => {
    if (pathname !== url) {
      setNavigatingTo(url);
    }
    if (window.innerWidth < 1024) {
      setSidebarVisible(false);
    }
  };

  useEffect(() => {
    setNavigatingTo(null);
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-80 bg-white border-r border-gray-100 transition-all duration-500 lg:static lg:translate-x-0 shadow-2xl lg:shadow-none",
          { "translate-x-0": sidebarVisible, "-translate-x-full": !sidebarVisible }
        )}
      >
        <div className="flex h-full flex-col p-8">
          {/* Logo Section */}
          <div className="flex items-center gap-4 mb-16 px-4">
             <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">I</div>
             <span className="text-xl font-black tracking-tighter uppercase text-gray-900">InviteManager</span>
          </div>

          <nav className="flex-1 space-y-2">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-6 px-4">Menu Principal</p>
            {menu.map((x, index) => {
              const isActive = pathname === x.url || (x.url !== '/' && pathname.startsWith(x.url));
              const isLoading = navigatingTo === x.url;
              const Icon = x.icon;

              return (
                <AppLink
                  key={index}
                  href={x.url}
                  onClick={() => handleNavClick(x.url)}
                  className={cn(
                    "group relative flex items-center gap-4 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest transition-all duration-300",
                    isActive
                      ? "bg-primary text-white shadow-xl shadow-primary/20"
                      : "text-gray-400 hover:bg-gray-50 hover:text-primary"
                  )}
                >
                  <div className="flex items-center justify-center">
                    {isLoading ? (
                      <Loader className="!h-4 !w-4 !border-[2px]" color={isActive ? "white" : "primary"} />
                    ) : (
                      <Icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110", { "text-white": isActive })} />
                    )}
                  </div>
                  <span>{x.title}</span>
                  {isActive && (
                    <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </AppLink>
              );
            })}
          </nav>

          <div className="pt-8 space-y-4 border-t border-gray-50">
            {session?.user?.role === 'ADMIN' && (
              <AppLink
                href="/admin"
                className="flex items-center gap-4 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 transition-all border border-primary/10"
              >
                <FiPieChart size={20} />
                <span>Administration</span>
              </AppLink>
            )}

            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              variant="ghost"
              className="flex w-full items-center gap-4 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest !text-red-400 hover:!bg-red-50 hover:!text-red-600 transition-all duration-300 h-auto"
            >
              <FiLogOut size={20} />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="lg:hidden h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 relative z-30">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black">I</div>
              <span className="text-sm font-black tracking-tighter uppercase">InviteManager</span>
           </div>
           <Button 
             onClick={() => setSidebarVisible(!sidebarVisible)}
             variant="ghost"
             className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-900 shadow-sm p-0"
           >
              {sidebarVisible ? <FiX size={20} /> : <FiMenu size={20} />}
           </Button>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white">
          <div className="min-h-full p-8 md:p-12 animate-in fade-in duration-700">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
}
