'use client';

import React, { useState, useRef, useEffect } from 'react';
import PosterEditor from '@/components/canvas/PosterEditor';
import { FiPrinter, FiSettings, FiArrowLeft, FiChevronRight, FiGrid, FiDownload, FiCheckCircle, FiTrash2, FiUpload, FiFileText, FiZap, FiInfo, FiRotateCcw } from 'react-icons/fi';
import AppLink from '@/components/AppLink';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';
import { Stage, Layer, Image as KonvaImage, Text, Group, Rect, Circle } from 'react-konva';
import useImage from 'use-image';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import Button from '@/components/ui/Button';
import * as XLSX from 'xlsx';

// Renderer for a single badge (can be used for preview or batch generation)
// Renderer for a single badge with HEAVY DEBUGGING
const BadgeRenderer = ({ design, data, qrCode, onRendered }) => {
  if (!design || !data) return null;
  
  const elements = design.zones || [];
  const designWidth = design.designWidth || 800;
  const designHeight = design.designHeight || 1120;
  const bgUrl = design.backgroundImageUrl || '';
  
  const [bgImg, bgStatus] = useImage(bgUrl, 'anonymous');
  const [qrImg, qrStatus] = useImage(qrCode || '', 'anonymous');
  const stageRef = useRef();

  useEffect(() => {
    // On attend que les images soient complètement chargées avant de capturer
    const isBgReady = !bgUrl || bgStatus === 'loaded' || bgStatus === 'failed';
    const isQrReady = !qrCode || qrStatus === 'loaded' || qrStatus === 'failed';

    if (isBgReady && isQrReady) {
      const timer = setTimeout(() => {
        if (stageRef.current) {
          try {
            const url = stageRef.current.toDataURL({ pixelRatio: 2 });
            onRendered(url);
          } catch (e) {
            console.error("Erreur CORS ou génération d'image:", e);
            onRendered(""); // Ne pas bloquer la queue
          }
        }
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [onRendered, data, design, bgStatus, qrStatus, bgUrl, qrCode]);

  return (
    <div className="absolute opacity-0 pointer-events-none" style={{ left: -3000 }}>
      <Stage width={designWidth} height={designHeight} ref={stageRef}>
        <Layer>
          {/* Debug Background */}
          <Rect width={designWidth} height={designHeight} fill="#f8f9fa" />
          
          {bgImg && <KonvaImage image={bgImg} width={designWidth} height={designHeight} />}
          
          {elements.map((el) => {
             if (el.isDynamic && el.type === 'QRCODE') {
                return (
                  <Group key={el.id} x={el.x} y={el.y} rotation={el.rotation}>
                    <Rect width={el.width} height={el.height} fill="white" stroke="#000" strokeWidth={1} />
                    {qrImg && <KonvaImage image={qrImg} width={el.width} height={el.height} />}
                  </Group>
                );
             }

             if (el.type === 'text' || el.isDynamic) {
                let text = el.text;
                let color = el.fill || '#000000';
                
                if (el.isDynamic) {
                  const getValue = (searchKey) => {
                    if (!searchKey) return undefined;
                    const cleanSearchKey = searchKey.trim().toLowerCase();
                    if (data[searchKey] !== undefined) return data[searchKey];
                    const foundKey = Object.keys(data).find(k => String(k).trim().toLowerCase() === cleanSearchKey);
                    return foundKey ? data[foundKey] : undefined;
                  };

                  const val = getValue(el.fieldKey);
                  
                  if (val !== undefined && val !== "") {
                    // 1. Priority: If a specific field key is defined and found, use it
                    text = val;
                  } else if (el.type === 'NAME') {
                    // 2. Fallback for NAME type: try common name columns
                    const nameVal = getValue('name') || getValue('Name') || getValue('NOM') || getValue('Nom') || getValue('fullname');
                    if (nameVal) {
                        text = nameVal;
                    } else {
                        // 3. Last resort: use the first column available
                        const keys = Object.keys(data);
                        text = keys.length > 0 ? data[keys[0]] : "";
                    }
                  } else {
                    text = el.text || ""; 
                  }
                }
                
                const finalX = el.x;
                const finalY = el.y;
                const finalWidth = el.width || 200;
                const finalHeight = el.height || (el.fontSize || 20) * 1.5;
                const finalFontSize = el.fontSize || 20;

                return (
                  <Group key={el.id} x={finalX} y={finalY} rotation={el.rotation}>
                    <Text
                      text={String(text)}
                      width={finalWidth}
                      height={finalHeight}
                      fontSize={finalFontSize}
                      fill={color}
                      fontFamily={el.fontFamily || 'Poppins'}
                      fontStyle={el.fontStyle || 'bold'}
                      align="center"
                      verticalAlign="middle"
                    />
                  </Group>
                );
             }

             if (el.type === 'rect') return <Rect key={el.id} {...el} />;
             if (el.type === 'circle') return <Circle key={el.id} {...el} />;
             return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default function GlobalBadgeExcelPage() {
  const [excelData, setExcelData] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const [design, setDesign] = useState(null);

  const [badgesPerPage, setBadgesPerPage] = useState(4);
  const [pdfOrientation, setPdfOrientation] = useState('p'); // 'p' or 'l'
  const [badgeRotation, setBadgeRotation] = useState(0); // 0 or 90
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewImages, setPreviewImages] = useState({});
  const [renderedImages, setRenderedImages] = useState({});
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewQueue, setPreviewQueue] = useState([]);
  const [renderQueue, setRenderQueue] = useState([]);

  const fileInputRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem('global_badge_design');
    if (saved) {
      try {
        setDesign(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); // defval ensures empty cells are included
        
        if (jsonData.length > 0) {
            console.log("Excel Data Detected:", jsonData[0]);
            setExcelData(jsonData);
            setExcelColumns(Object.keys(jsonData[0]));
            toast.success(`${jsonData.length} lignes importées !`);
            if (design) startPreview(jsonData);
        } else {
            toast.error("Le fichier Excel semble vide");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const startPreview = async (data = excelData) => {
    if (data.length === 0 || !design) return;
    setIsPreviewing(true);
    setPreviewImages({});
    const count = Math.min(badgesPerPage, data.length);
    const queue = [];
    for (let i = 0; i < count; i++) {
        const row = data[i];
        const qrContent = row.id || row.ID || row.Email || row.email || `badge-${i}`;
        const qr = await QRCode.toDataURL(qrContent, { margin: 1 });
        queue.push({ data: row, qr, index: i });
    }
    setPreviewQueue(queue);
  };

  const onPreviewRendered = React.useCallback((index, dataUrl) => {
    setPreviewImages(prev => ({ ...prev, [index]: dataUrl }));
    if (index === Math.min(badgesPerPage, excelData.length) - 1) {
        setIsPreviewing(false);
        setPreviewQueue([]);
    }
  }, [badgesPerPage, excelData.length]);

  const handlePrint = async (designData) => {
    if (excelData.length === 0) {
      return toast.error("Veuillez d'abord importer un fichier Excel");
    }

    const designToSave = {
        backgroundImageUrl: designData.backgroundImageUrl,
        zones: designData.zones,
        designWidth: designData.designWidth,
        designHeight: designData.designHeight
    };

    localStorage.setItem('global_badge_design', JSON.stringify(designToSave));
    setDesign(designToSave);
    setIsGenerating(true);
    setProgress(0);
    setRenderedImages({});
    setCurrentIdx(0);
  };

  useEffect(() => {
    if (excelData.length > 0 && design) {
        startPreview();
    }
  }, [badgesPerPage, design, excelData]); 

  useEffect(() => {
    if (isGenerating && currentIdx >= 0 && currentIdx < excelData.length) {
      const generateQR = async () => {
        try {
          const row = excelData[currentIdx];
          const qrContent = row.id || row.ID || row.Email || row.email || `badge-${currentIdx}`;
          const qr = await QRCode.toDataURL(qrContent, { margin: 1 });
          setRenderQueue([{ data: row, qr }]);
        } catch (e) {
          console.error(e);
        }
      };
      generateQR();
    } else if (isGenerating && currentIdx >= excelData.length) {
      createPDF();
    }
  }, [isGenerating, currentIdx]);

  const onBadgeRendered = React.useCallback((dataUrl) => {
    setRenderedImages(prev => ({ ...prev, [currentIdx]: dataUrl }));
    setProgress(Math.round(((currentIdx + 1) / excelData.length) * 100));
    setRenderQueue([]);
    setCurrentIdx(prev => prev + 1);
  }, [currentIdx, excelData.length]);

  const createPDF = () => {
    const doc = new jsPDF(pdfOrientation, 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);
    
    // Determine grid based on orientation and badgesPerPage
    let cols, rows;
    if (pdfOrientation === 'p') {
        cols = badgesPerPage <= 2 ? 1 : 2;
        rows = Math.ceil(badgesPerPage / cols);
    } else {
        cols = badgesPerPage <= 2 ? badgesPerPage : 3;
        rows = Math.ceil(badgesPerPage / cols);
    }

    const badgeWidth = availableWidth / cols;
    const badgeHeight = availableHeight / rows;

    let currentBadgeInPage = 0;
    excelData.forEach((_, index) => {
      const imgData = renderedImages[index];
      if (!imgData) return;
      if (currentBadgeInPage >= badgesPerPage) {
        doc.addPage();
        currentBadgeInPage = 0;
      }
      const col = currentBadgeInPage % cols;
      const row = Math.floor(currentBadgeInPage / cols);
      const x = margin + (col * badgeWidth);
      const y = margin + (row * badgeHeight);
      
      if (badgeRotation === 90) {
        // Center the rotated image in the slot
        doc.addImage(imgData, 'PNG', x + badgeWidth - 2, y + 2, badgeHeight - 4, badgeWidth - 4, null, null, 90);
      } else {
        doc.addImage(imgData, 'PNG', x + 2, y + 2, badgeWidth - 4, badgeHeight - 4);
      }
      
      doc.setDrawColor(230);
      doc.rect(x + 1, y + 1, badgeWidth - 2, badgeHeight - 2);
      currentBadgeInPage++;
    });

    doc.save(`badges_global_excel_${Date.now()}.pdf`);
    setIsGenerating(false);
    setCurrentIdx(-1);
    toast.success("PDF généré avec succès !");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 pt-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <AppLink 
             href={`/dashboard/events`} 
             className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-lg transition-all border border-gray-100"
           >
              <FiArrowLeft size={24} />
           </AppLink>
           <div>
              <div className="flex items-center gap-3 mb-1">
                 <h2 className="text-3xl font-black text-gray-900 tracking-tight">Outil de Badges Excel</h2>
                 <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full tracking-widest">Outil Indépendant</span>
              </div>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Générez des badges sans créer d'événement</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
                if (excelData.length > 0) startPreview();
                else toast.error("Importez d'abord un fichier");
            }}
            className="flex items-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg"
          >
            <FiZap size={16} />
            Actualiser l'aperçu
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-900 uppercase tracking-widest hover:border-primary hover:text-primary transition-all shadow-sm"
          >
            <FiUpload size={16} />
            {excelData.length > 0 ? `${excelData.length} lignes` : "Importer Excel"}
          </button>

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
            <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-100">
                <FiRotateCcw className="text-gray-400" />
                <select 
                  value={badgeRotation}
                  onChange={(e) => setBadgeRotation(parseInt(e.target.value))}
                  className="bg-transparent text-xs font-black text-gray-900 uppercase tracking-widest outline-none"
                >
                  <option value="0">0°</option>
                  <option value="90">90°</option>
                </select>
            </div>
            <div className="flex items-center gap-2 px-4 py-2">
                <FiFileText className="text-gray-400" />
                <select 
                  value={pdfOrientation}
                  onChange={(e) => setPdfOrientation(e.target.value)}
                  className="bg-transparent text-xs font-black text-gray-900 uppercase tracking-widest outline-none"
                >
                  <option value="p">Portrait</option>
                  <option value="l">Paysage</option>
                </select>
            </div>
          </div>
        </div>
      </div>

      {/* Excel Diagnostic Info */}
      {excelColumns.length > 0 && (
         <div className="bg-blue-50 border border-blue-100 p-6 rounded-[32px] flex flex-col md:flex-row md:items-center gap-6 animate-in slide-in-from-top-2">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <FiInfo size={24} />
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">Colonnes détectées dans votre fichier</h4>
                <p className="text-xs text-blue-700/70 font-medium mb-3">Copiez l'un de ces noms et collez-le dans "Clé de champ (Excel)" dans l'éditeur :</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {excelColumns.map(col => (
                        <button 
                            key={col}
                            onClick={() => {
                                navigator.clipboard.writeText(col);
                                toast.success(`Copié : ${col}`);
                            }}
                            className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 text-[10px] font-black rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                            {col}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto bg-white/50 rounded-2xl border border-blue-100">
                    <table className="w-full text-[10px] font-bold text-blue-900">
                        <thead>
                            <tr className="border-b border-blue-100">
                                {excelColumns.map(col => <th key={col} className="p-3 text-left bg-blue-100/50">{col}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {excelColumns.map(col => <td key={col} className="p-3 border-r border-blue-50 last:border-0">{excelData[0]?.[col]}</td>)}
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="mt-2 text-[9px] text-blue-500 italic">Ci-dessus : Les données réelles lues dans la première ligne de votre fichier.</p>
            </div>
         </div>
      )}

      {/* Progress Bar */}
      {isGenerating && (
         <div className="bg-gray-900 text-white p-6 rounded-[32px] shadow-2xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <div>
                     <h4 className="text-sm font-black uppercase tracking-widest">Génération du PDF...</h4>
                     <p className="text-[10px] text-gray-400 font-bold uppercase">Traitement {currentIdx + 1} / {excelData.length}</p>
                  </div>
               </div>
               <span className="text-xl font-black text-primary">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
         </div>
      )}

      {/* Layout Preview Section */}
      {excelData.length > 0 && (
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl animate-in fade-in zoom-in duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <FiGrid className="text-primary" /> Aperçu de la mise en page (A4)
              </h3>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Disposition sur le papier pour {excelData.length} badges</p>
            </div>
            <div className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-100">
              Format {pdfOrientation === 'p' ? 'Portrait' : 'Paysage'} {pdfOrientation === 'p' ? '210x297mm' : '297x210mm'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-start">
            {/* The Page Simulator */}
            <div className="lg:col-span-1 flex justify-center">
              <div 
                className="bg-white shadow-2xl border border-gray-200 relative overflow-hidden flex flex-wrap p-2 transition-all duration-500"
                style={{ 
                  width: pdfOrientation === 'p' ? '210px' : '297px', 
                  height: pdfOrientation === 'p' ? '297px' : '210px', 
                  borderRadius: '4px'
                }}
              >
                {Array.from({ length: badgesPerPage }).map((_, i) => {
                  let cols, rows;
                  if (pdfOrientation === 'p') {
                      cols = badgesPerPage <= 2 ? 1 : 2;
                      rows = Math.ceil(badgesPerPage / cols);
                  } else {
                      cols = badgesPerPage <= 2 ? badgesPerPage : 3;
                      rows = Math.ceil(badgesPerPage / cols);
                  }
                  const w = 100 / cols;
                  const h = 100 / rows;
                  const previewImg = previewImages[i];
                  
                  return (
                    <div 
                      key={i}
                      className="border border-dashed border-primary/30 bg-primary/5 flex items-center justify-center m-[1px] overflow-hidden"
                      style={{ 
                        width: `calc(${w}% - 2px)`, 
                        height: `calc(${h}% - 2px)`,
                        borderRadius: '2px'
                      }}
                    >
                      {previewImg ? (
                        <img 
                            src={previewImg} 
                            alt={`Badge ${i+1}`} 
                            className="w-full h-full object-contain transition-transform duration-500" 
                            style={{ transform: badgeRotation === 90 ? 'rotate(90deg)' : 'none' }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-black text-primary/40 uppercase">Badge {i + 1}</span>
                            {i < excelData.length && isPreviewing && <div className="w-3 h-3 border-2 border-primary/30 border-t-transparent rounded-full animate-spin"></div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation & Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="text-2xl font-black text-gray-900 mb-1">{excelData.length}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Badges</div>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="text-2xl font-black text-gray-900 mb-1">{Math.ceil(excelData.length / badgesPerPage)}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pages A4 totales</div>
                </div>
              </div>

              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                <h4 className="text-xs font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                  <FiZap /> Conseil d'impression
                </h4>
                <ul className="text-xs text-primary/70 font-medium space-y-2 list-disc pl-4 leading-relaxed">
                  <li>Utilisez du papier cartonné (200g - 350g) pour un rendu premium.</li>
                  <li>Réglez les marges de votre imprimante sur "Aucune" ou "Zéro".</li>
                  <li>Assurez-vous que l'échelle d'impression est à 100% (Taille réelle).</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="h-[800px] relative bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
        <PosterEditor 
          initialData={design ? {
            backgroundImageUrl: design.backgroundImageUrl,
            zones: design.zones,
            designWidth: design.designWidth,
            designHeight: design.designHeight
          } : null}
          onSave={handlePrint} 
          onChange={(newDesign) => {
              // Only update if it's actually different to avoid loops
              setDesign(newDesign);
          }}
          loading={isGenerating}
          saveText={isGenerating ? "Impression..." : "Imprimer via Excel"}
        />
      </div>

      {/* Preview Renderers */}
      {previewQueue.map(({ data, qr, index }) => (
        <BadgeRenderer 
          key={`preview-${index}`} 
          design={design} 
          data={data} 
          qrCode={qr} 
          onRendered={(url) => onPreviewRendered(index, url)} 
        />
      ))}

      {/* Generation Renderers */}
      {renderQueue.map(({ data, qr }, index) => (
        <BadgeRenderer 
          key={`gen-${index}`} 
          design={design} 
          data={data} 
          qrCode={qr} 
          onRendered={onBadgeRendered} 
        />
      ))}
    </div>
  );
}
