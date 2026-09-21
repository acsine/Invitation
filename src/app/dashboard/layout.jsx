'use client';

import React, { useState, useEffect } from 'react';
import AppLink from '@/components/AppLink';
import cn from 'classnames';
import { usePathname } from 'next/navigation';
import { useStateContext } from '@/utils/context/StateContext';
import Loader from '@/components/Loader';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { 
  FiLogOut, FiHome, FiCalendar, FiCreditCard, FiDollarSign, 
  FiPieChart, FiMenu, FiX, FiLayers, FiActivity, FiUsers, 
  FiCamera, FiSearch, FiBell, FiChevronDown, FiSettings, FiGrid, FiHelpCircle 
} from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import { signOut, useSession } from 'next-auth/react';

const menuGroups = [
  {
    group: 'Principal',
    items: [
      { title: 'Dashboard', icon: FiGrid, url: '/dashboard' },
    ]
  },
  {
    group: 'Événements & Pass',
    items: [
      { title: 'Mes Événements', icon: FiCalendar, url: '/dashboard/events' },
      { title: 'Badges & QR', icon: BsQrCode, url: '/dashboard/badges' },
      { title: 'Équipe & Hôtes', icon: FiUsers, url: '/dashboard/staff' },
      { title: 'Scanner Mobile', icon: FiCamera, url: '/scan' },
    ]
  },
  {
    group: 'Finances',
    items: [
      { title: 'Finances', icon: FiDollarSign, url: '/dashboard/finances' },
      { title: 'Abonnement', icon: FiLayers, url: '/dashboard/subscription' },
    ]
  },
  {
    group: 'Système',
    items: [
      { title: 'Logs d\'activité', icon: FiActivity, url: '/dashboard/logs' },
    ]
  }
];

export default function DashboardLayout({ children }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { sidebarVisible, setSidebarVisible } = useStateContext();
  const [navigatingTo, setNavigatingTo] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Auto-detect screen size on mount & resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const userName = session?.user?.name || 'Arka Maulana';
  const userRole = session?.user?.role === 'ADMIN' ? 'Super Admin' : 'Project Manager';
  const userAvatar = session?.user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6FB] relative">
      
      {/* Mobile Dark Backdrop Overlay */}
      {sidebarVisible && (
        <div 
          onClick={() => setSidebarVisible(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* ThaborSolution Dark Navy Sidebar (#0B1736) - Fully Retractable */}
      <aside 
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 bg-[#0B1736] text-slate-300 transition-all duration-300 lg:static flex flex-col justify-between shadow-2xl lg:shadow-none border-r border-slate-800/60 select-none",
          sidebarVisible 
            ? "w-72 translate-x-0 lg:w-72" 
            : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        <div className="flex flex-col h-full overflow-y-auto custom-scrollbar p-4 lg:p-6">
          
          {/* Brand Logo Header */}
          <div className={cn("flex items-center mb-8 pt-2 transition-all duration-300", sidebarVisible ? "justify-between px-3" : "justify-center")}>
             <AppLink href="/" className="flex items-center gap-3 group cursor-pointer">
               {sidebarVisible ? (
                 <div className="flex flex-col">
                   <div className="flex items-center gap-1.5">
                     <span className="text-xl font-black tracking-tight text-white">
                       Invite<span className="text-[#FF6500]">Manager</span>
                     </span>
                     <span className="w-1.5 h-1.5 rounded-full bg-[#FF6500]" />
                   </div>
                   <span className="text-[10px] font-extrabold text-slate-400 tracking-[0.22em] uppercase mt-0.5">
                     Gestion & Badges HD
                   </span>
                 </div>
               ) : (
                 <span className="text-lg font-black tracking-tighter text-white bg-white/10 hover:bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10">
                   I<span className="text-[#FF6500]">M</span>
                 </span>
               )}
             </AppLink>

             {/* Mobile Close Button (X) */}
             {sidebarVisible && (
               <button
                 type="button"
                 onClick={() => setSidebarVisible(false)}
                 className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                 aria-label="Fermer le menu"
               >
                 <FiX size={20} />
               </button>
             )}
          </div>

          {/* Grouped Navigation */}
          <nav className="flex-1 space-y-6">
            {menuGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                {sidebarVisible && (
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-3 mb-2">
                    {group.group}
                  </p>
                )}
                {group.items.map((x, index) => {
                  const isActive = x.url === '/dashboard' 
                    ? pathname === '/dashboard' 
                    : (pathname === x.url || pathname.startsWith(x.url + '/'));
                  const isLoading = navigatingTo === x.url;
                  const Icon = x.icon;

                  return (
                    <AppLink
                      key={index}
                      href={x.url}
                      onClick={() => handleNavClick(x.url)}
                      title={!sidebarVisible ? x.title : undefined}
                      className={cn(
                        "group relative flex items-center gap-3.5 rounded-2xl py-3.5 text-xs font-bold transition-all duration-300 cursor-pointer",
                        sidebarVisible ? "px-4" : "px-0 justify-center",
                        isActive
                          ? "bg-[#3B52E8] text-white shadow-lg shadow-blue-600/30 font-extrabold"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className="flex items-center justify-center flex-shrink-0">
                        {isLoading ? (
                          <Loader className="!h-4 !w-4 !border-[2px]" color={isActive ? "white" : "primary"} />
                        ) : (
                          <Icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110", { "text-white": isActive, "text-slate-400": !isActive })} />
                        )}
                      </div>

                      {sidebarVisible && (
                        <>
                          <span className="tracking-wide whitespace-nowrap">{x.title}</span>
                          {isActive && (
                            <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />
                          )}
                        </>
                      )}
                    </AppLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer Controls */}
          <div className="pt-4 mt-6 border-t border-slate-800/80 space-y-2">
            {session?.user?.role === 'ADMIN' && (
              <AppLink
                href="/admin"
                title={!sidebarVisible ? "Administration" : undefined}
                className={cn(
                  "flex items-center gap-3.5 rounded-2xl py-3 text-xs font-bold text-blue-400 hover:bg-blue-500/10 transition-all border border-blue-500/20",
                  sidebarVisible ? "px-4" : "px-0 justify-center"
                )}
              >
                <FiPieChart size={18} />
                {sidebarVisible && <span>Administration</span>}
              </AppLink>
            )}

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              title={!sidebarVisible ? "Déconnexion" : undefined}
              className={cn(
                "flex w-full items-center gap-3.5 rounded-2xl py-3 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-all duration-300 cursor-pointer",
                sidebarVisible ? "px-4" : "px-0 justify-center"
              )}
            >
              <FiLogOut size={18} />
              {sidebarVisible && <span>Déconnexion</span>}
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main Right Section */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header Bar */}
        <header className="h-20 bg-white border-b border-slate-200/70 flex items-center justify-between px-4 sm:px-8 lg:px-10 z-30 shrink-0">
           
           {/* Sidebar Toggle Button + Page Title */}
           <div className="flex items-center gap-3 sm:gap-4">
              <button 
                type="button"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                title={sidebarVisible ? "Rétracter le menu" : "Afficher le menu"}
              >
                 {sidebarVisible ? <FiX size={20} className="lg:hidden" /> : null}
                 <FiMenu size={20} className={cn({ "hidden lg:block": sidebarVisible })} />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
              </div>
           </div>

           {/* Search Bar (Centered Pill) */}
           <div className="hidden md:flex items-center w-72 lg:w-96 relative">
              <FiSearch className="absolute left-4 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher un événement, un invité..." 
                className="w-full bg-[#F4F6FB] border border-slate-200/80 rounded-full py-2.5 pl-11 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#3B52E8] focus:ring-4 focus:ring-[#3B52E8]/10 transition-all"
              />
           </div>

           {/* Right Actions: Notifications & User Profile */}
           <div className="flex items-center gap-3 sm:gap-4">
              
              {/* Notification Bell */}
              <button className="relative w-10 h-10 rounded-full bg-[#F4F6FB] border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                 <FiBell size={18} />
                 <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#FF6500] ring-2 ring-white" />
              </button>

              {/* User Profile Pill */}
              <div className="relative">
                <button 
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:pr-3 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                   <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 shadow-sm flex-shrink-0">
                      <img 
                        src={userAvatar} 
                        alt={userName} 
                        className="w-full h-full object-cover"
                      />
                   </div>
                   <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-black text-slate-900 leading-tight">{userName}</span>
                      <span className="text-[10px] font-bold text-slate-400 leading-tight">{userRole}</span>
                   </div>
                   <FiChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-slate-100">
                       <p className="text-xs font-black text-slate-900">{userName}</p>
                       <p className="text-[10px] font-semibold text-slate-500 truncate">{session?.user?.email || 'user@example.com'}</p>
                    </div>
                    <div className="py-1">
                       <AppLink href="/dashboard/subscription" className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl">
                          <FiLayers size={14} /> <span>Mon Abonnement</span>
                       </AppLink>
                       <AppLink href="/dashboard/logs" className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl">
                          <FiActivity size={14} /> <span>Journal d'activité</span>
                       </AppLink>
                    </div>
                    <div className="pt-1 border-t border-slate-100">
                       <button 
                         onClick={() => signOut({ callbackUrl: '/' })}
                         className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                       >
                          <FiLogOut size={14} /> <span>Déconnexion</span>
                       </button>
                    </div>
                  </div>
                )}
              </div>

           </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F4F6FB] p-4 sm:p-6 md:p-8">
           <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
              {children}
           </div>
        </div>
      </main>
    </div>
  );
}
