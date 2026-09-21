'use client';

import React from 'react';
import Image from 'next/image';
import { FiHeart, FiBriefcase, FiGift, FiShield, FiCheck, FiArrowRight, FiUsers, FiShare2 } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import AppLink from '@/components/AppLink';
import ScrollReveal from './ScrollReveal';

export default function EventShowcase() {
  const events = [
    {
      id: 'mariage',
      title: 'Mariages & Réceptions Nuptiales',
      icon: FiHeart,
      badge: 'Cérémonie & Fête',
      badgeBg: 'bg-[#FF6500]/10 text-[#FF6500] border-amber-200',
      image: '/images/uploaded/wedding.jpg',
      description: 'Donnez une touche d\'élégance féerique à votre grand jour. Envoyez des faire-part digitaux raffinés sur WhatsApp, attribuez les tables et contrôlez les entrées avec sérénité.',
      highlights: [
        'Cartons d\'invitation digitaux personnalisés avec photo',
        'Gestion par famille et attribution des tables',
        'Confirmation RSVP automatique par WhatsApp & SMS',
        'Accueil chaleureux avec contrôle d\'accès instantané'
      ],
      stats: '100% de fluidité le Jour J',
      imageRight: true
    },
    {
      id: 'conference',
      title: 'Conférences, Forums & Séminaires B2B',
      icon: FiBriefcase,
      badge: 'Professionnel & B2B',
      badgeBg: 'bg-blue-50 text-[#3B52E8] border-blue-200',
      image: '/images/uploaded/conference.jpg',
      description: 'Offrez un accueil haut de gamme à vos intervenants et panélistes. Badges nominatifs HD instantanés avec rôle, organisation et contrôle d\'accès rapide.',
      highlights: [
        'Badges professionnels HD nominatifs avec lanière',
        'Gestion des accès panélistes, presse & invités VIP',
        'Rapports d\'émargement et d\'affluence téléchargeables',
        'Scan rapide à moins de 0.5 sec par participant'
      ],
      stats: 'Jusqu\'à 5,000+ panélistes & participants',
      imageRight: false
    },
    {
      id: 'anniversaire',
      title: 'Anniversaires & Soirées Privées',
      icon: FiGift,
      badge: 'Festivités & Flyers',
      badgeBg: 'bg-purple-50 text-purple-600 border-purple-200',
      image: '/images/uploaded/birthday.jpg',
      description: 'Célébrez vos moments précieux avec vos proches. Partagez des flyers digitaux stylés sur vos réseaux sociaux et suivez qui a confirmé sa présence.',
      highlights: [
        'Partage en 1 clic sur WhatsApp, Instagram & TikTok',
        'Pass VIP d\'accès pour garder l\'événement privé',
        'Notification en direct à l\'arrivée de chaque invité',
        'Galerie de souvenirs & invitations personnalisées'
      ],
      stats: 'Partage Instantané sur les réseaux',
      imageRight: true
    },
    {
      id: 'gala',
      title: 'Galas, Soirées Prestige & Sécurité',
      icon: FiShield,
      badge: 'Haute Sécurité & Red Carpet',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      image: '/images/uploaded/security.jpg',
      description: 'Protégez vos galas et cérémonies prestige contre la contrefaçon et les intrus. Émargement scanner par agent de sécurité avec alerte instantanée.',
      highlights: [
        'Contrôle d\'accès anti-fraude par scanner mobile',
        'Gestion multi-portes et filtrage par zone VIP',
        'Scan rapide même en zone sans réseau mobile',
        'Support prioritaire le jour de la cérémonie'
      ],
      stats: 'Sécurité Anti-Contrefaçon Maximum',
      imageRight: false
    },
  ];

  return (
    <div className="space-y-20">
      {events.map((item, index) => {
        const Icon = item.icon;
        return (
          <ScrollReveal key={item.id} variant="up" delay={index * 100}>
            <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-14 border-none shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                
                {/* Text Content Block */}
                <div className={`lg:col-span-6 space-y-6 ${item.imageRight ? 'order-1' : 'order-1 lg:order-2'}`}>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-none text-xs font-black uppercase tracking-wider ${item.badgeBg}`}>
                    <Icon size={14} />
                    <span>{item.badge}</span>
                  </div>

                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    {item.title}
                  </h3>

                  <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {item.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-[#F4F6FB] border-none shadow-xs">
                        <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 mt-0.5 flex-shrink-0">
                          <FiCheck size={14} />
                        </div>
                        <span className="text-xs font-bold text-slate-800 leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex flex-wrap items-center gap-5">
                    <AppLink 
                      href="/auth/register" 
                      className="btn-edu-orange px-8 py-4 rounded-xl font-extrabold text-sm flex items-center gap-2.5 shadow-lg shadow-orange-500/25 border-none"
                    >
                      <span>Partager & Créer cet événement</span>
                      <FiArrowRight size={17} />
                    </AppLink>
                    <div className="text-xs font-extrabold text-[#3B52E8] flex items-center gap-1.5">
                      <FiUsers size={16} /> {item.stats}
                    </div>
                  </div>
                </div>

                {/* Image Showcase Block */}
                <div className={`lg:col-span-6 ${item.imageRight ? 'order-2' : 'order-2 lg:order-1'}`}>
                  <div className="relative rounded-3xl overflow-hidden shadow-lg border-none bg-slate-100 group">
                    <div className="relative h-[380px] sm:h-[460px] w-full">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        priority={index === 0}
                      />
                      {/* Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    </div>

                    {/* Floating Overlay Card */}
                    <div className="absolute bottom-6 left-6 right-6 p-4.5 rounded-2xl bg-white/95 border-none text-slate-900 shadow-xl backdrop-blur-md flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FF6500] flex items-center justify-center text-white shadow-md flex-shrink-0">
                          <BsQrCode size={20} />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-wider text-[#FF6500]">InviteManager Pass</div>
                          <div className="text-xs font-extrabold text-slate-900">Cartes & Pass HD Automatiques</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border-none text-xs font-extrabold">
                        Prêt à partager
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
}
