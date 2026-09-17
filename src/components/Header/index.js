'use client';

import React, { useState, useEffect } from 'react'
import cn from 'classnames'
import AppLink from '../AppLink'
import Loader from '../Loader'
import User from './User'
import Theme from '../Theme'
import Modal from '../Modal'
import OAuth from '../OAuth'
import { useSession } from 'next-auth/react'
import { useStateContext } from '../../utils/context/StateContext'
import { HiMenuAlt2 } from 'react-icons/hi'
import { FiArrowRight } from 'react-icons/fi'
import Button from '../ui/Button'
import { useRouter, usePathname } from 'next/navigation'

const Headers = ({ navigation: propNavigation }) => {
  const [visibleNav, setVisibleNav] = useState(false)
  const [visibleAuthModal, setVisibleAuthModal] = useState(false)
  const { sidebarVisible, setSidebarVisible } = useStateContext()

  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const pathname = usePathname();
  const [navLoading, setNavLoading] = useState(null);

  useEffect(() => {
    setNavLoading(null);
  }, [pathname]);

  const handleNavClick = (url) => {
    if (pathname !== url) {
      setNavLoading(url);
    }
  };

  const handleLoginClick = async () => {
    setNavLoading('auth');
    await new Promise(r => setTimeout(r, 400));
    setVisibleAuthModal(true);
    setNavLoading(null);
  };

  const defaultNavigation = {
    menu: [
      { title: 'Événements', url: '/dashboard/events' },
      { title: 'Abonnement', url: '/dashboard/subscription' },
      { title: 'Finances', url: '/dashboard/finances' },
    ],
  };

  const navigation = propNavigation || defaultNavigation;

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full glass-nav transition-all duration-300">
        <div className="container mx-auto px-6 sm:px-8">
          <div className="relative flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="hidden lg:flex items-center justify-center h-10 w-10 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <HiMenuAlt2 size={22} />
              </button>
              <AppLink href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/25 group-hover:rotate-6 transition-transform">
                  I
                </div>
                <span className="text-xl font-black tracking-tight uppercase gradient-text">
                  InviteManager
                </span>
              </AppLink>
            </div>

            <div className="flex items-center gap-6">
              <nav
                className={cn(
                  "absolute right-4 top-full w-full max-w-[260px] rounded-2xl glass-card p-6 shadow-2xl transition-all lg:static lg:block lg:w-auto lg:p-0 lg:shadow-none border border-slate-200/80 dark:border-slate-800/80 lg:border-none",
                  { "hidden": !visibleNav }
                )}
              >
                <ul className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                  {navigation.menu?.map((x, index) => (
                    <li key={index}>
                      <AppLink
                        href={x?.url || `/search`}
                        onClick={() => handleNavClick(x.url)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {x.title}
                        {navLoading === x.url && <Loader className="!h-3 !w-3" color="primary" />}
                      </AppLink>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="flex items-center gap-3">
                <Theme className="theme-big" />
                {user ? (
                  <User user={user} />
                ) : (
                  <Button
                    onClick={handleLoginClick}
                    loading={navLoading === 'auth'}
                    variant="glow"
                    size="sm"
                  >
                    Connexion <FiArrowRight size={14} />
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setVisibleNav(!visibleNav)}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
                >
                  <HiMenuAlt2 size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <Modal
        visible={visibleAuthModal}
        onClose={() => setVisibleAuthModal(false)}
      >
        <OAuth
          handleClose={() => setVisibleAuthModal(false)}
        />
      </Modal>
    </>
  )
}

export default Headers
