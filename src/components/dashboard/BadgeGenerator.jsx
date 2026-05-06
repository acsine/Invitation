'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiPrinter, FiUpload, FiDownload, FiX, FiCheck, FiSettings, FiGrid, FiImage } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { Stage, Layer, Image as KonvaImage, Text, Group, Rect } from 'react-konva';
import useImage from 'use-image';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

// Hidden renderer for a single badge
const BadgeRenderer = ({ event, guest, design, qrCode, onRendered }) => {
  const template = event.badgeTemplate;
  const rawZones = JSON.parse(template?.zones || '{"elements": []}');
  const elements = rawZones.elements || [];
  const designWidth = rawZones.designWidth || 800;
  const designHeight = rawZones.designHeight || 1120;

  const [bgImg] = useImage(design.background || template?.backgroundImageUrl || event.backgroundImageUrl || '', 'anonymous');
  const [userImg] = useImage(guest.photoUrl || '', 'anonymous');
  const [qrImg] = useImage(qrCode || '', 'anonymous');
  const stageRef = useRef();

  useEffect(() => {
    if (bgImg && stageRef.current) {
      const timer = setTimeout(() => {
        if (stageRef.current) {
          onRendered(stageRef.current.toDataURL({ pixelRatio: 2 }));
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [bgImg, userImg, qrImg]);

  const additionalData = JSON.parse(guest.additionalData || '{}');

  return (
    <div className="hidden">
      <Stage width={designWidth} height={designHeight} ref={stageRef}>
        <Layer>
          {bgImg && <KonvaImage image={bgImg} width={designWidth} height={designHeight} />}
          {elements.map((el) => {
             if (el.isDynamic && el.type === 'QRCODE') {
                return (
                  <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation}>
                    <Rect width={el.width} height={el.height} fill="white" />
                    {qrImg && <KonvaImage image={qrImg} width={el.width} height={el.height} />}
                  </Group>
                );
             }
             if (el.type === 'text' || (el.isDynamic && (el.type === 'NAME' || el.type === 'FIELD'))) {
                let text = el.text;
                if (el.isDynamic) {
                  if (el.type === 'NAME') text = guest.name;
                  if (el.type === 'FIELD' && el.fieldKey) text = additionalData[el.fieldKey] || '';
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
                  />
                );
             }
             if (el.isDynamic && el.type === 'PHOTO' && userImg) {
                return <KonvaImage key={el.id} image={userImg} x={el.x} y={el.y} width={el.width} height={el.height} />;
             }
             return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default function BadgeGenerator({ event, guests, onClose }) {
  const [background, setBackground] = useState(null);
  const [badgesPerPage, setBadgesPerPage] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [renderQueue, setRenderQueue] = useState([]);
  const [renderedImages, setRenderedImages] = useState({});
  const [currentGuestIdx, setCurrentGuestIdx] = useState(-1);

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBackground(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const startGeneration = async () => {
    if (guests.length === 0) return toast.error("Aucun invité à traiter");
    setIsGenerating(true);
    setProgress(0);
    setRenderedImages({});
    setCurrentGuestIdx(0);
  };

  // Handle the sequential rendering
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
      // Done rendering all, now create PDF
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

    guests.forEach((guest, index) => {
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

      // Add a small padding between badges for cutting
      doc.addImage(imgData, 'PNG', x + 2, y + 2, badgeWidth - 4, badgeHeight - 4);
      doc.setDrawColor(230);
      doc.rect(x + 1, y + 1, badgeWidth - 2, badgeHeight - 2); // Cutting border

      currentBadgeInPage++;
    });

    doc.save(`badges_${event.name.replace(/\s+/g, '_')}.pdf`);
    setIsGenerating(false);
    setCurrentGuestIdx(-1);
    toast.success("PDF généré avec succès !");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <FiPrinter size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Générateur de Badges</h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Impression en série pour {guests.length} invités</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"><FiX size={24} /></button>
        </div>

        <div className="p-8 space-y-8">
          {/* Background Upload */}
          <div className="space-y-4">
             <label className="block text-sm font-black text-gray-900 uppercase tracking-widest">Image de fond du badge</label>
             <div className="flex items-center gap-6">
                <div className="w-32 h-44 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                   {background ? (
                      <>
                        <img src={background} alt="Badge BG" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <FiUpload className="text-white" size={24} />
                        </div>
                      </>
                   ) : (
                      <FiImage size={32} className="text-gray-200" />
                   )}
                   <input type="file" onChange={handleBackgroundUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
                <div className="flex-1 space-y-2">
                   <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      L'image actuelle de l'invitation sera utilisée par défaut. Téléchargez-en une nouvelle si vous voulez un design différent pour les badges physiques.
                   </p>
                   <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest !p-0">Supprimer l'image</Button>
                </div>
             </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-4">
                <label className="block text-sm font-black text-gray-900 uppercase tracking-widest">Badges par page (A4)</label>
                <div className="relative">
                   <FiGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                   <select 
                      value={badgesPerPage}
                      onChange={(e) => setBadgesPerPage(parseInt(e.target.value))}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-primary transition-all appearance-none"
                   >
                      <option value="1">1 badge par page (Plein A4)</option>
                      <option value="2">2 badges par page</option>
                      <option value="4">4 badges par page (Format standard)</option>
                      <option value="8">8 badges par page (Petit format)</option>
                      <option value="10">10 badges par page (Type carte visite)</option>
                   </select>
                </div>
             </div>
             <div className="space-y-4">
                <label className="block text-sm font-black text-gray-900 uppercase tracking-widest">Orientation</label>
                <div className="flex items-center gap-3">
                   <button className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl">Portrait</button>
                   <button className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-gray-100">Paysage</button>
                </div>
             </div>
          </div>

          {/* Progress (if generating) */}
          {isGenerating && (
             <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                   <span className="text-primary">Génération en cours...</span>
                   <span className="text-gray-400">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                   <div 
                      className="h-full bg-primary transition-all duration-300 shadow-[0_0_15px_rgba(55,114,255,0.4)]" 
                      style={{ width: `${progress}%` }} 
                   />
                </div>
             </div>
          )}
        </div>

        <div className="p-8 bg-gray-50/50 flex items-center justify-end gap-4">
           <Button variant="ghost" onClick={onClose} disabled={isGenerating}>Annuler</Button>
           <Button 
              onClick={startGeneration} 
              loading={isGenerating} 
              className="px-12 bg-gray-900 text-white rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
           >
              Générer le PDF final
           </Button>
        </div>

        {/* The hidden renderer */}
        {renderQueue.map(({ guest, qr }) => (
          <BadgeRenderer 
            key={guest.id} 
            event={event} 
            guest={guest} 
            qrCode={qr} 
            design={{ background }}
            onRendered={onBadgeRendered} 
          />
        ))}
      </div>
    </div>
  );
}
