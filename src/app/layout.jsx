import '../styles/globals.css';
import { Providers } from './Providers';

export const metadata = {
  title: 'InviteManager - Gestion d\'Invitations & Badges',
  description: 'Générez des invitations personnalisées et des badges pour vos événements.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-[#F4F6FB] text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
