'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import cn from 'classnames';
import Icon from '@/components/Icon';
import Loader from '@/components/Loader';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from 'react-konva';
import useImage from 'use-image';
import { FiUpload, FiDownload, FiUser, FiCamera, FiShare2, FiZap } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaShareAlt } from 'react-icons/fa';

const PosterRenderer = ({ event, guestName, guestPhoto, stageRef, stageSize }) => {
  const [bgImg] = useImage(event.backgroundImageUrl || '', 'anonymous');
  const [userImg] = useImage(guestPhoto || '', 'anonymous');
  
  const rawZones = JSON.parse(event.zones || '[]');
  const elements = Array.isArray(rawZones) ? rawZones : (rawZones.elements || []);
  const designWidth = rawZones.designWidth || stageSize.width;
  const designHeight = rawZones.designHeight || stageSize.height;

  // Calculate scale based on current stage size vs design size
  const scaleX = stageSize.width / designWidth;
  const scaleY = stageSize.height / designHeight;

  return (
    <Stage
      width={stageSize.width}
      height={stageSize.height}
      ref={stageRef}
      style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}
    >
      <Layer>
        {bgImg && <KonvaImage image={bgImg} width={stageSize.width} height={stageSize.height} />}
        {elements.map((el) => {
          const zone = {
            ...el,
            x: el.x * scaleX,
            y: el.y * scaleY,
            width: el.width * scaleX,
            height: el.height * scaleY,
            fontSize: (el.fontSize || 24) * scaleX,
          };

          if (zone.type === 'text' || (zone.isDynamic && zone.type !== 'PHOTO')) {
            return (
              <Text
                key={zone.id}
                text={zone.isDynamic ? (guestName || 'VOTRE NOM') : (zone.text || '')}
                x={zone.x}
                y={zone.y}
                width={zone.width}
                fontSize={zone.fontSize}
                fill={zone.fill}
                fontFamily={zone.fontFamily}
                fontStyle={zone.fontStyle}
                rotation={zone.rotation}
                align="center"
              />
            );
          }
          if (zone.isDynamic && zone.type === 'PHOTO') {
            const getClipFunc = (ctx) => {
              const { width, height, subType } = zone;
              if (subType === 'circle') ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2, false);
              else if (subType === 'diamond') {
                ctx.moveTo(width / 2, 0); ctx.lineTo(width, height / 2); ctx.lineTo(width / 2, height); ctx.lineTo(0, height / 2); ctx.closePath();
              } else ctx.rect(0, 0, width, height);
            };

            return (
              <Group
                key={zone.id}
                x={zone.x}
                y={zone.y}
                rotation={zone.rotation}
                clipFunc={getClipFunc}
                width={zone.width}
                height={zone.height}
              >
                <Rect width={zone.width} height={zone.height} fill="#f3f4f6" />
                {userImg ? (
                  <KonvaImage image={userImg} width={zone.width} height={zone.height} />
                ) : (
                  <Text
                    text="📸"
                    fontSize={Math.min(zone.width, zone.height) * 0.4}
                    width={zone.width}
                    height={zone.height}
                    align="center"
                    verticalAlign="middle"
                    opacity={0.3}
                  />
                )}
              </Group>
            );
          }
          return null; 
        })}
      </Layer>
    </Stage>
  );
};


export default function InvitePage({ params }) {
  const { shareCode } = use(params);
  const [returnLoading, setReturnLoading] = useState(false);

  if (shareCode?.toLowerCase() === 'demo') {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-white dark:bg-dark p-8 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mb-8 shadow-xl shadow-primary/5">
          <FiZap size={48} className="animate-pulse" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase">Démo non disponible</h1>
        <p className="text-gray-500 font-medium max-w-md leading-relaxed">
          Cette fonctionnalité de démonstration est en cours de maintenance. <br/> 
          Revenez très bientôt pour découvrir la puissance de notre système d'invitation !
        </p>
        <Button 
          onClick={() => {
            setReturnLoading(true);
            window.location.href = '/';
          }}
          loading={returnLoading}
          className="mt-12 px-10 py-5 bg-gray-900 text-white rounded-2xl h-auto"
        >
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const [event, setEvent] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhoto, setGuestPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 400, height: 600 });
  const containerRef = useRef();
  const stageRef = useRef();

  useEffect(() => {
    fetch(`/api/invite/${shareCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) toast.error(data.error);
        else setEvent(data);
        setLoading(false);
      });
  }, [shareCode]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && event) {
        const width = Math.min(containerRef.current.offsetWidth, 500);
        
        // Use saved proportions if available, otherwise default to 1.4
        const rawZones = JSON.parse(event.zones || '{}');
        const ratio = (rawZones.designWidth && rawZones.designHeight) 
          ? rawZones.designHeight / rawZones.designWidth 
          : 1.4;
          
        setStageSize({ width, height: width * ratio });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [event]);


  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setGuestPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `invitation_${event.name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();

      const res = await fetch(`/api/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          name: guestName,
          photoUrl: guestPhoto,
          saveToCloud: false 
        }),
      });

      if (res.ok) toast.success('Invitation téléchargée avec succès !');
      else toast.error('Erreur lors de l\'inscription');
    } catch (error) {
      toast.error('Erreur lors de la génération');
    }
    setSubmitting(false);
  };
  
  const handleShare = async (platform) => {
    if (!guestName) {
      toast.error('Veuillez entrer votre nom avant de partager');
      return;
    }
    
    setSubmitting(true);
    try {
      // Register guest in DB
      await fetch(`/api/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          name: guestName,
          photoUrl: guestPhoto,
          saveToCloud: false 
        }),
      });

      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `invitation_${event.name.replace(/\s+/g, '_')}.png`, { type: 'image/png' });
      const shareUrl = window.location.href;
      const shareText = `Salut ! 👋 Je viens de créer mon invitation personnalisée pour l'événement "${event.name}". J'ai vraiment hâte d'y être ! 😍\n\nTu peux aussi générer la tienne en 2 minutes ici :\n👉 ${shareUrl}`;

      // Web Share API support check
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Mon invitation pour ${event.name}`,
            text: shareText,
            url: shareUrl 
          });
          toast.success('Partagé avec succès !');
        } catch (err) {
          if (err.name !== 'AbortError') throw err;
        }
      } else {
        // Fallback links for desktop/unsupported browsers
        
        if (platform === 'whatsapp') {
          // WhatsApp prefers the URL as part of the text for clickability
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        } else if (platform === 'facebook') {
          // Facebook sharer handles the URL preview automatically
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        } else {
          // General share fallback
          if (navigator.share) {
            await navigator.share({
              title: event.name,
              text: shareText,
              url: shareUrl
            });
          } else {
            toast.error("Le partage direct d'image n'est pas supporté par votre navigateur. L'image a été téléchargée à la place.");
            const link = document.createElement('a');
            link.download = `invitation.png`;
            link.href = dataUrl;
            link.click();
          }
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Erreur lors du partage');
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-white dark:bg-dark"><Loader /></div>;
  if (!event) return <div className="flex h-screen items-center justify-center bg-white dark:bg-dark text-red-500 font-bold">Événement introuvable</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pb-12">
      <div className="mx-auto max-w-6xl px-4 pt-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">
          {/* Preview Section */}
          <div ref={containerRef} className="flex justify-center sticky top-12">
            <PosterRenderer 
              event={event} 
              guestName={guestName} 
              guestPhoto={guestPhoto} 
              stageRef={stageRef} 
              stageSize={stageSize} 
            />
          </div>

          {/* Form Section */}
          <div className="bg-white dark:bg-dark-2 rounded-3xl p-8 shadow-xl border border-stroke dark:border-white/10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-dark dark:text-white mb-2">{event.name}</h1>
              <p className="text-body-color">Complétez vos informations pour générer votre invitation personnalisée.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-dark dark:text-white">Votre nom complet</label>
                <input 
                  type="text" 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  required
                  className="w-full rounded-xl border border-stroke bg-transparent py-3 px-5 text-dark dark:text-white outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-dark dark:text-white">Votre photo</label>
                <label className="flex items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed border-stroke dark:border-white/10 py-8 cursor-pointer hover:border-primary transition group">
                  <div className="flex flex-col items-center">
                    <FiCamera size={32} className="text-gray-300 group-hover:text-primary transition mb-2" />
                    <span className="text-sm font-medium text-body-color group-hover:text-primary transition">
                      {guestPhoto ? 'Changer de photo' : 'Choisir une photo'}
                    </span>
                  </div>
                  <input type="file" onChange={handlePhotoUpload} accept="image/*" hidden />
                </label>
              </div>

              {event.isPaid && (
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="text-xl font-bold text-primary mb-2">Prix: {event.price} FCFA</div>
                  <p className="text-sm text-body-color mb-4 italic">Veuillez effectuer le paiement au numéro: <strong className="text-dark dark:text-white">{event.paymentNumber}</strong></p>
                  <label className="mb-2 block text-xs font-bold text-gray-500 uppercase">Référence de la transaction</label>
                  <input 
                    type="text"
                    placeholder="Entrez le code reçu" 
                    required 
                    className="w-full rounded-lg border border-stroke bg-white dark:bg-dark-3 py-2 px-4 text-sm outline-none focus:border-primary"
                  />
                </div>
              )}

              <div className="pt-2">
                <p className="text-center text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider italic">Partagez pour confirmer votre présence</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => handleShare('whatsapp')}
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 py-4 px-4 bg-[#25D366] text-white rounded-2xl font-bold hover:opacity-90 transition shadow-xl shadow-green-500/20 text-lg"
                  >
                    <FaWhatsapp size={24} /> WhatsApp
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleShare('facebook')}
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 py-4 px-4 bg-[#1877F2] text-white rounded-2xl font-bold hover:opacity-90 transition shadow-xl shadow-blue-500/20 text-lg"
                  >
                    <FaFacebook size={24} /> Facebook
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => handleShare('all')}
                  disabled={submitting}
                  className="mt-6 flex w-full items-center justify-center gap-3 py-4 px-4 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition shadow-xl shadow-pink-500/20"
                >
                  {submitting ? <Loader className="!h-6 !w-6" /> : <><FiShare2 size={22} /> Autres options de partage</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
