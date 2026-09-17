'use client';

import React from 'react';
import AppLink from '../components/AppLink';
import Image from 'next/image';
import { FiCheck, FiZap, FiTarget, FiUsers, FiAward, FiArrowRight, FiPlay, FiStar, FiShield, FiTrendingUp, FiQrCode } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Button from '../components/ui/Button';
import FullPageLoader from '@/components/FullPageLoader';
import Footers from '../components/Footer';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const [navLoading, setNavLoading] = useState(null);
  const [isNavigatingLoader, setIsNavigatingLoader] = useState(false);

  useEffect(() => {
    setNavLoading(null);
  }, [pathname]);

  const handleNav = (url) => {
    if (pathname !== url) {
      if (url === '/auth/login') {
        setIsNavigatingLoader(true);
        setTimeout(() => router.push(url), 800);
      } else {
        setNavLoading(url);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-x-hidden selection:bg-indigo-600 selection:text-white">
      {isNavigatingLoader && <FullPageLoader message="Initialisation de la session..." />}
      
      {/* --- Ambient Background Glows --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[140px] animate-pulse-soft" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-[140px] animate-pulse-soft" style={{ animationDelay: '3s' }} />
      </div>

      {/* --- Floating Glass Header --- */}
      <header className="fixed top-0 w-full z-50 glass-nav">
        <div className="container mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/25 group-hover:rotate-6 transition-transform duration-300">
              I
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight uppercase gradient-text">
              InviteManager
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            <a href="#solutions" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Tarifs
            </a>
            <a href="#features" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Fonctionnalités
            </a>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            <Button 
              variant="ghost"
              size="sm"
              href="/auth/login"
              onClick={() => handleNav('/auth/login')}
              loading={navLoading === '/auth/login'}
            >
              Connexion
            </Button>
            <Button 
              variant="glow"
              size="sm"
              href="/auth/register"
              onClick={() => handleNav('/auth/register')}
              loading={navLoading === '/auth/register'}
            >
              Démarrer gratuit <FiArrowRight size={16} />
            </Button>
          </div>
        </div>
      </header>

      {/* --- Main Hero Section --- */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        <div className="container mx-auto px-6 sm:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider animate-fadeIn">
              <FiStar className="text-amber-500 fill-amber-500" size={14} />
              <span>Plateforme N°1 de gestion d'événements</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.95] text-slate-900 dark:text-white">
              Le futur de vos <br/>
              <span className="gradient-text">
                événements
              </span> commence ici.
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Simplifiez la logistique, créez des pass QR personnalisés et gérez vos invités en temps réel depuis un tableau de bord ultra-ergonomique.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                variant="glow"
                size="lg"
                href="/auth/register"
                onClick={() => handleNav('/auth/register')}
                loading={navLoading === '/auth/register'}
                className="shadow-xl"
              >
                Créer mon compte <FiArrowRight size={18} />
              </Button>
              <Button 
                variant="glass"
                size="lg"
                href="/invite/demo"
                onClick={() => handleNav('/invite/demo')}
                loading={navLoading === '/invite/demo'}
              >
                <FiPlay size={18} className="text-indigo-600 dark:text-indigo-400" /> Voir la démo
              </Button>
            </div>
          </div>

          {/* Immersive Platform Mockup Banner */}
          <div className="mt-16 relative w-full rounded-3xl overflow-hidden glass-card p-3 border border-white/50 dark:border-slate-800 shadow-2xl hover-lift">
            <div className="relative h-[350px] sm:h-[500px] md:h-[600px] w-full rounded-2xl overflow-hidden">
              <Image 
                src="/images/Gemini_Generated_Image_3d2q3t3d2q3t3d2q.png" 
                alt="InviteManager Platform" 
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 sm:p-12">
                <div className="max-w-2xl space-y-4">
                  <span className="px-3 py-1 rounded-md bg-indigo-600/90 text-white text-xs font-extrabold uppercase tracking-wider">
                    Interface Nouvelle Génération
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                    Une expérience fluide pour les organisateurs & les invités.
                  </h3>
                  <div className="flex items-center gap-6 pt-2 text-white/90 text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <FiCheck className="text-emerald-400" size={18} /> <span>100% cloud & mobile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCheck className="text-emerald-400" size={18} /> <span>Check-in instantané</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Key Metrics Section --- */}
      <section className="py-12 bg-white/60 dark:bg-slate-900/60 border-y border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md">
        <div className="container mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: "50K+", label: "Invités gérés", icon: FiUsers },
              { val: "99.9%", label: "Taux de satisfaction", icon: FiStar },
              { val: "< 1s", label: "Temps de scan QR", icon: FiQrCode },
              { val: "24/7", label: "Disponibilité service", icon: FiShield }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2 p-4 rounded-2xl transition-all hover:bg-white/80 dark:hover:bg-slate-800/50">
                <div className="inline-flex p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-1">
                  <stat.icon size={22} />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.val}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Feature Grid Section --- */}
      <section className="py-24" id="solutions">
        <div className="container mx-auto px-6 sm:px-8 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Solutions Événementielles</h2>
            <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Pensé pour l'excellence de vos cérémonies.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                t: "Pass & Badges sur-mesure", 
                d: "Créez des cartons d'invitations visuellement époustouflants avec QR code unique.", 
                img: "/images/Gemini_Generated_Image_6wroiy6wroiy6wro.png", 
                icon: FiStar 
              },
              { 
                t: "Impression & Badges HD", 
                d: "Générez des badges professionnels haute résolution prêts pour l'impression.", 
                img: "/images/Gemini_Generated_Image_dut6h2dut6h2dut6.png", 
                icon: FiZap 
              },
              { 
                t: "Contrôle d'Accès QR Code", 
                d: "Scannez les invitations à l'entrée depuis n'importe quel smartphone sans matériel lourd.", 
                img: "/images/Gemini_Generated_Image_eg2gk8eg2gk8eg2g.png", 
                icon: FiTarget 
              }
            ].map((item, i) => (
              <div key={i} className="group glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 hover-lift flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="relative h-56 rounded-xl overflow-hidden">
                    <Image src={item.img} alt={item.t} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl text-indigo-600 dark:text-indigo-400 shadow-md">
                      <item.icon size={20} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.t}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.d}</p>
                  </div>
                </div>
                <div className="pt-6">
                  <Button variant="outline" size="sm" className="w-full">
                    En savoir plus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Workflow & Benefits Section --- */}
      <section className="py-24 bg-white dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60" id="features">
        <div className="container mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Simplification Maximale</span>
                <h3 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                  Un contrôle total, de la création à l'émargement.
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                  Conçu pour libérer les organisateurs du stress de la gestion manuelle. Suivez les confirmations d'invitation et scannez les entrées en temps réel.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Zéro installation de logiciel", desc: "Accessible directement sur le web depuis PC, Mac, et mobile." },
                  { title: "Scanner QR Code intégré", desc: "Transformez vos smartphones de staff en terminaux de check-in." },
                  { title: "Statistiques en temps réel", desc: "Visualisez le taux de présence et l'affluence en direct." }
                ].map((feat, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl glass-card border border-slate-200/60 dark:border-slate-800/60">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400 h-fit">
                      <FiCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{feat.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative glass-card p-4 rounded-3xl border border-white/60 dark:border-slate-800 shadow-2xl hover-lift">
              <div className="relative h-[450px] rounded-2xl overflow-hidden">
                <Image 
                  src="/images/Gemini_Generated_Image_obh563obh563obh5.png" 
                  alt="Workflow Overview" 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-8 flex flex-col justify-end">
                  <div className="glass-card p-6 rounded-2xl border border-white/20 text-white space-y-2">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase">
                      <FiTrendingUp size={16} /> <span>Performance Événementielle</span>
                    </div>
                    <div className="text-xl font-bold">100% de fluidité garantie pour vos invités</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer Component --- */}
      <Footers />
    </div>
  );
}
