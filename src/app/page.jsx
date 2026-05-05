'use client';

import React from 'react';
import AppLink from '../components/AppLink';
import Image from 'next/image';
import { FiCheck, FiZap, FiTarget, FiUsers, FiAward, FiArrowRight, FiPlay, FiStar } from 'react-icons/fi';
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
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden selection:bg-primary selection:text-white">
      {isNavigatingLoader && <FullPageLoader message="Initialisation de la session..." />}
      
      {/* --- Animated Background Elements --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/50">
        <div className="container mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">I</div>
            <span className="text-2xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-primary">InviteManager</span>
          </div>
          <div className="hidden lg:flex items-center gap-10">
            <a href="#solutions" className="text-sm font-bold text-gray-500 hover:text-primary transition-all relative group">Solutions<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" /></a>
            <a href="#pricing" className="text-sm font-bold text-gray-500 hover:text-primary transition-all relative group">Tarifs<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" /></a>
            <a href="#demo" className="text-sm font-bold text-gray-500 hover:text-primary transition-all relative group">Démo<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" /></a>
            <div className="h-6 w-px bg-gray-200 mx-2" />
            <Button 
              variant="ghost"
              href="/auth/login"
              onClick={() => handleNav('/auth/login')}
              loading={navLoading === '/auth/login'}
              className="text-sm font-bold text-gray-900 hover:text-primary transition-colors h-auto p-0"
            >
              Connexion
            </Button>
            <Button 
              href="/auth/register"
              onClick={() => handleNav('/auth/register')}
              loading={navLoading === '/auth/register'}
              className="px-8 py-4 bg-gray-900 text-white rounded-2xl h-auto"
            >
              Démarrer
            </Button>
          </div>
        </div>
      </nav>

      {/* --- Massive Hero Section --- */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="container mx-auto px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/50 backdrop-blur-md border border-white shadow-xl text-primary text-[10px] font-black uppercase tracking-[0.3em] animate-in fade-in zoom-in duration-1000">
              <FiStar className="text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
              Plateforme N°1 en Afrique de l'Ouest
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black leading-[0.85] tracking-tighter text-gray-900 animate-in slide-in-from-bottom-12 duration-1000">
              Le futur de vos <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-600 to-purple-600 animate-gradient-x">
                événements
              </span> est ici.
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Simplifiez la logistique, impressionnez vos invités et gérez tout depuis un seul tableau de bord élégant.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <Button 
                href="/auth/register"
                onClick={() => handleNav('/auth/register')}
                loading={navLoading === '/auth/register'}
                className="px-14 py-7 bg-primary text-white rounded-[28px] h-auto"
              >
                Créer un compte <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Button>
              <Button 
                href="/invite/demo"
                onClick={() => handleNav('/invite/demo')}
                loading={navLoading === '/invite/demo'}
                variant="outline"
                className="px-14 py-7 rounded-[28px] h-auto"
              >
                <FiPlay /> Voir la démo
              </Button>
            </div>
          </div>
          {/* Full Width Immersive Image with Text Overlay */}
          <div className="mt-20 relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-700 overflow-hidden group">
            <div className="relative h-[60vh] md:h-[85vh] w-full">
              <Image 
                src="/images/Gemini_Generated_Image_3d2q3t3d2q3t3d2q.png" 
                alt="InviteManager Interface" 
                fill
                className="object-cover transition-transform duration-[10s] group-hover:scale-110 blur-[8px]"
                priority
              />
              {/* Background Overlay */}
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
              
              {/* Advertising Text Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-black/10 backdrop-blur-[1px]">
                 <div className="max-w-4xl space-y-8 animate-in zoom-in duration-1000 delay-1000">
                    <div className="inline-flex px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                       Innovation Technologique
                    </div>
                    <h2 className="text-4xl md:text-7xl font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] leading-[1.1] tracking-tighter">
                       L'outil ultime pour vos <br/>
                       <span className="text-primary italic underline decoration-white/20 underline-offset-8">événements d'exception.</span>
                    </h2>
                    <p className="text-xl md:text-2xl text-white font-bold drop-shadow-lg max-w-2xl mx-auto opacity-95 leading-relaxed">
                       Créez, gérez et impressionnez. La puissance du digital au service de vos cérémonies les plus prestigieuses.
                    </p>
                    <div className="pt-8 flex justify-center gap-6">
                        <div className="flex flex-col items-center gap-2">
                           <div className="text-3xl font-black text-white">0s</div>
                           <div className="text-[10px] font-black text-white/70 uppercase tracking-widest">Temps perdu</div>
                        </div>
                        <div className="w-px h-12 bg-white/20" />
                        <div className="flex flex-col items-center gap-2">
                           <div className="text-3xl font-black text-white">100%</div>
                           <div className="text-[10px] font-black text-white/70 uppercase tracking-widest">Satisfaction</div>
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Feature Grid with Premium Cards --- */}
      <section className="py-32 relative overflow-hidden" id="solutions">
        <div className="container mx-auto px-8 relative z-10 text-center mb-20">
          <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Expertise Événementielle</h2>
          <h3 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">Des solutions pensées <br/> pour <span className="text-primary italic">chaque étape.</span></h3>
        </div>
        <div className="container mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
             {[
               { t: "Invitations", d: "Créez des designs uniques qui marquent les esprits dès le premier regard.", img: "/images/Gemini_Generated_Image_6wroiy6wroiy6wro.png", icon: FiStar },
               { t: "Badges", d: "Automatisez la production de badges HD pour des milliers d'invités sans effort.", img: "/images/Gemini_Generated_Image_dut6h2dut6h2dut6.png", icon: FiZap },
               { t: "Check-in", d: "Contrôlez les accès en temps réel avec une technologie QR ultra-rapide.", img: "/images/Gemini_Generated_Image_eg2gk8eg2gk8eg2g.png", icon: FiTarget }
             ].map((item, i) => (
               <div key={i} className="group relative bg-white rounded-[48px] p-4 border border-gray-100 shadow-2xl hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 overflow-hidden flex flex-col">
                 <div className="relative h-[400px] rounded-[40px] overflow-hidden mb-8">
                   <Image src={item.img} alt={item.t} fill className="object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                   <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent" />
                   
                   {/* Floating Icon Overlay */}
                   <div className="absolute top-6 left-6 w-14 h-14 glass-card rounded-2xl flex items-center justify-center text-primary shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <item.icon size={24} />
                   </div>
                   
                   <div className="absolute bottom-8 left-8 right-8">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.t}</h4>
                      <div className="w-10 h-1 bg-primary rounded-full group-hover:w-full transition-all duration-700" />
                   </div>
                 </div>
                 <div className="px-4 pb-4 flex-1 flex flex-col">
                    <p className="text-gray-500 font-medium leading-relaxed mb-8">{item.d}</p>
                    <div className="mt-auto">
                       <button className="w-full py-4 bg-gray-50 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:bg-primary group-hover:text-white group-hover:shadow-lg transition-all duration-500">
                          Découvrir la solution
                       </button>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* --- Full-Width Gradient Immersive Section --- */}
      <section className="relative py-48 my-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-900 to-black animate-gradient-xy" />
        <Image 
          src="/images/Gemini_Generated_Image_obh563obh563obh5.png" 
          alt="Immersive" 
          fill 
          className="object-cover opacity-30 mix-blend-overlay scale-110 animate-float" 
        />
        <div className="container mx-auto px-8 relative z-10 text-center text-white space-y-12">
           <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-10 duration-1000">
             Vivez l'expérience <br/> <span className="text-white/50 italic underline decoration-primary underline-offset-8">sans compromis.</span>
           </h2>
           <p className="text-xl md:text-3xl text-white/70 max-w-3xl mx-auto font-medium leading-relaxed">
             Des mariages les plus intimes aux conférences internationales de 10 000 personnes.
           </p>
           <div className="pt-10">
              <Button 
                href="/auth/register"
                onClick={() => handleNav('/auth/register')}
                loading={navLoading === '/auth/register'}
                className="px-16 py-7 bg-white text-gray-900 rounded-[32px] h-auto shadow-2xl"
              >
                Essayer gratuitement
              </Button>
           </div>
        </div>
      </section>

      {/* --- Professional Table Section --- */}
      <section className="py-32 bg-gray-50/50">
        <div className="container mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative animate-float" style={{ animationDelay: '1s' }}>
             <div className="relative rounded-[60px] overflow-hidden shadow-2xl border-8 border-white">
                <Image 
                  src="/images/Gemini_Generated_Image_dut6h2dut6h2dut6.png" 
                  alt="Feature Detail" 
                  width={800} 
                  height={1000} 
                  className="w-full object-cover"
                />
             </div>
             <div className="absolute -bottom-10 -right-10 bg-gradient-to-br from-primary to-blue-600 p-10 rounded-[40px] shadow-2xl text-white max-w-xs animate-in zoom-in duration-700 delay-1000">
                <FiZap size={40} className="mb-6" />
                <div className="text-4xl font-black mb-2">99.9%</div>
                <div className="text-xs font-black uppercase tracking-widest opacity-80">De satisfaction client</div>
             </div>
          </div>
          <div className="space-y-10">
            <h3 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">
              Un workflow <span className="text-primary">simplifié</span> <br/> pour vos équipes.
            </h3>
            <p className="text-xl text-gray-500 font-medium leading-relaxed">
              Nous avons supprimé toute la complexité inutile pour ne garder que l'essentiel : la réussite de votre événement.
            </p>
            <div className="space-y-6">
              {[
                { t: "Zéro installation", d: "Tout se passe dans votre navigateur." },
                { t: "Mobile Ready", d: "Gérez vos entrées depuis n'importe quel smartphone." },
                { t: "Support 24/7", d: "Une équipe dédiée pour vous accompagner." }
              ].map((f, i) => (
                <div key={i} className="flex gap-6 items-center p-6 bg-white rounded-3xl border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all group">
                   <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                     <FiCheck size={24} />
                   </div>
                   <div>
                     <h4 className="text-lg font-black text-gray-900 uppercase tracking-tighter">{f.t}</h4>
                     <p className="text-gray-500 text-sm font-medium">{f.d}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
