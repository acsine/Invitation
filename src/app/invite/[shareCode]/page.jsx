'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import cn from 'classnames';
import Icon from '@/components/Icon';
import Loader from '@/components/Loader';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { Stage, Layer, Rect, Circle, Text, Image as KonvaImage, Group } from 'react-konva';
import useImage from 'use-image';
import { FiUpload, FiDownload, FiUser, FiCamera, FiShare2, FiZap } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaShareAlt } from 'react-icons/fa';

const PosterRenderer = ({ event, guestName, guestPhoto, photoPos, photoZoom, onPhotoDrag, stageRef, stageSize }) => {
  const [bgImg] = useImage(event.backgroundImageUrl || '', 'anonymous');
  const [userImg] = useImage(guestPhoto || '', 'anonymous');
  
  const rawZones = JSON.parse(event.zones || '[]');
  const elements = Array.isArray(rawZones) ? rawZones : (rawZones.elements || []);
  const designWidth = rawZones.designWidth || stageSize.width;
  const designHeight = rawZones.designHeight || stageSize.height;

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
                text={zone.isDynamic ? (guestName || (guestPhoto ? '' : 'VOTRE NOM')) : (zone.text || '')}
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
                {userImg && (
                  <KonvaImage 
                    image={userImg} 
                    x={photoPos.x * zone.width}
                    y={photoPos.y * zone.height}
                    width={zone.width * photoZoom} 
                    height={zone.height * photoZoom} 
                    draggable
                    onMouseEnter={(e) => {
                      const container = e.target.getStage().container();
                      container.style.cursor = 'move';
                    }}
                    onMouseLeave={(e) => {
                      const container = e.target.getStage().container();
                      container.style.cursor = 'default';
                    }}
                    onDragEnd={(e) => {
                      onPhotoDrag({ x: e.target.x() / zone.width, y: e.target.y() / zone.height });
                    }}
                  />
                )}
                {!userImg && (
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
  const [photoPos, setPhotoPos] = useState({ x: 0, y: 0 });
  const [photoZoom, setPhotoZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sharingPlatform, setSharingPlatform] = useState(null); // null, 'whatsapp', 'facebook', 'all'
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
      reader.onload = async (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Use original dimensions but keep square for zone compatibility
          const size = Math.min(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          
          const offsetX = (img.width - size) / 2;
          const offsetY = (img.height - size) / 2;
          
          // Advanced High-End Auto-Enhancement
          // High contrast and brightness to make the face luminous and clear
          ctx.filter = 'contrast(1.4) brightness(1.1) saturate(1.4)';
          ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, size, size);
          
          setGuestPhoto(canvas.toDataURL('image/jpeg', 0.9));
          setPhotoPos({ x: 0, y: 0 });
          setPhotoZoom(1);
          toast.success('Photo ajoutée ! Utilisez le curseur pour zoomer et la souris pour déplacer.');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!guestName && !guestPhoto) {
      toast.error('Veuillez entrer votre nom OU ajouter une photo');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSharingPlatform('all');
    
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
    setSharingPlatform(null);
  };
  
  const handleShare = async (platform) => {
    if (!validateForm()) return;
    
    setSharingPlatform(platform);
    try {
      // 1. Generate the invitation image locally
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `invitation_${event.name.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

      // 2. Prepare sharing text
      const shareUrl = window.location.href;
      const shareText = `Salut ! 👋 Je viens de créer mon invitation personnalisée pour l'événement "${event.name}". 😍\n\nTu peux aussi générer la tienne ici :\n👉 ${shareUrl}`;

      // 3. Native File Share (This attaches the REAL IMAGE)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Mon invitation pour ${event.name}`,
            text: shareText
          });
          toast.success('Prêt à partager !');
        } catch (err) {
          if (err.name !== 'AbortError') throw err;
        }
      } else {
        // Fallback: If native share fails or is not supported (Desktop)
        // We download the image and copy the text
        const link = document.createElement('a');
        link.download = `invitation_${event.name}.png`;
        link.href = dataUrl;
        link.click();
        
        navigator.clipboard.writeText(shareText);
        toast.success("Image téléchargée ! Collez le message pour partager.");
      }

      // 4. Background Sync (Save to cloud for the organizer)
      fetch(`/api/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          name: guestName,
          photoUrl: guestPhoto,
          generatedImageUrl: dataUrl,
          saveToCloud: true 
        }),
      }).catch(err => console.error("Sync error:", err));

    } catch (error) {
      console.error('Share error:', error);
      toast.error('Erreur lors du partage de l\'image');
    }
    setSharingPlatform(null);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-white dark:bg-dark"><Loader /></div>;
  if (!event) return <div className="flex h-screen items-center justify-center bg-white dark:bg-dark text-red-500 font-bold">Événement introuvable</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark pb-12">
      <div className="mx-auto max-w-6xl px-4 pt-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-start">
          {/* Preview Section */}
          <div ref={containerRef} className="flex flex-col items-center sticky top-12 z-50">
            <div className="relative group">
              <PosterRenderer 
                event={event} 
                guestName={guestName} 
                guestPhoto={guestPhoto} 
                photoPos={photoPos}
                photoZoom={photoZoom}
                onPhotoDrag={setPhotoPos}
                stageRef={stageRef} 
                stageSize={stageSize} 
              />
              {guestPhoto && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-2xl animate-bounce pointer-events-none whitespace-nowrap z-[60] border border-white/20">
                  🖱️ Glissez pour ajuster
                </div>
              )}
            </div>
            {guestPhoto && (
              <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center max-w-[280px] leading-relaxed z-50">
                Cliquez et déplacez la photo sur l'affiche pour un cadrage parfait
              </p>
            )}
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-stroke relative z-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-dark mb-2">{event.name}</h1>
              <p className="text-body-color">Complétez vos informations pour générer votre invitation personnalisée.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-dark">Votre nom complet</label>
                <input 
                  type="text" 
                  value={guestName} 
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ex: Jean Dupont"
                  className="w-full rounded-xl border border-stroke bg-white py-3 px-5 text-gray-900 font-medium outline-none focus:border-primary transition !text-black shadow-sm"
                  style={{ color: 'black' }} // Extra safety for some mobile browsers
                />
                <p className="mt-2 text-[10px] text-gray-400 italic">Optionnel si vous ajoutez une photo</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-dark">Votre photo</label>
                <label className={cn(
                  "flex items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed py-8 cursor-pointer transition group relative overflow-hidden",
                  guestPhoto ? "border-primary bg-primary/5 shadow-inner" : "border-stroke hover:border-primary"
                )}>
                  <div className="flex flex-col items-center">
                    {guestPhoto ? (
                      <>
                        <div className="relative">
                          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2 shadow-inner border border-primary/20">
                            <FiCamera size={32} />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <FiZap size={14} />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-primary">Photo prête ! ✅</span>
                        <div className="flex items-center gap-1.5 mt-1 bg-gray-100 px-3 py-1 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                          <FiShare2 size={12} className="rotate-90" /> Cliquez pour remplacer la photo
                        </div>
                      </>
                    ) : (
                      <>
                        <FiCamera size={32} className="text-gray-300 group-hover:text-primary transition mb-2" />
                        <span className="text-sm font-medium text-body-color group-hover:text-primary transition">
                          Choisir une photo
                        </span>
                      </>
                    )}
                  </div>
                  <input type="file" onChange={handlePhotoUpload} accept="image/*" hidden />
                </label>

                {guestPhoto && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-stroke animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zoom du portrait</label>
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{Math.round(photoZoom * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="3" 
                      step="0.05" 
                      value={photoZoom} 
                      onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary mb-2"
                    />
                    <p className="text-[9px] text-gray-400 font-bold italic">Réglez le zoom pour bien cadrer votre visage</p>
                  </div>
                )}
              </div>

              {event.isPaid && (
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="text-xl font-bold text-primary mb-2">Prix: {event.price} FCFA</div>
                  <p className="text-sm text-body-color mb-4 italic">Veuillez effectuer le paiement au numéro: <strong className="text-dark">{event.paymentNumber}</strong></p>
                  <label className="mb-2 block text-xs font-bold text-gray-500 uppercase">Référence de la transaction</label>
                  <input 
                    type="text"
                    placeholder="Entrez le code reçu" 
                    required 
                    className="w-full rounded-lg border border-stroke bg-white py-2 px-4 text-sm text-dark outline-none focus:border-primary"
                  />
                </div>
              )}

              <div className="pt-2">
                <p className="text-center text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider italic">Partagez pour confirmer votre présence</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => handleShare('whatsapp')}
                    disabled={sharingPlatform !== null}
                    className="flex items-center justify-center gap-2 py-4 px-4 bg-[#25D366] text-white rounded-2xl font-bold hover:opacity-90 transition shadow-xl shadow-green-500/20 text-lg disabled:opacity-50"
                  >
                    {sharingPlatform === 'whatsapp' ? <Loader className="!h-6 !w-6 !text-white" /> : <><FaWhatsapp size={24} /> WhatsApp</>}
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleShare('facebook')}
                    disabled={sharingPlatform !== null}
                    className="flex items-center justify-center gap-2 py-4 px-4 bg-[#1877F2] text-white rounded-2xl font-bold hover:opacity-90 transition shadow-xl shadow-blue-500/20 text-lg disabled:opacity-50"
                  >
                    {sharingPlatform === 'facebook' ? <Loader className="!h-6 !w-6 !text-white" /> : <><FaFacebook size={24} /> Facebook</>}
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => handleShare('all')}
                  disabled={sharingPlatform !== null}
                  className="mt-6 flex w-full items-center justify-center gap-3 py-4 px-4 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition shadow-xl shadow-pink-500/20 disabled:opacity-50"
                >
                  {sharingPlatform === 'all' ? <Loader className="!h-6 !w-6 !text-white" /> : <><FiShare2 size={22} /> Autres options de partage</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
