'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { 
  FiCheck, FiZap, FiTarget, FiUsers, FiAward, FiArrowRight, 
  FiPlay, FiStar, FiShield, FiTrendingUp, FiShare2, 
  FiChevronDown, FiCheckCircle, FiClock, FiSmartphone, FiPieChart, 
  FiPlus, FiPhone, FiGrid, FiLayers, FiHelpCircle, FiCalendar, FiBookOpen, FiSun,
  FiMenu, FiX
} from 'react-icons/fi';
import { BsQrCode, BsStars, BsLightbulb, BsClock } from 'react-icons/bs';

import Button from '../components/ui/Button';
import FullPageLoader from '@/components/FullPageLoader';
import Footers from '../components/Footer';
import ScrollReveal from '../components/ScrollReveal';
import EventShowcase from '../components/EventShowcase';
import BadgeShowcase from '../components/BadgeShowcase';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [navLoading, setNavLoading] = useState(null);
  const [isNavigatingLoader, setIsNavigatingLoader] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setNavLoading(null);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleNav = (url) => {
    if (!url) return;
    setMobileMenuOpen(false);
    
    if (url.startsWith('#')) {
      const el = document.querySelector(url);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (pathname !== url) {
      const loaderMsg = url === '/auth/login' ? 'Vers la connexion...' : 'Vers l\'inscription...';
      setIsNavigatingLoader(true);
      setTimeout(() => {
        router.push(url);
      }, 400);
    }
  };

  const faqItems = [
    {
      q: "Comment les invités reçoivent-ils leur badge ou leur pass QR Code ?",
      a: "Dès l'ajout ou l'importation de vos invités, InviteManager génère un lien personnalisé unique avec leur pass et QR Code. Vous pouvez leur envoyer en 1 clic par WhatsApp, E-mail ou SMS."
    },
    {
      q: "Ai-je besoin d'un appareil spécial pour scanner les badges à l'entrée ?",
      a: "Non ! N'importe quel smartphone (Android ou iPhone) ou tablette avec caméra suffit. Connectez votre équipe à l'application web InviteManager pour effectuer le check-in en moins d'une seconde."
    },
    {
      q: "Est-il possible d'imprimer des badges physiques de haute qualité ?",
      a: "Absolument. Vous pouvez exporter vos badges au format PDF HD personnalisé (avec nom, rôle, photo, QR code et logo de l'événement) prêt pour l'impression en série ou individuelle."
    },
    {
      q: "Les statistiques de présence sont-elles mises à jour en direct ?",
      a: "Oui, le tableau de bord affiche les arrivées en temps réel. Vous connaissez à la seconde près le nombre de personnes présentes, le taux d'affluence et les invités VIP restants."
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-slate-800 font-sans overflow-x-hidden selection:bg-[#FF6500] selection:text-white">
      {isNavigatingLoader && <FullPageLoader message="Initialisation de la session..." />}

      {/* --- HEADER CLEAN LIGHT WITH FLOATING GLASS EFFECT & RESPONSIVE MOBILE MENU --- */}
      <header className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'py-3 bg-transparent' 
          : 'py-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs'
      }`}>
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-xl max-w-7xl h-16' 
            : 'h-20 max-w-7xl'
        }`}>
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer mr-4 lg:mr-8 flex-shrink-0" onClick={() => router.push('/')}>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
              Invite<span className="text-[#FF6500]">Manager</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs xl:text-sm text-slate-700">
            {[
              { href: '#hero', label: 'Accueil' },
              { href: '#about', label: 'À propos' },
              { href: '#solutions', label: 'Solutions' },
              { href: '#badges', label: 'Badges & Pass' },
              { href: '#services', label: 'Services' },
              { href: '#tarifs', label: 'Tarifs' },
            ].map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="relative font-extrabold hover:text-[#FF6500] transition-colors whitespace-nowrap py-1 px-1 group text-slate-700"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-[#FF6500] rounded-full group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button 
              onClick={() => handleNav('/auth/login')}
              className="hidden sm:inline-flex text-xs sm:text-sm font-extrabold text-slate-700 hover:text-[#3B52E8] transition-colors px-2 py-1.5 whitespace-nowrap"
            >
              Connexion
            </button>
            <button 
              onClick={() => handleNav('/auth/register')}
              className="bg-[#FF6500] hover:bg-[#e05900] text-white px-3 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-none border-none outline-none whitespace-nowrap transition-colors"
            >
              <span className="hidden xs:inline">Créer mon compte</span>
              <span className="xs:hidden">Inscription</span>
              <FiArrowRight size={16} />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col gap-3 font-bold text-sm text-slate-800">
              {[
                { href: '#hero', label: 'Accueil' },
                { href: '#about', label: 'À propos' },
                { href: '#solutions', label: 'Solutions' },
                { href: '#badges', label: 'Badges & Pass' },
                { href: '#services', label: 'Services' },
                { href: '#tarifs', label: 'Tarifs' },
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 border-b border-slate-100 hover:text-[#FF6500] transition-colors flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <span className="text-slate-300 text-xs">→</span>
                </a>
              ))}
            </nav>
            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => handleNav('/auth/login')}
                className="w-full py-3 rounded-xl bg-slate-100 text-slate-900 font-extrabold text-sm text-center"
              >
                Se connecter
              </button>
              <button
                onClick={() => handleNav('/auth/register')}
                className="w-full py-3 rounded-xl bg-[#FF6500] text-white font-extrabold text-sm text-center shadow-md"
              >
                Créer un compte gratuit
              </button>
            </div>
          </div>
        )}
      </header>


      {/* --- HERO SECTION (eduAct Style with Royal Blue Blob & Cursive Subtitle) --- */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 bg-[#F4F6FB] overflow-hidden" id="hero">
        
        {/* Floating Decorative Background Artifacts */}
        <div className="absolute -top-2 left-2 opacity-5 pointer-events-none text-[#3B52E8] animate-float-slow hidden sm:block">
          <FiBookOpen size={56} />
        </div>
        <div className="absolute bottom-10 left-1/3 opacity-10 pointer-events-none text-[#FF6500] animate-float">
          <BsClock size={44} />
        </div>
        <div className="absolute top-1/2 right-4 opacity-10 pointer-events-none text-[#3B52E8] animate-pulse">
          <BsStars size={40} />
        </div>

        <div className="container mx-auto px-6 sm:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              
              <ScrollReveal variant="up" delay={0}>
                <div className="inline-flex items-center gap-2 font-cursive text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FF6500] tracking-wide">
                  <span>Bienvenue dans l'expérience événementielle</span>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="up" delay={100}>
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
                  Le futur de vos <br className="hidden sm:inline" />
                  <span className="text-[#3B52E8] relative inline-block">
                    événements
                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#FF6500]/30" viewBox="0 0 100 20" preserveAspectRatio="none">
                      <path d="M0,15 Q50,0 100,15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span> commence ici
                </h1>
              </ScrollReveal>

              <ScrollReveal variant="up" delay={200}>
                <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
                  Mariages, conférences, anniversaires ou galas : créez vos cartons d'invitation digitaux, générez des badges HD et gérez vos invités en temps réel sans effort.
                </p>
              </ScrollReveal>

              <ScrollReveal variant="up" delay={300}>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button 
                    onClick={() => handleNav('/auth/register')}
                    className="btn-edu-orange px-8 py-4 rounded-xl font-black text-base flex items-center gap-3 shadow-lg hover:shadow-orange-500/25 transition-all group cursor-pointer"
                  >
                    <span>Démarrer Gratuitement</span>
                    <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button 
                    onClick={() => handleNav('#badges')}
                    className="btn-edu-blue px-7 py-4 rounded-xl font-bold text-base flex items-center gap-2.5 shadow-md hover:shadow-indigo-500/30 transition-all cursor-pointer"
                  >
                    <BsQrCode size={19} />
                    <span>Tester le Simulateur</span>
                  </button>
                </div>
              </ScrollReveal>

              {/* Social Proof & Trust Badges */}
              <ScrollReveal variant="up" delay={400}>
                <div className="pt-4 border-t border-slate-200/60 flex flex-wrap items-center gap-6">
                  {/* Micro Avatars */}
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2.5 overflow-hidden">
                      <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-[#3B52E8] text-white flex items-center justify-center font-extrabold text-xs">M</div>
                      <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-[#FF6500] text-white flex items-center justify-center font-extrabold text-xs">A</div>
                      <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-emerald-500 text-white flex items-center justify-center font-extrabold text-xs">K</div>
                      <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xs">+10k</div>
                    </div>
                    <div>
                      <div className="flex items-center text-amber-500 text-xs gap-0.5 font-bold">
                        ★ ★ ★ ★ ★ <span className="text-slate-700 ml-1">4.9/5</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">+500 Événements Réussis</div>
                    </div>
                  </div>

                  {/* Pagination Dots Indicator */}
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-3.5 h-3.5 rounded-full bg-[#FF6500] ring-4 ring-[#FF6500]/20" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  </div>
                </div>
              </ScrollReveal>

            </div>

            {/* Right Visual Image Column with Royal Blue Organic Blob Backdrop & 3D Cutout */}
            <div className="lg:col-span-6 flex justify-center items-end relative min-h-[520px]">
              
              {/* Organic Royal Blue Blob Backdrop - Bottom Aligned with Image */}
              <div className="absolute w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] bg-gradient-to-tr from-[#3B52E8] to-[#4F6BFF] blob-shape-1 right-2 sm:right-6 bottom-0 z-0 opacity-95 shadow-2xl shadow-blue-500/20" />

              {/* Floating Lightbulb Circle Accent */}
              <div className="absolute top-4 right-2 sm:right-6 w-16 h-16 rounded-full bg-[#FF6500] flex items-center justify-center text-white shadow-xl shadow-orange-500/30 z-20 animate-float">
                <BsLightbulb size={28} />
              </div>

              {/* Floating Glassmorphism Micro-Card 1: Top-Left */}
              <div className="absolute top-12 -left-2 sm:left-2 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white/80 flex items-center gap-3 animate-float-slow">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                  <FiCheckCircle size={20} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Check-in Instantané</div>
                  <div className="text-[11px] text-slate-500 font-medium">QR Pass scanné &lt; 0.5s</div>
                </div>
              </div>

              {/* Floating Glassmorphism Micro-Card 2: Bottom-Right */}
              <div className="absolute bottom-10 right-0 sm:right-4 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white/80 flex items-center gap-3 animate-float">
                <div className="w-9 h-9 rounded-xl bg-[#3B52E8]/10 text-[#3B52E8] flex items-center justify-center font-black">
                  <BsQrCode size={20} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Badges HD & Pass</div>
                  <div className="text-[11px] text-slate-500 font-medium">100% Anti-Fraude</div>
                </div>
              </div>

              {/* 3D Cutout Image (PNG Transparent - Bottom Aligned with Blue Blob) */}
              <div className="relative z-10 w-full max-w-md h-[480px] sm:h-[540px] flex items-end justify-center">
                <Image 
                  src="/images/uploaded/hero_green_suit.png" 
                  alt="Organisatrice d'Événements InviteManager" 
                  fill 
                  className="object-contain object-bottom filter drop-shadow-2xl"
                  priority
                />
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* --- SECTION 2: ABOUT US / NOS SOLUTIONS (eduAct Style with Orange Frame Accent) --- */}
      <section className="py-24 bg-white relative" id="about">
        <div className="container mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              
              <ScrollReveal variant="left">
                <div className="text-xs font-black text-[#FF6500] uppercase tracking-widest flex items-center gap-2">
                  <span>Nos Solutions</span>
                  <span className="text-[#FF6500]">▸▸▸▸</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mt-2">
                  Créer une communauté d'événements d'excellence
                </h2>

                <p className="text-slate-600 text-base leading-relaxed mt-4">
                  InviteManager est conçu pour éliminer le stress de l'organisation. Proposez des pass QR sécurisés, contrôlez les entrées avec un smartphone et suivez la présence minute par minute.
                </p>

                {/* Sub-Card Feature Box */}
                <div className="p-5 rounded-2xl bg-[#F4F6FB] border border-slate-200/80 flex items-start gap-4 mt-6">
                  <div className="w-12 h-12 rounded-xl bg-[#3B52E8] text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                    <FiLayers size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Pass & Émargement Flexibles</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Une solution cloud accessible sans installation complexe pour staff, hôtesses et organisateurs.
                    </p>
                  </div>
                </div>

                {/* Contact CEO / Info Badge */}
                <div className="flex flex-wrap items-center gap-6 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF6500]">
                      <Image src="/images/content/avatar.png" alt="Directeur InviteManager" fill className="object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">Jean-Marc Koffi</div>
                      <div className="text-xs font-semibold text-slate-500">Fondateur & CEO</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="w-9 h-9 rounded-full bg-[#FF6500] text-white flex items-center justify-center">
                      <FiPhone size={18} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Besoin d'assistance ?</div>
                      <div className="text-xs font-extrabold text-slate-900">+225 07 00 00 00 00</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => handleNav('/auth/register')}
                    className="btn-edu-blue px-7 py-3.5 rounded-xl font-extrabold text-sm"
                  >
                    Découvrir Nos Offres →
                  </button>
                </div>
              </ScrollReveal>

            </div>

            {/* Right Image with Organic Orange Frame Accent */}
            <div className="lg:col-span-6 relative flex justify-center py-6">
              <ScrollReveal variant="right" className="w-full max-w-md">
                <div className="relative w-full">
                  
                  {/* Organic Orange Accent Box Offset Behind */}
                  <div className="absolute -top-6 -right-6 w-36 h-36 bg-[#FF6500] rounded-3xl z-0" />
                  
                  {/* Main Image Showcase */}
                  <div className="relative z-10 w-full h-[460px] rounded-3xl overflow-hidden shadow-none border-2 border-slate-200 bg-slate-100">
                    <Image 
                      src="/images/uploaded/conference.jpg" 
                      alt="Conférence & Événement B2B" 
                      fill 
                      className="object-cover object-center"
                      priority
                    />
                  </div>

                  {/* Corner Overlay Card */}
                  <div className="absolute -bottom-4 -left-4 sm:-left-6 z-20 p-4 rounded-2xl bg-white shadow-none border border-slate-200 flex items-center gap-3.5 max-w-[270px]">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                      <FiCheck size={22} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        100% Vérifié & Sans Faille
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                        Émargement instantané le Jour J
                      </div>
                    </div>
                  </div>

                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>


      {/* --- SECTION 3: EVENT TYPES SHOWCASE ("Mariages, Conférences, Anniversaires, Galas") --- */}
      <section className="py-24 bg-[#F4F6FB]" id="solutions">
        <div className="container mx-auto px-6 sm:px-8 space-y-12">
          
          <ScrollReveal variant="up">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="text-xs font-black text-[#FF6500] uppercase tracking-widest">
                Événements De Tout Genre ▸▸▸▸
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Une solution sur-mesure pour chaque cérémonie
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={150}>
            <EventShowcase />
          </ScrollReveal>
        </div>
      </section>


      {/* --- SECTION 4: INTERACTIVE BADGE SIMULATOR --- */}
      <section className="py-24 bg-white border-y border-slate-200/80" id="badges">
        <div className="container mx-auto px-6 sm:px-8">
          <ScrollReveal variant="up">
            <BadgeShowcase />
          </ScrollReveal>
        </div>
      </section>


      {/* --- SECTION 5: NOS SERVICES (4 Crisp White Cards - eduAct Style) --- */}
      <section className="py-24 bg-[#F4F6FB]" id="services">
        <div className="container mx-auto px-6 sm:px-8 space-y-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="text-xs font-black text-[#FF6500] uppercase tracking-widest">
                Nos Services ▸▸▸▸
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Tout ce dont vous avez besoin pour vos événements
              </h2>
            </div>
            <p className="text-slate-600 text-sm max-w-md">
              De l'envoi de l'invitation à la clôture de la cérémonie, gérez tout en quelques clics.
            </p>
          </div>

          {/* 4 White Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Badges & Pass HD", desc: "Création et impression de badges nominatifs haute définition avec QR code unique.", icon: FiAward },
              { title: "Contrôle d'Accès QR", desc: "Scanner ultra-rapide sur smartphone pour valider les entrées à la porte.", icon: BsQrCode },
              { title: "Partage Multi-Canal", desc: "Diffusion directe sur WhatsApp, SMS et E-mail avec relances automatiques.", icon: FiShare2 },
              { title: "Analytics en Direct", desc: "Statistiques d'affluence et présence en temps réel téléchargeables en PDF/Excel.", icon: FiPieChart }
            ].map((srv, idx) => (
              <ScrollReveal key={idx} variant="up" delay={idx * 100}>
                <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between h-full group">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#FF6500] flex items-center justify-center font-bold text-2xl group-hover:bg-[#FF6500] group-hover:text-white transition-colors duration-300">
                      <srv.icon size={26} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{srv.title}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">{srv.desc}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-100 flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-[#3B52E8] group-hover:text-white transition-colors">
                      <FiPlus size={16} />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>
      </section>


      {/* --- SECTION 6: VIDEO TOUR / CTA BANNER (eduAct Dark Navy Footer Banner Style) --- */}
      <section className="py-20 bg-[#1E1B4B] text-white relative overflow-hidden">
        
        {/* Decorative Circle Graphic in Banner */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 border-[40px] border-white/5 rounded-full pointer-events-none" />

        <div className="container mx-auto px-6 sm:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-2xl">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Découvrez la plateforme en vidéo démo
            </h2>
            <p className="text-indigo-200 text-base">
              Voyez comment créer un événement et scanner 100 invitations en moins de 3 minutes.
            </p>
          </div>

          <div className="flex-shrink-0">
            <button 
              onClick={() => handleNav('/auth/register')}
              className="btn-edu-orange px-9 py-4 rounded-xl font-black text-base flex items-center gap-3 shadow-2xl"
            >
              <span>Regarder la Démo →</span>
            </button>
          </div>
        </div>
      </section>


      {/* --- SECTION 7: PRICING PLANS --- */}
      <section className="py-24 bg-white" id="tarifs">
        <div className="container mx-auto px-6 sm:px-8 space-y-16">
          <ScrollReveal variant="up">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="text-xs font-black text-[#FF6500] uppercase tracking-widest">
                Tarification Transparente ▸▸▸▸
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Des offres adaptées à chaque événement
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Découverte",
                price: "Gratuit",
                desc: "Parfait pour les petits événements privés.",
                feats: ["Jusqu'à 50 Invités", "Pass QR Code Standard", "1 Scanner Mobile", "Support Communautaire"],
                btn: "Commencer Gratuit",
                highlight: false
              },
              {
                name: "Pro Événement",
                price: "29 000 FCFA",
                desc: "Idéal pour mariages, anniversaires & soirées VIP.",
                feats: ["Invités Illimités", "Badges HD Personnalisés", "Multi-Scanners Staff (jusqu'à 5)", "Statistiques en Temps Réel", "Relances SMS/WhatsApp"],
                btn: "Recommandé Pro",
                highlight: true
              },
              {
                name: "Enterprise & Galas",
                price: "Sur Mesure",
                desc: "Grands salons, festivals & conférences B2B.",
                feats: ["Accès Multi-Salles & Zones VIP", "Impression Badges sur Place", "API & Intégration sur-mesure", "Manager Dédié le Jour J"],
                btn: "Contacter l'Équipe",
                highlight: false
              }
            ].map((plan, idx) => (
              <ScrollReveal key={idx} variant="up" delay={idx * 150}>
                <div className={`rounded-3xl p-8 h-full flex flex-col justify-between transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-[#1E1B4B] text-white shadow-2xl border-2 border-[#FF6500] scale-[1.03] relative'
                    : 'bg-[#F4F6FB] text-slate-900 border border-slate-200/80'
                }`}>
                  {plan.highlight && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FF6500] text-white text-xs font-black uppercase tracking-widest shadow-md">
                      Le plus populaire
                    </span>
                  )}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                      <p className={`text-xs ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>{plan.desc}</p>
                    </div>
                    <div className="text-4xl font-black tracking-tight">{plan.price}</div>
                    <ul className="space-y-3 pt-2">
                      {plan.feats.map((f, i) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs font-bold">
                          <FiCheck className={plan.highlight ? "text-[#FF6500]" : "text-[#3B52E8]"} size={16} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-8">
                    <button 
                      onClick={() => handleNav('/auth/register')}
                      className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all ${
                        plan.highlight ? 'btn-edu-orange' : 'btn-edu-blue'
                      }`}
                    >
                      {plan.btn}
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footers />
    </div>
  );
}
