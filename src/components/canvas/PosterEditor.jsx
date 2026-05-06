'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Image as KonvaImage, Transformer, Star, RegularPolygon, Line, Group } from 'react-konva';
import useImage from 'use-image';
import { FiType, FiImage, FiTrash2, FiUser, FiCamera, FiUpload, FiCircle, FiSquare, FiStar, FiHexagon, FiMaximize, FiMinus, FiBold, FiItalic } from 'react-icons/fi';
import { MdQrCode } from 'react-icons/md';
import Button from '../ui/Button';
import { v4 as uuidv4 } from 'uuid';

const ShapeRenderer = ({ shapeProps, isSelected, onSelect, onChange }) => {
// ... existing code ...
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e) => {
    onChange({
      ...shapeProps,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    
    const newProps = {
      ...shapeProps,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };

    if (shapeProps.type === 'circle') {
      newProps.radius = Math.max(5, node.radius() * scaleX);
    } else {
      newProps.width = Math.max(5, node.width() * scaleX);
      newProps.height = Math.max(5, node.height() * scaleY);
    }
    
    onChange(newProps);
  };

  const isGradient = shapeProps.gradientEnabled;
  
  const props = {
    ...shapeProps,
    fill: isGradient ? undefined : shapeProps.fill,
    fillLinearGradientStartPoint: isGradient ? { x: 0, y: 0 } : undefined,
    fillLinearGradientEndPoint: isGradient ? { x: shapeProps.type === 'circle' ? shapeProps.radius * 2 : shapeProps.width, y: shapeProps.type === 'circle' ? shapeProps.radius * 2 : shapeProps.height } : undefined,
    fillLinearGradientColorStops: isGradient ? [0, shapeProps.gradientColor1 || '#ffffff', 1, shapeProps.gradientColor2 || '#000000'] : undefined,
    ref: shapeRef,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
  };

  let ShapeComp;
  switch (shapeProps.type) {
    case 'rect': ShapeComp = Rect; break;
    case 'circle': ShapeComp = Circle; break;
    case 'star': ShapeComp = Star; break;
    case 'polygon': ShapeComp = RegularPolygon; break;
    default: ShapeComp = Rect;
  }

  return (
    <>
      <ShapeComp {...props} />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
};

const URLImage = ({ image, shapeProps, isSelected, onSelect, onChange }) => {
  const [img] = useImage(image.src);
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        image={img}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </React.Fragment>
  );
};

const EditableText = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          node.scaleX(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(30, node.width() * scaleX),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} enabledAnchors={['middle-left', 'middle-right']} />}
    </React.Fragment>
  );
};

const DynamicArea = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const groupRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const isPhoto = shapeProps.type === 'PHOTO';
  const subType = shapeProps.subType || 'rect';

  // Clipping function based on shape
  const getClipFunc = (ctx) => {
    const { width, height } = shapeProps;
    if (subType === 'circle') {
      ctx.arc(width / 2, height / 2, width / 2, 0, Math.PI * 2, false);
    } else if (subType === 'diamond') {
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width, height / 2);
      ctx.lineTo(width / 2, height);
      ctx.lineTo(0, height / 2);
      ctx.closePath();
    } else {
      ctx.rect(0, 0, width, height);
    }
  };

  return (
    <React.Fragment>
      <Group
        x={shapeProps.x}
        y={shapeProps.y}
        width={shapeProps.width}
        height={shapeProps.height}
        rotation={shapeProps.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        onDragEnd={(e) => {
          onChange({ ...shapeProps, x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      >
        {/* Background / Border */}
        <Rect
          width={shapeProps.width}
          height={shapeProps.height}
          fill={isPhoto ? 'rgba(55, 114, 255, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
          stroke={isPhoto ? '#3772FF' : '#EF4444'}
          strokeWidth={2}
          dash={[5, 5]}
          cornerRadius={subType === 'circle' ? shapeProps.width : 0}
        />

        {/* Clipping Area (Photoshop Mask Style) */}
        <Group clipFunc={getClipFunc}>
          {isPhoto && (
            <Rect
              width={shapeProps.width}
              height={shapeProps.height}
              fill="#E5E7EB"
            />
          )}
          {isPhoto && (
            <Text
              text="📸"
              fontSize={Math.min(shapeProps.width, shapeProps.height) * 0.4}
              x={0}
              y={0}
              width={shapeProps.width}
              height={shapeProps.height}
              align="center"
              verticalAlign="middle"
              opacity={0.3}
            />
          )}
        </Group>

        <Text
          text={shapeProps.type === 'QRCODE' ? 'QR CODE' : (shapeProps.fieldKey ? `{${shapeProps.fieldKey}}` : (isPhoto ? 'ZONE_PHOTO' : 'ZONE_NOM'))}
          width={shapeProps.width}
          height={shapeProps.height}
          align="center"
          verticalAlign="middle"
          fontSize={shapeProps.type === 'QRCODE' ? Math.min(shapeProps.width, shapeProps.height) * 0.15 : (shapeProps.fontSize || 14)}
          fontStyle={shapeProps.fontStyle || 'bold'}
          fontFamily={shapeProps.fontFamily || 'Poppins'}
          fill={shapeProps.type === 'QRCODE' ? '#000000' : (shapeProps.fill || (isPhoto ? '#3772FF' : '#EF4444'))}
          listening={false}
          shadowColor="white"
          shadowBlur={4}
          shadowOpacity={1}
        />
        {shapeProps.type === 'QRCODE' && (
           <Text
           text="⬛"
           fontSize={Math.min(shapeProps.width, shapeProps.height) * 0.5}
           x={0}
           y={0}
           width={shapeProps.width}
           height={shapeProps.height}
           align="center"
           verticalAlign="middle"
           opacity={0.1}
         />
        )}
      </Group>
      {isSelected && <Transformer ref={trRef} />}
    </React.Fragment>
  );
};


export default function PosterEditor({ initialData = {}, onSave, loading = false }) {
  const [bgImageSrc, setBgImageSrc] = useState(initialData.backgroundImageUrl || null);
  const [bgImage] = useImage(bgImageSrc);
  const [elements, setElements] = useState(() => {
    const rawZones = initialData.zones ? (typeof initialData.zones === 'string' ? JSON.parse(initialData.zones) : initialData.zones) : [];
    return Array.isArray(rawZones) ? rawZones : (rawZones.elements || []);
  });
  const [selectedId, setSelectedId] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 600, height: 800 });

  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const [gradientEnabled, setGradientEnabled] = useState(false);
  const [gradientColors, setGradientColors] = useState(['#ffffff', '#f3f4f6']);
  
  const containerRef = useRef();
  const stageRef = useRef();

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { offsetWidth } = containerRef.current;
        const width = Math.min(offsetWidth - 40, 800);
        const height = bgImage ? (width * bgImage.height) / bgImage.width : (width * 1.4);
        setStageSize({ width, height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [bgImage]);

  const addElement = (type, extra = {}) => {
    const id = uuidv4();
    let newEl = { id, x: 100, y: 100, rotation: 0, fill: '#3772FF', ...extra };
    
    if (type === 'text') {
      newEl = { ...newEl, type: 'text', text: 'Nouveau texte', fontSize: 24, fill: '#000000', width: 200, fontFamily: 'Poppins', fontStyle: 'normal' };
    } else if (type === 'rect') {
      newEl = { ...newEl, type: 'rect', width: 100, height: 100, stroke: '#000000', strokeWidth: 0, gradientEnabled: false, gradientColor1: '#ffffff', gradientColor2: '#3772FF' };
    } else if (type === 'circle') {
      newEl = { ...newEl, type: 'circle', radius: 50, stroke: '#000000', strokeWidth: 0, gradientEnabled: false, gradientColor1: '#ffffff', gradientColor2: '#3772FF' };
    } else if (type === 'star') {
      newEl = { ...newEl, type: 'star', numPoints: 5, innerRadius: 20, outerRadius: 50, stroke: '#000000', strokeWidth: 0, gradientEnabled: false, gradientColor1: '#ffffff', gradientColor2: '#3772FF' };
    } else if (type === 'polygon') {
      newEl = { ...newEl, type: 'polygon', sides: 6, radius: 50, stroke: '#000000', strokeWidth: 0, gradientEnabled: false, gradientColor1: '#ffffff', gradientColor2: '#3772FF' };
    }
    
    setElements([...elements, newEl]);
    setSelectedId(id);
  };

  const addDynamicArea = (type) => {
    const id = uuidv4();
    setElements([...elements, {
      id, type, isDynamic: true, subType: 'rect',
      x: 150, y: 150, 
      width: type === 'PHOTO' ? 150 : (type === 'QRCODE' ? 100 : 250), 
      height: type === 'PHOTO' ? 150 : (type === 'QRCODE' ? 100 : 50),
      rotation: 0,
      fontFamily: 'Poppins',
      fontStyle: 'bold',
      fontSize: type === 'QRCODE' ? 10 : 24,
      fill: type === 'PHOTO' ? '#3772FF' : (type === 'QRCODE' ? '#000000' : '#EF4444')
    }]);
    setSelectedId(id);
  };

  const deleteSelected = () => {
    setElements(elements.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#141416] border border-[#23262F] rounded-3xl overflow-hidden max-w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-[#1A1A1D] border-b border-[#23262F] gap-2">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm font-bold rounded-lg cursor-pointer hover:bg-opacity-90 transition">
            <FiUpload size={16} />
            <span>Fond</span>
            <input type="file" onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => setBgImageSrc(reader.result);
                reader.readAsDataURL(file);
              }
            }} hidden accept="image/*" />
          </label>
          <button onClick={() => setBgImageSrc(null)} className="p-1.5 text-gray-500 hover:text-white transition" title="Supprimer le fond">
            <FiMinus size={18} />
          </button>

          <div className="w-px h-6 bg-[#353945] mx-1" />

          <button onClick={() => addElement('text')} className="p-2 bg-[#23262F] text-white rounded-lg hover:bg-[#353945]" title="Texte"><FiType size={18} /></button>
          <button onClick={() => addElement('rect')} className="p-2 bg-[#23262F] text-white rounded-lg hover:bg-[#353945]" title="Rectangle"><FiSquare size={18} /></button>
          <button onClick={() => addElement('circle')} className="p-2 bg-[#23262F] text-white rounded-lg hover:bg-[#353945]" title="Cercle"><FiCircle size={18} /></button>
          <button onClick={() => addElement('star')} className="p-2 bg-[#23262F] text-white rounded-lg hover:bg-[#353945]" title="Étoile"><FiStar size={18} /></button>
          <button onClick={() => addElement('polygon')} className="p-2 bg-[#23262F] text-white rounded-lg hover:bg-[#353945]" title="Polygone"><FiHexagon size={18} /></button>
          
          <div className="w-px h-6 bg-[#353945] mx-1" />

          <button onClick={() => addDynamicArea('NAME')} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition text-xs font-bold">
            <FiUser size={14} /> NOM
          </button>
          <button onClick={() => addDynamicArea('PHOTO')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition text-xs font-bold">
            <FiCamera size={14} /> PHOTO
          </button>
          <button onClick={() => addDynamicArea('QRCODE')} className="flex items-center gap-2 px-3 py-1.5 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-lg hover:bg-gray-500/20 transition text-xs font-bold">
            <MdQrCode size={14} /> QR CODE
          </button>
        </div>

        <Button 
          onClick={() => onSave({ backgroundImageUrl: bgImageSrc, zones: elements, designWidth: stageSize.width, designHeight: stageSize.height })} 
          className="px-6 py-2 rounded-xl h-10"
          variant="danger"
          loading={loading}
        >
          {initialData.id ? 'Enregistrer les modifications' : 'Créer l\'événement'}
        </Button>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden bg-[#0E0E0F]">
        {/* Canvas */}
        <div ref={containerRef} className="flex-1 min-w-0 relative overflow-auto flex items-center justify-center p-8">
          <div className="relative shadow-2xl">
            <Stage
              width={stageSize.width}
              height={stageSize.height}
              onMouseDown={(e) => { if (e.target === e.target.getStage()) setSelectedId(null); }}
              ref={stageRef}
              style={{ 
                backgroundColor: !gradientEnabled ? canvasBg : 'transparent',
                backgroundImage: gradientEnabled ? `linear-gradient(to bottom, ${gradientColors[0]}, ${gradientColors[1]})` : 'none'
              }}
            >
              <Layer>
                {bgImage && <KonvaImage image={bgImage} width={stageSize.width} height={stageSize.height} name="bg" />}
                {elements.map((el, i) => {
                  const commonProps = { 
                    shapeProps: el, 
                    isSelected: el.id === selectedId, 
                    onSelect: () => setSelectedId(el.id), 
                    onChange: (attrs) => {
                      const next = [...elements]; 
                      next[i] = attrs; 
                      setElements(next);
                    }
                  };
                  if (el.type === 'text') return <EditableText key={el.id} {...commonProps} />;
                  if (el.isDynamic) return <DynamicArea key={el.id} {...commonProps} />;
                  return <ShapeRenderer key={el.id} {...commonProps} />;
                })}

              </Layer>
            </Stage>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-[#1A1A1D] border-l border-[#23262F] p-6 overflow-y-auto">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-6 tracking-widest">Réglages</h3>
          
          {selectedId ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Élément sélectionné</span>
                <button onClick={deleteSelected} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg"><FiTrash2 size={20} /></button>
              </div>

              {elements.find(el => el.id === selectedId)?.isDynamic && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Forme de la zone</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['rect', 'circle', 'diamond'].map(s => (
                      <button 
                        key={s}
                        onClick={() => {
                          const next = elements.map(el => el.id === selectedId ? { ...el, subType: s } : el);
                          setElements(next);
                        }}
                        className={`py-2 px-1 text-[10px] font-bold rounded-lg border transition ${elements.find(el => el.id === selectedId)?.subType === s ? 'bg-primary border-primary text-white' : 'bg-[#23262F] border-[#353945] text-gray-400'}`}
                      >
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {elements.find(el => el.id === selectedId)?.isDynamic && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase italic text-primary">Clé de champ (Excel)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: nom_complet"
                    className="w-full bg-[#23262F] border border-primary/30 rounded-xl p-3 text-white text-sm outline-none focus:border-primary shadow-lg shadow-primary/5"
                    value={elements.find(el => el.id === selectedId)?.fieldKey || ''}
                    onChange={(e) => {
                      const next = elements.map(el => el.id === selectedId ? { ...el, fieldKey: e.target.value } : el);
                      setElements(next);
                    }}
                  />
                  <p className="mt-2 text-[9px] text-gray-500 italic">Cette clé doit correspondre au nom de la colonne dans votre fichier Excel.</p>
                </div>
              )}

              {elements.find(el => el.id === selectedId)?.type === 'text' && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Contenu</label>
                  <textarea 
                    className="w-full bg-[#23262F] border border-[#353945] rounded-xl p-3 text-white text-sm outline-none focus:border-primary h-24"
                    value={elements.find(el => el.id === selectedId)?.text}
                    onChange={(e) => {
                      const next = elements.map(el => el.id === selectedId ? { ...el, text: e.target.value } : el);
                      setElements(next);
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Rotation</label>
                  <input type="number" className="w-full bg-[#23262F] border border-[#353945] rounded-lg p-2 text-white text-sm" value={elements.find(el => el.id === selectedId)?.rotation || 0} onChange={(e) => {
                    const next = elements.map(el => el.id === selectedId ? { ...el, rotation: parseInt(e.target.value) } : el); setElements(next);
                  }} />
                </div>
                {(!elements.find(el => el.id === selectedId)?.isDynamic || (elements.find(el => el.id === selectedId)?.isDynamic && elements.find(el => el.id === selectedId)?.type !== 'PHOTO')) && (
                  <div className="col-span-2 space-y-4">
                    {(elements.find(el => el.id === selectedId)?.type === 'text' || elements.find(el => el.id === selectedId)?.isDynamic) ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Police</label>
                          <select 
                            className="w-full bg-[#23262F] border border-[#353945] rounded-lg p-2 text-white text-sm outline-none"
                            value={elements.find(el => el.id === selectedId)?.fontFamily || 'Poppins'}
                            onChange={(e) => {
                              const next = elements.map(el => el.id === selectedId ? { ...el, fontFamily: e.target.value } : el);
                              setElements(next);
                            }}
                          >
                            {['Poppins', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'].map(font => (
                              <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              const el = elements.find(e => e.id === selectedId);
                              const current = el.fontStyle || 'normal';
                              let nextStyle = current;
                              if (current.includes('bold')) nextStyle = current.replace('bold', '').trim() || 'normal';
                              else nextStyle = current === 'normal' ? 'bold' : `${current} bold`;
                              const next = elements.map(e => e.id === selectedId ? { ...e, fontStyle: nextStyle } : e);
                              setElements(next);
                            }}
                            className={`p-2 rounded-lg border transition ${elements.find(el => el.id === selectedId)?.fontStyle?.includes('bold') ? 'bg-primary border-primary text-white' : 'bg-[#23262F] border-[#353945] text-gray-400'}`}
                          >
                            <FiBold size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              const el = elements.find(e => e.id === selectedId);
                              const current = el.fontStyle || 'normal';
                              let nextStyle = current;
                              if (current.includes('italic')) nextStyle = current.replace('italic', '').trim() || 'normal';
                              else nextStyle = current === 'normal' ? 'italic' : `${current} italic`;
                              const next = elements.map(e => e.id === selectedId ? { ...e, fontStyle: nextStyle } : e);
                              setElements(next);
                            }}
                            className={`p-2 rounded-lg border transition ${elements.find(el => el.id === selectedId)?.fontStyle?.includes('italic') ? 'bg-primary border-primary text-white' : 'bg-[#23262F] border-[#353945] text-gray-400'}`}
                          >
                            <FiItalic size={16} />
                          </button>
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Couleur</label>
                            <input type="color" className="w-full h-9 bg-transparent border-none p-0 cursor-pointer" value={elements.find(el => el.id === selectedId)?.fill || (elements.find(el => el.id === selectedId)?.isDynamic ? '#EF4444' : '#000000')} onChange={(e) => {
                              const next = elements.map(el => el.id === selectedId ? { ...el, fill: e.target.value } : el); setElements(next);
                            }} />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Taille de police</label>
                          <input 
                            type="number" 
                            className="w-full bg-[#23262F] border border-[#353945] rounded-lg p-2 text-white text-sm" 
                            value={elements.find(el => el.id === selectedId)?.fontSize || 24} 
                            onChange={(e) => {
                              const next = elements.map(el => el.id === selectedId ? { ...el, fontSize: parseInt(e.target.value) || 12 } : el);
                              setElements(next);
                            }} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Remplissage</label>
                          <div className="flex items-center gap-2 mb-2">
                            <button 
                              onClick={() => {
                                const next = elements.map(el => el.id === selectedId ? { ...el, gradientEnabled: false } : el);
                                setElements(next);
                              }}
                              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition ${!elements.find(el => el.id === selectedId)?.gradientEnabled ? 'bg-primary border-primary text-white' : 'bg-[#23262F] border-[#353945] text-gray-400'}`}
                            >
                              UNI
                            </button>
                            <button 
                              onClick={() => {
                                const next = elements.map(el => el.id === selectedId ? { ...el, gradientEnabled: true } : el);
                                setElements(next);
                              }}
                              className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition ${elements.find(el => el.id === selectedId)?.gradientEnabled ? 'bg-primary border-primary text-white' : 'bg-[#23262F] border-[#353945] text-gray-400'}`}
                            >
                              DÉGRADÉ
                            </button>
                          </div>
                          
                          {!elements.find(el => el.id === selectedId)?.gradientEnabled ? (
                            <input type="color" className="w-full h-9 bg-transparent border-none p-0 cursor-pointer" value={elements.find(el => el.id === selectedId)?.fill || '#3772FF'} onChange={(e) => {
                              const next = elements.map(el => el.id === selectedId ? { ...el, fill: e.target.value } : el); setElements(next);
                            }} />
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              <input type="color" className="w-full h-9 bg-transparent border-none p-0 cursor-pointer" value={elements.find(el => el.id === selectedId)?.gradientColor1 || '#ffffff'} onChange={(e) => {
                                const next = elements.map(el => el.id === selectedId ? { ...el, gradientColor1: e.target.value } : el); setElements(next);
                              }} />
                              <input type="color" className="w-full h-9 bg-transparent border-none p-0 cursor-pointer" value={elements.find(el => el.id === selectedId)?.gradientColor2 || '#3772FF'} onChange={(e) => {
                                const next = elements.map(el => el.id === selectedId ? { ...el, gradientColor2: e.target.value } : el); setElements(next);
                              }} />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Bordure</label>
                            <input type="color" className="w-full h-9 bg-transparent border-none p-0 cursor-pointer" value={elements.find(el => el.id === selectedId)?.stroke || '#000000'} onChange={(e) => {
                              const next = elements.map(el => el.id === selectedId ? { ...el, stroke: e.target.value } : el); setElements(next);
                            }} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Épaisseur</label>
                            <input type="number" min="0" max="20" className="w-full bg-[#23262F] border border-[#353945] rounded-lg p-2 text-white text-sm" value={elements.find(el => el.id === selectedId)?.strokeWidth || 0} onChange={(e) => {
                              const next = elements.map(el => el.id === selectedId ? { ...el, strokeWidth: parseInt(e.target.value) || 0 } : el); setElements(next);
                            }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-4 uppercase">Arrière-plan du canevas</label>
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setGradientEnabled(false)} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition ${!gradientEnabled ? 'bg-primary border-primary text-white' : 'bg-[#23262F] border-[#353945] text-gray-400'}`}>COULEUR UNIE</button>
                  <button onClick={() => setGradientEnabled(true)} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition ${gradientEnabled ? 'bg-primary border-primary text-white' : 'bg-[#23262F] border-[#353945] text-gray-400'}`}>DÉGRADÉ</button>
                </div>
                
                {!gradientEnabled ? (
                  <input type="color" className="w-full h-12 bg-transparent border-none p-0 cursor-pointer rounded-xl" value={canvasBg} onChange={(e) => setCanvasBg(e.target.value)} />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <input type="color" className="w-full h-12 bg-transparent border-none p-0 cursor-pointer" value={gradientColors[0]} onChange={(e) => setGradientColors([e.target.value, gradientColors[1]])} />
                    <input type="color" className="w-full h-12 bg-transparent border-none p-0 cursor-pointer" value={gradientColors[1]} onChange={(e) => setGradientColors([gradientColors[0], e.target.value])} />
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-[#23262F] rounded-2xl border border-[#353945] text-center">
                <FiMaximize size={24} className="mx-auto mb-2 text-primary opacity-50" />
                <p className="text-[11px] text-gray-400">Glissez-déposez n'importe quel élément pour commencer. Vous pouvez créer votre affiche sans image de fond en utilisant les couleurs et formes ci-dessus.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
