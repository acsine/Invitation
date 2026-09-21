'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import cn from 'classnames';
import Loader from '@/components/Loader';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from 'react-konva';
import useImage from 'use-image';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { 
  FiUpload, 
  FiDownload, 
  FiUser, 
  FiPhone, 
  FiCamera, 
  FiShare2, 
  FiZap, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiCalendar,
  FiStar,
  FiZoomIn,
  FiMove,
  FiShield, 
  FiArrowRight,
  FiArrowLeft,
  FiRefreshCw,
  FiInfo,
  FiCheck
} from 'react-icons/fi';
import { FaWhatsapp, FaFacebook } from 'react-icons/fa';
import QRCode from 'qrcode';
import Modal from '@/components/Modal';
import Link from 'next/link';

const PosterRenderer = ({ event, guestName, guestPhoto, photoPos, photoZoom, onPhotoDrag, stageRef, stageSize, qrCodeData }) => {
  const [bgImg] = useImage(event.backgroundImageUrl || '', 'anonymous');
  const [userImg] = useImage(guestPhoto || '', 'anonymous');
  const [qrImg] = useImage(qrCodeData || '', 'anonymous');

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
      style={{ backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden' }}
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

          if (zone.isDynamic && zone.type === 'QRCODE') {
            return (
              <Group key={zone.id} x={zone.x} y={zone.y} rotation={zone.rotation}>
                <Rect width={zone.width} height={zone.height} fill="white" cornerRadius={zone.cornerRadius || 0} />
                {qrImg ? (
                  <KonvaImage image={qrImg} width={zone.width} height={zone.height} />
                ) : (
                  <Rect width={zone.width} height={zone.height} fill="#f1f5f9" />
                )}
              </Group>
            );
          }

          if (zone.type === 'text' || (zone.isDynamic && zone.type !== 'PHOTO' && zone.type !== 'QRCODE')) {
            return (
              <Text
                key={zone.id}
                text={zone.isDynamic ? (guestName || (guestPhoto ? '' : 'VOTRE NOM')) : (zone.text || '')}
                x={zone.x}
                y={zone.y}
                width={zone.width}
                fontSize={zone.fontSize}
                fill={zone.fill || '#000000'}
                fontFamily={zone.fontFamily || 'Inter, sans-serif'}
                fontStyle={zone.fontStyle || 'normal'}
                rotation={zone.rotation || 0}
                align="center"
              />
            );
          }

          if (zone.isDynamic && zone.type === 'PHOTO') {
            const getClipFunc = (ctx) => {
              const { width, height, subType, cornerRadius } = zone;
              if (subType === 'circle') {
                ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2, false);
              } else if (subType === 'diamond') {
                ctx.moveTo(width / 2, 0); 
                ctx.lineTo(width, height / 2); 
                ctx.lineTo(width / 2, height); 
                ctx.lineTo(0, height / 2); 
                ctx.closePath();
              } else if (cornerRadius && cornerRadius > 0) {
                const r = Math.min(cornerRadius, width / 2, height / 2);
                ctx.beginPath();
                ctx.moveTo(r, 0);
                ctx.lineTo(width - r, 0);
                ctx.quadraticCurveTo(width, 0, width, r);
                ctx.lineTo(width, height - r);
                ctx.quadraticCurveTo(width, height, width - r, height);
                ctx.lineTo(r, height);
                ctx.quadraticCurveTo(0, height, 0, height - r);
                ctx.lineTo(0, r);
                ctx.quadraticCurveTo(0, 0, r, 0);
                ctx.closePath();
              } else {
                ctx.rect(0, 0, width, height);
              }
            };

            // Smart Aspect Ratio Fitting (Cover without distortion)
            const imgW = userImg ? userImg.width : 1;
            const imgH = userImg ? userImg.height : 1;
            const coverScale = Math.max(zone.width / imgW, zone.height / imgH);
            const baseWidth = imgW * coverScale;
            const baseHeight = imgH * coverScale;

            const initialX = (zone.width - baseWidth) / 2;
            const initialY = (zone.height - baseHeight) / 2;

            const currentX = initialX + (photoPos.x * zone.width);
            const currentY = initialY + (photoPos.y * zone.height);
            const renderWidth = baseWidth * photoZoom;
            const renderHeight = baseHeight * photoZoom;

            return (
              <Group
                key={zone.id}
                x={zone.x}
                y={zone.y}
                rotation={zone.rotation || 0}
                clipFunc={getClipFunc}
                width={zone.width}
                height={zone.height}
              >
                <Rect width={zone.width} height={zone.height} fill="#e2e8f0" />
                {userImg && (
                  <KonvaImage
                    image={userImg}
                    x={currentX}
                    y={currentY}
                    width={renderWidth}
                    height={renderHeight}
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
                      const offsetX = (e.target.x() - initialX) / zone.width;
                      const offsetY = (e.target.y() - initialY) / zone.height;
                      onPhotoDrag({ x: offsetX, y: offsetY });
                    }}
                  />
                )}
                {!userImg && (
                  <Text
                    text="📸"
                    fontSize={Math.min(zone.width, zone.height) * 0.35}
                    width={zone.width}
                    height={zone.height}
                    align="center"
                    verticalAlign="middle"
                    opacity={0.35}
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
      <div className="flex flex-col min-h-screen items-center justify-center bg-slate-950 p-8 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-[#3B52E8]/10 border border-[#3B52E8]/20 rounded-3xl flex items-center justify-center text-[#3B52E8] mb-6 shadow-2xl shadow-[#3B52E8]/20">
          <FiZap size={40} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight uppercase">Mode Démo temporairement indisponible</h1>
        <p className="text-slate-400 font-medium max-w-md leading-relaxed text-sm">
          Cette fonctionnalité de démonstration est en cours de mise à jour. <br />
          Revenez très bientôt pour générer vos invitations personnalisées !
        </p>
        <Button
          onClick={() => {
            setReturnLoading(true);
            window.location.href = '/';
          }}
          loading={returnLoading}
          className="mt-8 px-8 py-3.5 bg-gradient-to-r from-[#3B52E8] to-[#5569F5] text-white rounded-xl font-bold shadow-lg shadow-[#3B52E8]/30"
        >
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  const [event, setEvent] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [guestPhoto, setGuestPhoto] = useState(null);
  const [additionalData, setAdditionalData] = useState({});
  const [photoPos, setPhotoPos] = useState({ x: 0, y: 0 });
  const [photoZoom, setPhotoZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sharingPlatform, setSharingPlatform] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 380, height: 530 });
  const [qrCodeData, setQrCodeData] = useState(null);
  const [duplicateGuest, setDuplicateGuest] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const containerRef = useRef();
  const stageRef = useRef();

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    // Strictly prevent typing non-numeric/phone characters. Keep only digits, spaces, hyphens, and leading +
    const filtered = rawVal.replace(/(?!^\+)[^\d\s-]/g, '');
    setGuestPhone(filtered);
    if (phoneError) setPhoneError('');
  };

  const validatePhoneNum = (phone) => {
    if (!phone || !phone.trim()) {
      return { isValid: false, message: 'Le numéro de téléphone est obligatoire' };
    }
    const clean = phone.trim();
    // Default country CM (Cameroon +237)
    const parsed = parsePhoneNumberFromString(clean, 'CM');

    if (parsed && parsed.isValid()) {
      return {
        isValid: true,
        formatted: parsed.formatInternational(), // e.g. "+237 6 90 00 00 00"
        message: null
      };
    } else {
      return {
        isValid: false,
        formatted: clean,
        message: 'Numéro invalide (ex: 690 00 00 00 ou +237 690 00 00 00)'
      };
    }
  };

  useEffect(() => {
    QRCode.toDataURL(`PREVIEW_${shareCode}_${Date.now()}`, { margin: 1, color: { dark: '#0b1736', light: '#ffffff' } })
      .then(url => setQrCodeData(url))
      .catch(err => console.error(err));
  }, [shareCode]);

  useEffect(() => {
    fetch(`/api/invite/${shareCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) toast.error(data.error);
        else setEvent(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error('Erreur lors du chargement de l\'événement');
      });
  }, [shareCode]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && event) {
        const maxWidth = Math.min(containerRef.current.offsetWidth, 440);
        const rawZones = JSON.parse(event.zones || '{}');
        const ratio = (rawZones.designWidth && rawZones.designHeight)
          ? rawZones.designHeight / rawZones.designWidth
          : 1.4;
        setStageSize({ width: maxWidth, height: maxWidth * ratio });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [event]);

  const checkDuplicate = async (value) => {
    if (!value || value.length < 3) return;
    setIsChecking(true);
    try {
      const res = await fetch(`/api/invite/${shareCode}/check?value=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (data.exists) {
        setDuplicateGuest(data.guest);
        setShowDuplicateModal(true);
      }
    } catch (err) {
      console.error("Check duplicate error:", err);
    } finally {
      setIsChecking(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          ctx.filter = 'contrast(1.04) brightness(1.02) saturate(1.05)';
          ctx.drawImage(img, 0, 0, w, h);
          setGuestPhoto(canvas.toDataURL('image/jpeg', 0.92));
          setPhotoPos({ x: 0, y: 0 });
          setPhotoZoom(1);
          toast.success('Photo chargée avec succès !');
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    if (!guestName && !guestPhoto) {
      toast.error('Veuillez saisir votre nom complet');
      return false;
    }
    
    const phoneRes = validatePhoneNum(guestPhone);
    if (!phoneRes.isValid) {
      setPhoneError(phoneRes.message);
      toast.error(phoneRes.message);
      return false;
    }

    setGuestPhone(phoneRes.formatted);
    setPhoneError('');

    if (event) {
      const config = JSON.parse(event.customFields || '[]');
      for (const field of config) {
        if (field.required && !additionalData[field.name]) {
          toast.error(`Le champ "${field.label}" est obligatoire`);
          return false;
        }
      }
    }
    return true;
  };

  const handleGoToStep2 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleGoToStep3 = () => {
    if (!validateStep1()) return;
    setCurrentStep(3);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep1()) return;

    setSharingPlatform('download');
    setDuplicateGuest(null);

    try {
      // If already on step 3, directly download the generated badge
      if (currentStep === 3 && stageRef.current) {
        const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2.5 });
        const link = document.createElement('a');
        link.download = `invitation_${event.name.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
        toast.success('Invitation téléchargée avec succès !');
        setSharingPlatform(null);
        return;
      }

      const tempId = `GUEST_${Math.random().toString(36).substring(2, 11)}`;
      const realQrUrl = await QRCode.toDataURL(tempId, { margin: 1, color: { dark: '#0b1736', light: '#ffffff' } });
      setQrCodeData(realQrUrl);

      await new Promise(r => setTimeout(r, 120));

      const dataUrl = stageRef.current ? stageRef.current.toDataURL({ pixelRatio: 2.5 }) : '';

      const res = await fetch(`/api/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tempId,
          eventId: event.id,
          name: guestName,
          phone: guestPhone,
          photoUrl: guestPhoto,
          additionalData: JSON.stringify(additionalData),
          saveToCloud: false
        }),
      });

      const resData = await res.json();

      if (res.ok) {
        if (dataUrl) {
          const link = document.createElement('a');
          link.download = `invitation_${event.name.replace(/\s+/g, '_')}.png`;
          link.href = dataUrl;
          link.click();
        }
        setCurrentStep(3);
        toast.success('Invitation créée et téléchargée avec succès !');
      } else if (res.status === 409 && resData.error === 'DOUBLON') {
        setDuplicateGuest(resData.guest);
        toast.error(resData.message || 'Vous êtes déjà inscrit à cet événement');
      } else {
        toast.error(resData.error || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la génération');
    } finally {
      setSharingPlatform(null);
    }
  };

  const handleShare = async (platform) => {
    setSharingPlatform(platform);
    setDuplicateGuest(null);

    try {
      // If not yet on step 3, register the guest first
      if (currentStep !== 3) {
        if (!validateStep1()) {
          setSharingPlatform(null);
          return;
        }

        const tempId = `GUEST_${Math.random().toString(36).substring(2, 11)}`;
        const realQrUrl = await QRCode.toDataURL(tempId, { margin: 1, color: { dark: '#0b1736', light: '#ffffff' } });
        setQrCodeData(realQrUrl);

        await new Promise(r => setTimeout(r, 120));

        let stageUrl = '';
        if (stageRef.current) {
          stageUrl = stageRef.current.toDataURL({ pixelRatio: 2.5 });
        }

        const res = await fetch(`/api/guests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: tempId,
            eventId: event.id,
            name: guestName,
            phone: guestPhone,
            photoUrl: guestPhoto,
            additionalData: JSON.stringify(additionalData),
            generatedImageUrl: stageUrl,
            saveToCloud: true
          }),
        });

        const resData = await res.json();

        if (!res.ok) {
          if (res.status === 409 && resData.error === 'DOUBLON') {
            setDuplicateGuest(resData.guest);
            toast.error(resData.message || 'Vous êtes déjà inscrit');
            setSharingPlatform(null);
            return;
          }
          throw new Error(resData.error);
        }

        setCurrentStep(3);
      }

      // Short invitation text with link for other guests
      const shareUrl = window.location.href;
      const shareText = `🎉 Bonjour ! Je t'invite à l'événement "${event.name}".\n\n👉 Génère ton Pass d'accès officiel avec QR Code ici :\n${shareUrl}`;

      // Retrieve image file from canvas stage or generated URL for multi-file share
      let imageFile = null;
      let dataUrl = '';
      if (stageRef.current) {
        try {
          dataUrl = stageRef.current.toDataURL({ pixelRatio: 2.5 });
        } catch (err) {
          console.error('Error rendering stage to dataURL:', err);
        }
      }

      const sourceUrl = dataUrl || duplicateGuest?.generatedImageUrl;
      if (sourceUrl) {
        try {
          const res = await fetch(sourceUrl);
          const blob = await res.blob();
          const safeName = (event?.name || 'invitation').replace(/[^a-zA-Z0-9_\-]/g, '_');
          imageFile = new File([blob], `invitation_${safeName}.png`, { type: 'image/png' });
        } catch (err) {
          console.error('Error creating image file:', err);
        }
      }

      const canShareFiles = !!(imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] }));

      // Native Web Share API with files support (Mobile Safari, Chrome Android, etc.)
      if (canShareFiles) {
        try {
          await navigator.share({
            title: `Invitation - ${event.name}`,
            text: shareText,
            url: shareUrl,
            files: [imageFile],
          });
          toast.success('Invitation, texte et image partagés !');
          return;
        } catch (e) {
          if (e.name === 'AbortError') return;
          console.warn('Native file share failed or cancelled, using fallback:', e);
        }
      }

      // Fallback: Automatic download of PNG image + copy text & URL to clipboard
      if (sourceUrl) {
        const link = document.createElement('a');
        link.download = `invitation_${(event.name || 'pass').replace(/\s+/g, '_')}.png`;
        link.href = sourceUrl;
        link.click();
      }

      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareText);
        } catch (clipErr) {
          console.error('Clipboard copy error:', clipErr);
        }
      }

      if (platform === 'whatsapp') {
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        window.open(waUrl, '_blank');
        toast.success('Image téléchargée & texte copié ! Joignez l\'image dans votre message WhatsApp.');
      } else if (platform === 'facebook') {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        window.open(fbUrl, '_blank', 'width=600,height=500');
        toast.success('Image téléchargée & lien prêt à être partagé sur Facebook !');
      } else {
        // platform === 'all'
        if (navigator.share) {
          try {
            await navigator.share({
              title: `Invitation - ${event.name}`,
              text: shareText,
              url: shareUrl,
            });
            toast.success('Invitation et lien partagés avec succès !');
          } catch (e) {
            if (e.name !== 'AbortError') {
              toast.success('Image téléchargée & message copié dans le presse-papier !');
            }
          }
        } else {
          toast.success('Image téléchargée & message copié dans le presse-papier !');
        }
      }

    } catch (error) {
      console.error('Share error:', error);
      toast.error('Erreur lors du partage');
    } finally {
      setSharingPlatform(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#3B52E8]/10 border border-[#3B52E8]/20 flex items-center justify-center mx-auto text-[#3B52E8]">
            <Loader className="!h-6 !w-6" color="primary" />
          </div>
          <p className="text-slate-600 font-bold text-sm animate-pulse">Préparation de votre Pass officiel...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mb-4 shadow-sm">
          <FiAlertTriangle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Événement introuvable</h2>
        <p className="text-slate-500 text-sm max-w-sm mb-6">Le lien d'invitation que vous utilisez semble expiré ou invalide.</p>
        <Link href="/" className="px-6 py-3 bg-[#0B1736] text-white rounded-xl font-semibold hover:bg-[#111C44] transition-all text-sm shadow-md">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#3B52E8] selection:text-white relative overflow-x-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-[#3B52E8]/6 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-[#FF6500]/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Modern High-End Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0B1736] to-[#3B52E8] flex items-center justify-center text-white font-black text-base shadow-md shadow-[#3B52E8]/20">
              V
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-none">ThaborSolution Pass</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Invitation & Badge Officiel</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Inscriptions Ouvertes
            </span>
          </div>
        </div>
      </header>

      {/* Duplicate Guest Modal */}
      <Modal
        visible={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        outerClassName="max-w-md"
        containerClassName="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl"
      >
        <div className="text-center pt-2">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-lg shadow-amber-500/10">
            <FiAlertTriangle size={28} className="stroke-[2.2]" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Déjà Inscrit(e) !
          </h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed px-2">
            Un enregistrement au nom de <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">"{duplicateGuest?.name}"</strong> est déjà enregistré avec ces coordonnées.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            {duplicateGuest?.generatedImageUrl ? (
              <a
                href={duplicateGuest.generatedImageUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiDownload size={16} />
                <span>Télécharger mon invitation</span>
              </a>
            ) : (
              <p className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 italic border border-slate-100">
                L'invitation générée précédemment n'est pas sauvegardée sur le serveur.
              </p>
            )}
            <button
              onClick={() => setShowDuplicateModal(false)}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>

      {/* Checking Loader Overlay */}
      {isChecking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center max-w-xs w-full mx-4 text-center">
            <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-[#3B52E8]/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-[#3B52E8] border-t-transparent rounded-full animate-spin" />
              <FiZap className="text-[#3B52E8] animate-pulse" size={20} />
            </div>
            <p className="text-slate-900 font-bold text-base mb-1">Vérification...</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Vérification des coordonnées en cours...
            </p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Compact Low-Height Event Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0B1736] via-[#111C44] to-[#3B52E8] text-white shadow-lg shadow-[#0B1736]/10 relative overflow-hidden px-4 py-3 sm:px-5 sm:py-3.5 space-y-2.5">
          {/* Top Line: Badges + Title + Date */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-[10px] font-semibold backdrop-blur-md">
                <FiStar size={11} className="text-amber-300 fill-amber-300" /> Invitation Officielle
              </span>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                {event.name}
              </h1>
              {event.isPaid && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-[10px] font-bold">
                  <FiShield size={11} /> {event.price} FCFA
                </span>
              )}
            </div>

            {event.startDate && (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 text-[11px] shrink-0 font-medium">
                <FiCalendar className="text-indigo-200" size={13} />
                <span>{new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Integrated Ultra-Compact Stepper Bar */}
          <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2 relative z-10">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-xl text-[11px] font-bold transition-all w-full sm:w-auto justify-center cursor-pointer",
                currentStep === 1 
                  ? "bg-white text-[#0B1736] shadow-md font-extrabold" 
                  : "bg-white/10 hover:bg-white/20 text-white/90 border border-white/10"
              )}
            >
              <span className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black",
                currentStep === 1 ? "bg-[#3B52E8] text-white" : "bg-white/20 text-white"
              )}>1</span>
              <span>1. Coordonnées</span>
            </button>

            <div className="hidden sm:block h-0.5 w-6 bg-white/20 rounded-full shrink-0" />

            <button
              type="button"
              onClick={handleGoToStep2}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-xl text-[11px] font-bold transition-all w-full sm:w-auto justify-center cursor-pointer",
                currentStep === 2 
                  ? "bg-white text-[#0B1736] shadow-md font-extrabold" 
                  : "bg-white/10 hover:bg-white/20 text-white/90 border border-white/10"
              )}
            >
              <span className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black",
                currentStep === 2 ? "bg-[#3B52E8] text-white" : "bg-white/20 text-white"
              )}>2</span>
              <span>2. Photo & Recadrage</span>
            </button>

            <div className="hidden sm:block h-0.5 w-6 bg-white/20 rounded-full shrink-0" />

            <button
              type="button"
              onClick={handleGoToStep3}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-xl text-[11px] font-bold transition-all w-full sm:w-auto justify-center cursor-pointer",
                currentStep === 3 
                  ? "bg-white text-[#0B1736] shadow-md font-extrabold" 
                  : "bg-white/10 hover:bg-white/20 text-white/90 border border-white/10"
              )}
            >
              <span className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black",
                currentStep === 3 ? "bg-[#3B52E8] text-white" : "bg-white/20 text-white"
              )}>3</span>
              <span>3. Pass & Partage</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Pro Live Badge Preview Studio */}
          <div className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-24 z-20">
            <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xl shadow-slate-900/5 flex flex-col items-center space-y-4">
              <div className="w-full flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Aperçu du Pass Live
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100/90 px-2.5 py-1 rounded-full border border-slate-200 font-mono">
                  {stageSize.width} × {Math.round(stageSize.height)} px
                </span>
              </div>

              {/* Stage Container */}
              <div ref={containerRef} className="w-full flex justify-center items-center overflow-hidden rounded-2xl bg-slate-100/80 p-2 border border-slate-200/80 shadow-inner relative group">
                <PosterRenderer
                  event={event}
                  guestName={guestName}
                  guestPhoto={guestPhoto}
                  photoPos={photoPos}
                  photoZoom={photoZoom}
                  onPhotoDrag={setPhotoPos}
                  stageRef={stageRef}
                  stageSize={stageSize}
                  qrCodeData={qrCodeData}
                />
              </div>

              {/* Interactive Helper Hint */}
              <p className="text-[11px] text-slate-500 text-center font-medium flex items-center justify-center gap-1.5 px-2">
                <FiInfo className="text-[#3B52E8] shrink-0" size={13} />
                <span>Modifications synchronisées en temps réel sur le Pass</span>
              </p>

              {/* Pro Photo Adjustment Bar */}
              {guestPhoto && (
                <div className="w-full p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <FiZoomIn size={14} className="text-[#3B52E8]" /> Échelle du portrait
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPhotoZoom(prev => Math.max(0.6, parseFloat((prev - 0.1).toFixed(2))))}
                        className="w-7 h-7 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 flex items-center justify-center text-xs cursor-pointer shadow-xs"
                      >
                        -
                      </button>
                      <span className="font-bold text-[#3B52E8] bg-[#3B52E8]/10 px-2.5 py-1 rounded-lg text-[11px] font-mono">
                        {Math.round(photoZoom * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setPhotoZoom(prev => Math.min(2.5, parseFloat((prev + 0.1).toFixed(2))))}
                        className="w-7 h-7 rounded-xl bg-white hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 flex items-center justify-center text-xs cursor-pointer shadow-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={photoZoom}
                    onChange={(e) => setPhotoZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#3B52E8]"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/80">
                    <span className="flex items-center gap-1">
                      <FiMove size={12} className="text-[#3B52E8]" /> Glissez la photo pour ajuster
                    </span>
                    <button
                      type="button"
                      onClick={() => { setPhotoPos({ x: 0, y: 0 }); setPhotoZoom(1); }}
                      className="text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <FiRefreshCw size={11} /> Réinitialiser
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Conversational & Human Guided Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5">
            {/* STEP 1: VOS COORDONNÉES */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Friendly Organizer Greeting Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-blue-50/60 to-indigo-50/90 border border-indigo-100 text-indigo-950 flex items-start gap-3.5 text-xs">
                  <div className="w-9 h-9 rounded-2xl bg-[#3B52E8] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#3B52E8]/20 font-bold text-base">
                    👋
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-sm">Faisons connaissance !</h4>
                    <p className="text-slate-600 leading-relaxed text-[12px]">
                      Entrez vos coordonnées. Votre nom et votre QR Code sécurisé seront générés automatiquement sur votre carte d'invitation.
                    </p>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FiUser className="text-[#3B52E8]" /> Vos Informations Personnelles
                  </h2>
                </div>

                {duplicateGuest && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                    <div className="flex items-start gap-3">
                      <FiAlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-amber-900">Vous êtes déjà inscrit(e) !</h4>
                        <p className="text-xs text-amber-800 mt-0.5">
                          Un enregistrement au nom de <strong className="text-slate-900">{duplicateGuest.name}</strong> est déjà enregistré.
                        </p>
                        {duplicateGuest.generatedImageUrl && (
                          <a
                            href={duplicateGuest.generatedImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-700 transition-all shadow-md"
                          >
                            <FiDownload size={14} /> Télécharger mon invitation existante
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Comment devez-vous apparaître sur l'invitation ? <span className="text-rose-500">*</span></span>
                    <span className="text-[10.5px] font-normal text-slate-400">(Nom & Prénom)</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="ex: Marie-Claire Dupont"
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#3B52E8] focus:ring-4 focus:ring-[#3B52E8]/10 transition-all"
                    />
                  </div>
                </div>

                {/* Phone Input with Country Flag */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Votre numéro de Téléphone <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/80">🇨🇲 Cameroun (+237)</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={handlePhoneChange}
                      onBlur={(e) => {
                        if (guestPhone) {
                          const valRes = validatePhoneNum(guestPhone);
                          if (!valRes.isValid) {
                            setPhoneError(valRes.message);
                          } else {
                            setGuestPhone(valRes.formatted);
                            setPhoneError('');
                            checkDuplicate(valRes.formatted);
                          }
                        }
                      }}
                      placeholder="ex: 690 00 00 00 ou +237 690 00 00 00"
                      required
                      className={cn(
                        "w-full bg-slate-50/80 border rounded-2xl py-3.5 pl-11 pr-10 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all",
                        phoneError 
                          ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10 text-rose-900" 
                          : "border-slate-200 focus:border-[#3B52E8] focus:ring-[#3B52E8]/10"
                      )}
                    />
                    {isChecking && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#3B52E8] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {phoneError ? (
                    <p className="text-[11.5px] font-semibold text-rose-600 flex items-center gap-1.5 pt-0.5">
                      <FiAlertTriangle size={13} /> {phoneError}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Seuls les chiffres et le préfixe international (+237...) sont autorisés.
                    </p>
                  )}
                </div>

                {/* Dynamic Custom Fields */}
                {JSON.parse(event.customFields || '[]').map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-xs font-bold text-slate-800">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>

                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={additionalData[field.name] || ''}
                        onChange={(e) => setAdditionalData({ ...additionalData, [field.name]: e.target.value })}
                        onBlur={(e) => event?.uniquenessField === field.name && checkDuplicate(e.target.value)}
                        placeholder={`Saisissez ${field.label.toLowerCase()}`}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#3B52E8] focus:ring-4 focus:ring-[#3B52E8]/10 transition-all"
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={additionalData[field.name] || ''}
                        onChange={(e) => setAdditionalData({ ...additionalData, [field.name]: e.target.value })}
                        onBlur={(e) => event?.uniquenessField === field.name && checkDuplicate(e.target.value)}
                        placeholder={`Saisissez ${field.label.toLowerCase()}`}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#3B52E8] focus:ring-4 focus:ring-[#3B52E8]/10 transition-all"
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        value={additionalData[field.name] || ''}
                        onChange={(e) => setAdditionalData({ ...additionalData, [field.name]: e.target.value })}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#3B52E8] transition-all"
                      >
                        <option value="">Sélectionner une option</option>
                        {field.options?.split(',').map((opt) => (
                          <option key={opt} value={opt.trim()}>{opt.trim()}</option>
                        ))}
                      </select>
                    )}

                    {field.type === 'checkbox' && (
                      <label className="flex items-center gap-3 p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-all">
                        <input
                          type="checkbox"
                          checked={additionalData[field.name] || false}
                          onChange={(e) => setAdditionalData({ ...additionalData, [field.name]: e.target.checked })}
                          className="w-4 h-4 rounded text-[#3B52E8] focus:ring-[#3B52E8] accent-[#3B52E8]"
                        />
                        <span className="text-xs font-semibold text-slate-800">{field.label}</span>
                      </label>
                    )}
                  </div>
                ))}

                {/* Step 1 CTA */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleGoToStep2}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#3B52E8] via-[#4F6BFF] to-[#3B52E8] hover:opacity-95 active:scale-[0.99] text-white font-black text-sm shadow-xl shadow-[#3B52E8]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continuer vers la photo de profil</span>
                    <FiArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PHOTO DE PROFIL & CADRAGE */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Friendly Photo Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-amber-50/90 border border-amber-100 text-amber-950 flex items-start gap-3.5 text-xs">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 font-bold text-base">
                    📸
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-sm">Ajoutez votre portrait</h4>
                    <p className="text-slate-600 leading-relaxed text-[12px]">
                      Téléchargez une photo. Vous pourrez <strong>glisser la photo avec la souris</strong> sur l'aperçu du badge à gauche pour l'ajuster parfaitement.
                    </p>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FiCamera className="text-[#3B52E8]" /> Importation & Recadrage
                  </h2>
                </div>

                {/* Photo Dropzone Card */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800">Votre photo pour le badge VIP</label>
                  <label className={cn(
                    "flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden group",
                    guestPhoto 
                      ? "border-emerald-500 bg-emerald-50/40" 
                      : "border-slate-200 hover:border-[#3B52E8] bg-slate-50/70 hover:bg-[#3B52E8]/5"
                  )}>
                    {guestPhoto ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <img 
                            src={guestPhoto} 
                            alt="Aperçu" 
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md" 
                          />
                          <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                            <FiCheckCircle size={15} />
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                          <FiCheckCircle className="text-emerald-600" /> Photo ajoutée avec succès !
                        </span>
                        <span className="text-[11px] text-slate-500 group-hover:text-[#3B52E8] font-semibold transition-colors">
                          Cliquez ici pour changer de photo
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-[#3B52E8] group-hover:border-[#3B52E8]/40 transition-all shadow-sm">
                          <FiCamera size={26} />
                        </div>
                        <div className="text-xs font-extrabold text-slate-800 group-hover:text-[#3B52E8] transition-colors">
                          Cliquez ou déposez votre photo ici
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Formats : JPG, PNG (Taille recommandée jusqu'à 5Mo)
                        </span>
                      </div>
                    )}
                    <input type="file" onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                  </label>
                </div>

                {/* Step 2 Buttons */}
                <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-1/3 py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200/80"
                  >
                    <FiArrowLeft size={16} />
                    <span>Retour aux infos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoToStep3}
                    className="w-full sm:w-2/3 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#3B52E8] via-[#4F6BFF] to-[#3B52E8] hover:opacity-95 active:scale-[0.99] text-white font-black text-sm shadow-xl shadow-[#3B52E8]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Valider mon Pass et Télécharger</span>
                    <FiArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: OBTENIR MON PASS & PARTAGER */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Celebration Banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-emerald-50/90 border border-emerald-200/80 text-emerald-950 flex items-start gap-3.5 text-xs">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20 font-bold text-base">
                    🎉
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-sm">Votre Pass Officiel est prêt !</h4>
                    <p className="text-slate-600 leading-relaxed text-[12px]">
                      Votre carte d'invitation avec QR Code sécurisé a été générée. Téléchargez-la immédiatement ou partagez-la sur WhatsApp & Facebook.
                    </p>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-600" /> Télécharger mon Pass VIP
                  </h2>
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Invité(e) :</span>
                    <strong className="text-slate-900 font-extrabold">{guestName || 'Non spécifié'}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Téléphone :</span>
                    <strong className="text-slate-900 font-mono font-bold">{guestPhone}</strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Photo intégrée :</span>
                    <span className={cn("font-bold px-2.5 py-0.5 rounded-full text-[11px]", guestPhoto ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700")}>
                      {guestPhoto ? '✓ Photo validée' : 'Sans photo'}
                    </span>
                  </div>
                </div>

                {/* Payment Section (If Paid Event) */}
                {event.isPaid && (
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-slate-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Frais d'inscription</span>
                      <span className="text-lg font-black text-amber-700">{event.price} FCFA</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Veuillez effectuer le règlement via Mobile Money au numéro : <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200 font-mono">{event.paymentNumber || 'N/A'}</strong>
                    </p>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                        Référence de transaction <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="N° de référence du paiement"
                        required
                        className="w-full bg-white border border-amber-200 rounded-xl py-2.5 px-3.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3.5 pt-1">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={sharingPlatform !== null}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#3B52E8] via-[#4F6BFF] to-[#FF6500] hover:opacity-95 active:scale-[0.99] text-white font-black text-sm shadow-xl shadow-[#3B52E8]/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    {sharingPlatform === 'download' ? (
                      <>
                        <Loader className="!h-5 !w-5 !text-white" />
                        <span>Génération Haute Définition...</span>
                      </>
                    ) : (
                      <>
                        <FiDownload size={19} />
                        <span>Télécharger mon Pass Officiel (PNG HD)</span>
                      </>
                    )}
                  </button>

                  <div className="relative py-2 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                    <span className="relative bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Ou partager avec vos proches</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleShare('whatsapp')}
                      disabled={sharingPlatform !== null}
                      className="py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-xs shadow-lg shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {sharingPlatform === 'whatsapp' ? <Loader className="!h-4 !w-4 !text-white" /> : <><FaWhatsapp size={18} /> <span>WhatsApp</span></>}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare('facebook')}
                      disabled={sharingPlatform !== null}
                      className="py-3.5 px-4 bg-[#1877F2] hover:bg-[#1464cc] text-white rounded-2xl font-bold text-xs shadow-lg shadow-[#1877F2]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {sharingPlatform === 'facebook' ? <Loader className="!h-4 !w-4 !text-white" /> : <><FaFacebook size={18} /> <span>Facebook</span></>}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleShare('all')}
                    disabled={sharingPlatform !== null}
                    className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200/80 disabled:opacity-50"
                  >
                    {sharingPlatform === 'all' ? <Loader className="!h-4 !w-4 !text-white" /> : <><FiShare2 size={16} /> <span>Autres options de partage</span></>}
                  </button>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FiArrowLeft size={14} />
                      <span>Modifier la photo ou les informations</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} ThaborSolution Pass — Solution d'invitation & contrôle d'accès</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900 transition-colors">Accueil</Link>
            <Link href="/auth/login" className="hover:text-slate-900 transition-colors">Espace Organisateur</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
