'use client';

import { StateContext } from '../utils/context/StateContext';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';

import Header from '../components/Header';
import Footer from '../components/Footer';

export function Providers({ children }) {
  const pathname = usePathname();
  const hideLayout = pathname?.startsWith('/auth') || pathname?.startsWith('/dashboard');

  return (
    <SessionProvider>
      <StateContext>
        <div className="flex flex-col min-h-screen">
          {!hideLayout && <Header />}
          <main className={hideLayout ? "flex-grow" : "flex-grow pt-16"}>
            {children}
          </main>
          {!hideLayout && <Footer />}
        </div>


        <Toaster />
      </StateContext>
    </SessionProvider>
  );
}

