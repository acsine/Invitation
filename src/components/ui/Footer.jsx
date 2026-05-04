import Link from 'next/link'
import styles from './Footer.module.scss'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.container}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>🎫 InviteManager</span>
          <p className={styles.tagline}>
            Créez, partagez et gérez vos invitations événementielles en quelques clics.
          </p>
        </div>
        <div className={styles.links}>
          <div className={styles.group}>
            <h4 className={styles.groupTitle}>Produit</h4>
            <Link href="/#features">Fonctionnalités</Link>
            <Link href="/#pricing">Tarifs</Link>
            <Link href="/auth/register">Commencer</Link>
          </div>
          <div className={styles.group}>
            <h4 className={styles.groupTitle}>Légal</h4>
            <Link href="/privacy">Confidentialité</Link>
            <Link href="/terms">Conditions</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} InviteManager. Tous droits réservés.</p>
      </div>
    </footer>
  )
}
