import '../styles/globals.css';

import { Providers } from './Providers';

export const metadata = {
  title: 'InviteManager - Gestion d\'Invitations & Badges',
  description: 'Générez des invitations personnalisées et des badges pour vos événements.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
