'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import PosterEditor from '@/components/canvas/PosterEditor';
import Loader from '@/components/Loader';
import Icon from '@/components/Icon';
import { FiFileText, FiDownload, FiLayout, FiUploadCloud, FiCheckCircle, FiEye, FiEdit3 } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import cn from 'classnames';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from 'react-konva';
import useImage from 'use-image';

const BadgeRenderer = ({ templateData, row, width, height, x, y }) => {
  const [bgImg] = useImage(templateData.backgroundImageUrl || '', 'anonymous');
  const zonesRaw = typeof templateData.zones === 'string' ? JSON.parse(templateData.zones) : templateData.zones;
  const elements = zonesRaw?.elements || [];
  const designW = zonesRaw?.designWidth || 800;
  const designH = zonesRaw?.designHeight || 1200;

  const scaleX = width / designW;
  const scaleY = height / designH;

  return (
    <Group x={x} y={y}>
      <Rect width={width} height={height} fill="white" stroke="#e5e7eb" strokeWidth={1} />
      {bgImg && <KonvaImage image={bgImg} width={width} height={height} />}
      {elements.map((el) => {
        const x = el.x * scaleX;
        const y = el.y * scaleY;
        const w = el.width * scaleX;
        const h = el.height * scaleY;

        if (el.isDynamic && el.fieldKey) {
          const value = row ? row[el.fieldKey] : `{${el.fieldKey}}`;
          if (el.type === 'PHOTO') {
             return (
               <Group key={el.id} x={x} y={y} rotation={el.rotation}>
                 <Rect width={w} height={h} fill="#f3f4f6" stroke="#3772FF" strokeWidth={1} dash={[2, 2]} />
                 <Text text="📸" width={w} height={h} align="center" verticalAlign="middle" fontSize={h * 0.4} opacity={0.3} />
               </Group>
             );
          }
          return (
            <Text
              key={el.id}
              text={String(value || '')}
              x={x}
              y={y}
              width={w}
              height={h}
              fontSize={(el.fontSize || 24) * scaleX}
              fill={el.fill || '#000'}
              fontFamily={el.fontFamily}
              rotation={el.rotation}
              align="center"
              verticalAlign="middle"
            />
          );
        }
        
        if (el.type === 'text') {
          return (
            <Text
              key={el.id}
              text={el.text}
              x={x}
              y={y}
              width={w}
              height={h}
              fontSize={(el.fontSize || 24) * scaleX}
              fill={el.fill}
              rotation={el.rotation}
              align="center"
            />
          );
        }
        return null;
      })}
    </Group>
  );
};

export default function BadgesPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [excelData, setExcelData] = useState([]);
  const [paperSize, setPaperSize] = useState('a4');
  const [badgesPerPage, setBadgesPerPage] = useState(4);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [view, setView] = useState('editor'); // 'editor' or 'preview'

  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventRes, templateRes] = await Promise.all([
          fetch(`/api/events/${id}`),
          fetch(`/api/events/${id}/badge-template`)
        ]);
        
        const eventData = await eventRes.json();
        const templateData = await templateRes.json();

        if (eventData.error) toast.error(eventData.error);
        else setEvent(eventData);

        if (templateData && templateData.backgroundImageUrl) {
          setTemplate(templateData);
        } else {
          setTemplate(eventData);
        }
      } catch (e) {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      setExcelData(data);
      toast.success(`${data.length} lignes importées`);
      setView('preview');
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      const res = await fetch(`/api/events/${id}/badge-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });
      if (res.ok) {
        const updated = await res.json();
        setTemplate(updated);
        toast.success('Modèle enregistré !');
      } else toast.error('Erreur');
    } catch (err) { toast.error('Erreur réseau'); }
  };

  const generatePDF = async () => {
    if (excelData.length === 0) {
      toast.error('Importez d\'abord un fichier Excel');
      return;
    }
    setProcessing(true);
    setProgress(0);

    const doc = new jsPDF({ unit: 'mm', format: paperSize });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    let cols = 2, rows = 2;
    if (badgesPerPage === 1) { cols = 1; rows = 1; }
    else if (badgesPerPage === 8) { cols = 2; rows = 4; }
    else if (badgesPerPage === 12) { cols = 3; rows = 4; }

    const margin = 10;
    const badgeW = (pw - (margin * (cols + 1))) / cols;
    const badgeH = (ph - (margin * (rows + 1))) / rows;

    const zonesRaw = typeof template.zones === 'string' ? JSON.parse(template.zones) : template.zones;
    const elements = zonesRaw?.elements || [];
    const designW = zonesRaw?.designWidth || 800;
    const designH = zonesRaw?.designHeight || 1200;

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      const badgeIdx = i % badgesPerPage;
      if (badgeIdx === 0 && i !== 0) doc.addPage();

      const col = badgeIdx % cols;
      const r = Math.floor(badgeIdx / cols);
      const x = margin + col * (badgeW + margin);
      const y = margin + r * (badgeH + margin);

      if (template.backgroundImageUrl) {
        doc.addImage(template.backgroundImageUrl, 'PNG', x, y, badgeW, badgeH);
      }

      for (const el of elements) {
        const scaleX = badgeW / designW;
        const scaleY = badgeH / designH;
        const ex = x + (el.x * scaleX);
        const ey = y + (el.y * scaleY);
        const ew = el.width * scaleX;
        const eh = el.height * scaleY;

        if (el.isDynamic && el.fieldKey) {
          const value = row[el.fieldKey];
          if (!value) continue;
          if (el.type === 'PHOTO') {
            try { doc.addImage(value, 'JPEG', ex, ey, ew, eh); } catch (e) {}
          } else {
            doc.setFontSize((el.fontSize || 24) * (badgeW / designW) * 2.5); // Fixed scale
            doc.text(String(value), ex + (ew/2), ey + (eh/2), { align: 'center', baseline: 'middle' });
          }
        } else if (el.type === 'text') {
           doc.setFontSize((el.fontSize || 24) * (badgeW / designW) * 2.5);
           doc.text(el.text, ex + (ew/2), ey + (eh/2), { align: 'center', baseline: 'middle' });
        }
      }
      setProgress(Math.round(((i + 1) / excelData.length) * 100));
    }

    doc.save(`badges_${event.name}.pdf`);
    setProcessing(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-dark"><Loader /></div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0E0E0F]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#1A1A1D] border-b border-[#23262F] z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-[#23262F] rounded-xl text-gray-400 transition">
            <Icon name="arrow-left" size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Générateur de Badges</h1>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{event.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-[#0E0E0F] p-1 rounded-xl border border-[#23262F]">
            <button onClick={() => setView('editor')} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2", view === 'editor' ? "bg-primary text-white" : "text-gray-500 hover:text-white")}>
              <FiEdit3 /> MODÈLE
            </button>
            <button onClick={() => setView('preview')} className={cn("px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2", view === 'preview' ? "bg-primary text-white" : "text-gray-500 hover:text-white")}>
              <FiEye /> APERÇU
            </button>
          </div>

          <div className="flex items-center gap-2">
             <div className="bg-[#0E0E0F] px-3 py-1.5 rounded-lg border border-[#23262F] flex items-center gap-3">
               {['a4', 'a3'].map(s => (
                 <button key={s} onClick={() => setPaperSize(s)} className={cn("text-[10px] font-black uppercase transition", paperSize === s ? "text-primary" : "text-gray-600")}>{s}</button>
               ))}
             </div>
             <div className="bg-[#0E0E0F] px-3 py-1.5 rounded-lg border border-[#23262F] flex items-center gap-3">
               {[1, 4, 8, 12].map(n => (
                 <button key={n} onClick={() => setBadgesPerPage(n)} className={cn("text-[10px] font-black transition", badgesPerPage === n ? "text-primary" : "text-gray-600")}>{n}/P</button>
               ))}
             </div>
          </div>

          <button onClick={generatePDF} disabled={processing || excelData.length === 0} className="px-6 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white text-sm font-black rounded-xl transition shadow-lg shadow-pink-500/20 flex items-center gap-2">
            {processing ? <Loader className="!h-4 !w-4" /> : <FiDownload />} PDF
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-72 bg-[#1A1A1D] border-r border-[#23262F] flex flex-col">
          <div className="p-6 flex-grow overflow-y-auto">
            <div className="mb-8">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">1. Données Excel</h3>
              <label className="flex flex-col items-center justify-center w-full h-28 bg-[#0E0E0F] border-2 border-dashed border-[#23262F] rounded-2xl cursor-pointer hover:border-primary transition group">
                <FiUploadCloud size={24} className="text-gray-600 group-hover:text-primary mb-2" />
                <span className="text-[10px] font-bold text-gray-500 group-hover:text-primary uppercase">Importer</span>
                <input type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx, .xls, .csv" />
              </label>
              {excelData.length > 0 && (
                <div className="mt-3 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-2 text-primary text-[10px] font-bold">
                  <FiCheckCircle /> {excelData.length} LIGNES
                </div>
              )}
            </div>

            {excelData.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">2. Colonnes</h3>
                <div className="space-y-2">
                  {Object.keys(excelData[0]).map(k => (
                    <div key={k} className="p-2 bg-[#23262F] rounded-lg text-[10px] font-bold text-gray-400 flex justify-between items-center">
                      <span className="truncate mr-2">{k}</span>
                      <span className="bg-[#353945] px-1 rounded text-[8px] text-white">COL</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {processing && (
            <div className="p-6 bg-[#0E0E0F] border-t border-[#23262F]">
              <div className="flex justify-between text-[10px] font-black text-white mb-2">
                <span>GÉNÉRATION...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-[#23262F] rounded-full overflow-hidden">
                <div className="h-full bg-pink-500 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Center Canvas / Preview */}
        <div className="flex-1 overflow-hidden relative flex flex-col bg-[#0E0E0F]">
          {view === 'editor' ? (
            <PosterEditor initialData={template} onSave={handleSaveTemplate} />
          ) : (
            <div className="flex-1 overflow-auto p-12 flex justify-center items-start bg-[#141416]">
               <div className="bg-white shadow-2xl p-4 origin-top" style={{ width: paperSize === 'a4' ? '595px' : '841px', minHeight: paperSize === 'a4' ? '841px' : '1190px' }}>
                  <div className="text-[10px] font-black text-gray-300 mb-4 uppercase border-b pb-2">Aperçu Page 1 ({paperSize.toUpperCase()})</div>
                  <Stage width={paperSize === 'a4' ? 560 : 800} height={paperSize === 'a4' ? 780 : 1150}>
                    <Layer>
                       {excelData.slice(0, badgesPerPage).map((row, i) => {
                          let cols = 2, rowsNum = 2;
                          if (badgesPerPage === 1) { cols = 1; rowsNum = 1; }
                          else if (badgesPerPage === 8) { cols = 2; rowsNum = 4; }
                          else if (badgesPerPage === 12) { cols = 3; rowsNum = 4; }

                          const canvasW = paperSize === 'a4' ? 560 : 800;
                          const canvasH = paperSize === 'a4' ? 780 : 1150;
                          const m = 10;
                          const bW = (canvasW - (m * (cols + 1))) / cols;
                          const bH = (canvasH - (m * (rowsNum + 1))) / rowsNum;

                          const c = i % cols;
                          const r = Math.floor(i / cols);
                          return (
                            <BadgeRenderer 
                              key={i} 
                              templateData={template} 
                              row={row} 
                              width={bW} 
                              height={bH} 
                              x={m + c * (bW + m)}
                              y={m + r * (bH + m)}
                            />
                          );
                       })}
                    </Layer>
                  </Stage>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
