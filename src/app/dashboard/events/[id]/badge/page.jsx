'use client';

import React, { useState, useRef, useEffect, use } from 'react';
import PosterEditor from '@/components/canvas/PosterEditor';
import { FiPrinter, FiSettings, FiArrowLeft, FiChevronRight, FiGrid, FiDownload, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import AppLink from '@/components/AppLink';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';
import { Stage, Layer, Image as KonvaImage, Text, Group, Rect } from 'react-konva';
import useImage from 'use-image';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import Button from '@/components/ui/Button';

// Hidden renderer for a single badge
const BadgeRenderer = ({ event, guest, qrCode, onRendered }) => {
  const template = event.badgeTemplate;
  
  let elements = [];
  let designWidth = 800;
  let designHeight = 1120;

  try {
    const zonesStr = template?.zones || '{"elements": []}';
    const rawZones = JSON.parse(zonesStr);
    elements = Array.isArray(rawZones) ? rawZones : (rawZones.elements || []);
    designWidth = rawZones.designWidth || 800;
    designHeight = rawZones.designHeight || 1120;
  } catch (e) {
    console.error("Error parsing zones", e);
  }

  const bgUrl = template?.backgroundImageUrl || event.backgroundImageUrl || '';
  const [bgImg, bgStatus] = useImage(bgUrl, 'anonymous');
  const [userImg] = useImage(guest.photoUrl || '', 'anonymous');
  const [qrImg] = useImage(qrCode || '', 'anonymous');
  const stageRef = useRef();

  // Trigger rendering even if background fails but we waited enough
  useEffect(() => {
    const timer = setTimeout(() => {
      if (stageRef.current) {
        onRendered(stageRef.current.toDataURL({ pixelRatio: 2 }));
      }
    }, 1500); // Wait longer to ensure everything is ready
    return () => clearTimeout(timer);
  }, [onRendered]);

  const additionalData = JSON.parse(guest.additionalData || '{}');

  return (
    <div className="hidden">
      <Stage width={designWidth} height={designHeight} ref={stageRef}>
        <Layer>
          {/* Fallback background if image is missing or loading */}
          <Rect width={designWidth} height={designHeight} fill="white" />
          {bgImg && <KonvaImage image={bgImg} width={designWidth} height={designHeight} />}
          
          {elements.map((el) => {
             // Dynamic QR Code
             if (el.isDynamic && el.type === 'QRCODE') {
                return (
                  <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation}>
                    <Rect width={el.width} height={el.height} fill="white" />
                    {qrImg && <KonvaImage image={qrImg} width={el.width} height={el.height} />}
                  </Group>
                );
             }

             // Text (Static or Dynamic)
             if (el.type === 'text' || (el.isDynamic && (el.type === 'NAME' || el.type === 'FIELD'))) {
                let text = el.text;
                if (el.isDynamic) {
                  if (el.type === 'NAME') text = guest.name;
                  if (el.type === 'FIELD' && el.fieldKey) {
                    text = additionalData[el.fieldKey] || el.text || '-';
                  }
                }
                return (
                  <Text
                    key={el.id}
                    text={text}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    fontSize={el.fontSize}
                    fill={el.fill}
                    fontFamily={el.fontFamily}
                    fontStyle={el.fontStyle}
                    align="center"
                    rotation={el.rotation}
                  />
                );
             }

             // Dynamic Photo
             if (el.isDynamic && el.type === 'PHOTO' && userImg) {
                return <KonvaImage key={el.id} image={userImg} x={el.x} y={el.y} width={el.width} height={el.height} rotation={el.rotation} />;
             }

             // Static Shapes
             if (el.type === 'rect') return <Rect key={el.id} {...el} />;
             if (el.type === 'circle') return <Circle key={el.id} {...el} />;
             if (el.type === 'star') return <Star key={el.id} {...el} />;
             if (el.type === 'polygon') return <RegularPolygon key={el.id} {...el} />;
             if (el.type === 'line') return <Line key={el.id} {...el} />;

             return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default function BadgeDesignPage({ params }) {
  const { id } = use(params);
  const [event, setEvent] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [guests, setGuests] = useState([]);

  // Generation states
  const [badgesPerPage, setBadgesPerPage] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [renderQueue, setRenderQueue] = useState([]);
  const [renderedImages, setRenderedImages] = useState({});
  const [currentGuestIdx, setCurrentGuestIdx] = useState(-1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, tempRes, guestsRes] = await Promise.all([
          fetch(`/api/events/${id}`),
          fetch(`/api/events/${id}/badge-template`),
          fetch(`/api/events/${id}/guests`)
        ]);
        
        const [evData, tempData, guestsData] = await Promise.all([
          evRes.json(),
          tempRes.json(),
          guestsRes.json()
        ]);

        if (evData.error) throw new Error(evData.error);
        setEvent(evData);
        setTemplate(tempData);
        setGuests(guestsData);
      } catch (err) {
        toast.error("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async (designData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${id}/badge-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backgroundImageUrl: designData.backgroundImageUrl,
          zones: designData.zones, // Corrected from designData.elements
          designWidth: designData.designWidth,
          designHeight: designData.designHeight
        }),
      });

      if (res.ok) {
        toast.success("Design enregistré ! Préparation de l'impression...");
        const updated = await res.json();
        setTemplate(updated);
        // Automatically start generation
        startGeneration(updated);
      } else {
        throw new Error("Erreur lors de l'enregistrement");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startGeneration = (latestTemplate) => {
    if (guests.length === 0) return toast.error("Aucun invité à traiter");
    setIsGenerating(true);
    setProgress(0);
    setRenderedImages({});
    setCurrentGuestIdx(0);
  };

  useEffect(() => {
    if (isGenerating && currentGuestIdx >= 0 && currentGuestIdx < guests.length) {
      const generateQR = async () => {
        try {
          const qr = await QRCode.toDataURL(guests[currentGuestIdx].id, { margin: 1 });
          setRenderQueue([{ guest: guests[currentGuestIdx], qr }]);
        } catch (e) {
          console.error(e);
        }
      };
      generateQR();
    } else if (isGenerating && currentGuestIdx >= guests.length) {
      createPDF();
    }
  }, [isGenerating, currentGuestIdx]);

  const onBadgeRendered = (dataUrl) => {
    setRenderedImages(prev => ({ ...prev, [guests[currentGuestIdx].id]: dataUrl }));
    setProgress(Math.round(((currentGuestIdx + 1) / guests.length) * 100));
    setRenderQueue([]);
    setCurrentGuestIdx(prev => prev + 1);
  };

  const createPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    const cols = badgesPerPage <= 2 ? 1 : 2;
    const rows = Math.ceil(badgesPerPage / cols);
    const badgeWidth = availableWidth / cols;
    const badgeHeight = availableHeight / rows;

    let currentBadgeInPage = 0;
    guests.forEach((guest) => {
      const imgData = renderedImages[guest.id];
      if (!imgData) return;
      if (currentBadgeInPage >= badgesPerPage) {
        doc.addPage();
        currentBadgeInPage = 0;
      }
      const col = currentBadgeInPage % cols;
      const row = Math.floor(currentBadgeInPage / cols);
      const x = margin + (col * badgeWidth);
      const y = margin + (row * badgeHeight);
      doc.addImage(imgData, 'PNG', x + 2, y + 2, badgeWidth - 4, badgeHeight - 4);
      doc.setDrawColor(230);
      doc.rect(x + 1, y + 1, badgeWidth - 2, badgeHeight - 2);
      currentBadgeInPage++;
    });

    doc.save(`badges_${event.name.replace(/\s+/g, '_')}.pdf`);
    setIsGenerating(false);
    setCurrentGuestIdx(-1);
    toast.success("PDF généré avec succès !");
  };

  if (loading) return <div className="h-[70vh] flex items-center justify-center"><Loader /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <AppLink 
             href={`/dashboard/events/${id}`} 
             className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-lg transition-all border border-gray-100"
           >
              <FiArrowLeft size={24} />
           </AppLink>
           <div>
              <div className="flex items-center gap-3 mb-1">
                 <h2 className="text-3xl font-black text-gray-900 tracking-tight">Design des Badges</h2>
                 <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full tracking-widest">Éditeur Pro</span>
              </div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">{event?.name}</p>
           </div>
        </div>
        
        {/* Real-time Settings */}
        <div className="flex items-center gap-4 p-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-100">
              <FiGrid className="text-gray-400" />
              <select 
                value={badgesPerPage}
                onChange={(e) => setBadgesPerPage(parseInt(e.target.value))}
                className="bg-transparent text-xs font-black text-gray-900 uppercase tracking-widest outline-none"
              >
                <option value="1">1 / Page</option>
                <option value="2">2 / Page</option>
                <option value="4">4 / Page</option>
                <option value="8">8 / Page</option>
                <option value="10">10 / Page</option>
              </select>
           </div>
           <div className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              A4 Portrait
           </div>
        </div>
      </div>

      {/* Generation Progress Bar (Fixed at top when active) */}
      {isGenerating && (
         <div className="bg-gray-900 text-white p-6 rounded-[32px] shadow-2xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <div>
                     <h4 className="text-sm font-black uppercase tracking-widest">Génération du PDF en cours...</h4>
                     <p className="text-[10px] text-gray-400 font-bold uppercase">Traitement de l'invité {currentGuestIdx + 1} sur {guests.length}</p>
                  </div>
               </div>
               <span className="text-xl font-black text-primary">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
         </div>
      )}

      {/* Main Editor Wrapper */}
      <div className="h-[850px] relative bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
        <PosterEditor 
          initialData={template ? {
            backgroundImageUrl: template.backgroundImageUrl,
            elements: (typeof template.zones === 'string' ? (JSON.parse(template.zones).elements || JSON.parse(template.zones)) : []),
            designWidth: (typeof template.zones === 'string' ? JSON.parse(template.zones).designWidth : 800),
            designHeight: (typeof template.zones === 'string' ? JSON.parse(template.zones).designHeight : 1120)
          } : null}
          onSave={handleSave} 
          loading={saving || isGenerating}
          customFields={JSON.parse(event?.customFields || '[]')}
          saveText={isGenerating ? "Impression..." : "Enregistrer & Imprimer"}
        />
      </div>

      {/* Hidden Renderers */}
      {renderQueue.map(({ guest, qr }) => (
        <BadgeRenderer 
          key={guest.id} 
          event={{...event, badgeTemplate: template}} 
          guest={guest} 
          qrCode={qr} 
          onRendered={onBadgeRendered} 
        />
      ))}
    </div>
  );
}
