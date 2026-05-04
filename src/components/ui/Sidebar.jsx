'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiGrid, FiPlus, FiCreditCard, FiDollarSign, FiLogOut } from 'react-icons/fi'
import { signOut } from 'next-auth/react'

const links = [
  { href: '/dashboard', icon: FiGrid, label: 'Tableau de bord' },
  { href: '/dashboard/events/new', icon: FiPlus, label: 'Nouvel événement' },
  { href: '/dashboard/subscription', icon: FiCreditCard, label: 'Abonnement' },
  { href: '/dashboard/finances', icon: FiDollarSign, label: 'Finances' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-full flex-col bg-white border-r border-stroke dark:bg-dark-2 dark:border-white/10">
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-1">
          {links.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-body-color hover:bg-gray-100 dark:hover:bg-dark-3 dark:text-white/70'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : 'text-body-color dark:text-white/70'} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-stroke p-4 dark:border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
        >
          <FiLogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}

