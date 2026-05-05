'use client';

import React, { useState } from 'react'
import cn from 'classnames'
import AppLink from '../AppLink'
import Icon from '../Icon'
import Image from 'next/image'
import Loader from '../Loader'
import User from './User'
import Theme from '../Theme'
import Modal from '../Modal'
import OAuth from '../OAuth'
import { useSession } from 'next-auth/react'
import { useStateContext } from '../../utils/context/StateContext'
import { HiMenuAlt2 } from 'react-icons/hi'
import Button from '../ui/Button'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

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
    // Small delay to show spinner
    await new Promise(r => setTimeout(r, 500));
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
      <header className="fixed top-0 left-0 z-50 w-full bg-white/90 backdrop-blur-md dark:bg-dark/90 shadow-sm border-b border-stroke transition-all duration-300">
        <div className="container mx-auto">
          <div className="relative flex items-center justify-between -mx-4 h-16">
            <div className="flex items-center gap-4 px-4">
              <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="hidden lg:flex items-center justify-center h-10 w-10 rounded-lg text-body-color hover:bg-gray-100 dark:hover:bg-dark-3 transition"
              >
                <HiMenuAlt2 size={24} />
              </button>
              <div className="max-w-full w-32">
                <AppLink href="/" className="block w-full py-1">
                  <Image
                    width={120}
                    height={40}
                    style={{ objectFit: 'contain' }}
                    src="/images/logo.png"


                    alt="InviteManager"
                    priority
                  />
                </AppLink>
              </div>

            </div>
            <div className="flex items-center justify-end w-full px-4 gap-4">
              <nav
                className={cn(
                  "absolute right-4 top-full w-full max-w-[250px] rounded-lg bg-white py-5 px-6 shadow transition-all lg:static lg:block lg:w-full lg:max-w-full lg:bg-transparent lg:shadow-none dark:bg-dark-2 lg:dark:bg-transparent",
                  { "hidden": !visibleNav }
                )}
              >
                <ul className="block lg:flex lg:justify-center">
                  {navigation.menu?.map((x, index) => (
                    <li key={index}>
                      <AppLink
                        href={x?.url || `/search`}
                        onClick={() => handleNavClick(x.url)}
                        className="flex items-center gap-2 py-2 text-base font-medium text-dark hover:text-primary dark:text-white lg:ml-12 lg:inline-flex"
                      >
                        {x.title}
                        {navLoading === x.url && <Loader className="!h-3 !w-3" />}
                      </AppLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="flex items-center gap-4">
                <Theme className="theme-big" />
                {user ? (
                  <User user={user} />
                ) : (
                  <Button
                    onClick={handleLoginClick}
                    loading={navLoading === 'auth'}
                    className="h-10 px-6 text-sm rounded-md"
                  >
                    Connexion
                  </Button>
                )}
                <button
                  onClick={() => setVisibleNav(!visibleNav)}
                  className={cn(
                    "relative block rounded-lg px-2 py-[6px] ring-primary focus:ring-2 lg:hidden",
                    { "navbarTogglerActive": visibleNav }
                  )}
                >
                  <span className="relative my-[5px] block h-[2px] w-[25px] bg-body-color dark:bg-white"></span>
                  <span className="relative my-[5px] block h-[2px] w-[25px] bg-body-color dark:bg-white"></span>
                  <span className="relative my-[5px] block h-[2px] w-[25px] bg-body-color dark:bg-white"></span>
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


