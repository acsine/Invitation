'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiGrid } from 'react-icons/fi'
import styles from './Header.module.scss'

export default function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={`container ${styles.container}`}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎫</span>
          <span className={styles.logoText}>InviteManager</span>
        </Link>

        <nav className={`${styles.nav} ${menuOpen ? styles.open : ''}`}>
          <Link href="/#features" className={styles.navLink}>Fonctionnalités</Link>
          <Link href="/#pricing" className={styles.navLink}>Tarifs</Link>
          {session && (
            <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
          )}
        </nav>

        <div className={styles.actions}>
          {session ? (
            <div className={styles.userMenu}>
              <button
                className={styles.userBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className={styles.avatar}>
                  {session.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className={styles.userName}>{session.user.name}</span>
              </button>
              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <Link href="/dashboard" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                    <FiGrid size={16} /> Dashboard
                  </Link>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                      <FiSettings size={16} /> Administration
                    </Link>
                  )}
                  <Link href="/dashboard/subscription" className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                    <FiUser size={16} /> Mon abonnement
                  </Link>
                  <div className={styles.dropdownDivider} />
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownDanger}`}
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <FiLogOut size={16} /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="button button-secondary button-small">
                Connexion
              </Link>
              <Link href="/auth/register" className="button button-primary button-small">
                Commencer
              </Link>
            </>
          )}
          <button
            className={styles.burger}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
    </header>
  )
}
