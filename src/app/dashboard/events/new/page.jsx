'use client';

import React, { useState } from 'react';
import PosterEditor from '@/components/canvas/PosterEditor';
import cn from 'classnames';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AppLink from '@/components/AppLink';
import FullPageLoader from '@/components/FullPageLoader';
import { 
  FiArrowLeft, FiCalendar, FiClock, FiPlus, FiTrash2, 
  FiDollarSign, FiTag, FiLayers, FiUser, 
  FiFileText, FiSmartphone, FiBriefcase, FiMapPin, FiPhone, FiArrowRight
} from 'react-icons/fi';
import { BsQrCode, BsStars, BsShieldCheck } from 'react-icons/bs';

export default function NewEventPage() {
  const [name, setName] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [paymentNumber, setPaymentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [attendanceDays, setAttendanceDays] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sessionsPerDay, setSessionsPerDay] = useState(1);
  const [sessionConfig, setSessionConfig] = useState([{ id: 1, name: 'Session 1', time: '08:00' }]);
  const [activeTab, setActiveTab] = useState(1);
  const router = useRouter();

  const handleSessionsChange = (count) => {
    const n = parseInt(count);
    setSessionsPerDay(n);
    const newConfig = Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      name: `Session ${i + 1}`,
      time: sessionConfig[i]?.time || '08:00'
    }));
    setSessionConfig(newConfig);
  };

  const updateSessionTime = (id, time) => {
    setSessionConfig(sessionConfig.map(s => s.id === id ? { ...s, time } : s));
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    if (e < s) return 1;
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (type, val) => {
    const todayStr = getTodayString();
    if (type === 'start') {
      if (val && val < todayStr) {
        toast.error('La date de début ne peut pas être une date passée');
        setStartDate(todayStr);
        if (endDate && endDate < todayStr) {
          setEndDate(todayStr);
        }
        setAttendanceDays(calculateDays(todayStr, endDate || todayStr));
        return;
      }
      setStartDate(val);
      if (endDate && val && new Date(endDate) < new Date(val)) {
        setEndDate(val);
        setAttendanceDays(1);
      } else {
        setAttendanceDays(calculateDays(val, endDate));
      }
    } else {
      if (val && val < todayStr) {
        toast.error('La date de fin ne peut pas être une date passée');
        setEndDate(todayStr);
        return;
      }
      if (startDate && val && new Date(val) < new Date(startDate)) {
        toast.error('La date de fin ne peut pas être antérieure à la date de début');
        setEndDate(startDate);
        setAttendanceDays(1);
      } else {
        setEndDate(val);
        setAttendanceDays(calculateDays(startDate, val));
      }
    }
  };

  const addField = (preset = null) => {
    const newId = Date.now();
    let newField = { 
      id: newId, 
      name: `field_${newId}`, 
      label: '', 
      type: 'text', 
      required: true, 
      options: '' 
    };

    if (preset === 'company') {
      newField.label = "Nom de l'entreprise / Organisation";
      newField.name = "company";
    } else if (preset === 'jobTitle') {
      newField.label = "Fonction / Poste";
      newField.name = "job_title";
    } else if (preset === 'phone') {
      newField.label = "Numéro de Téléphone";
      newField.name = "phone";
    } else if (preset === 'city') {
      newField.label = "Ville / Pays";
      newField.name = "city";
    } else if (preset === 'tshirt') {
      newField.label = "Taille T-Shirt";
      newField.type = "select";
      newField.options = "S, M, L, XL, XXL";
      newField.name = "tshirt_size";
    }

    setCustomFields([...customFields, newField]);
  };

  const removeField = (id) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const updateField = (id, updates) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const goToStep2 = () => {
    if (!name.trim()) {
      toast.error('Veuillez saisir le nom de l\'événement pour continuer');
      return;
    }
    const todayStr = getTodayString();
    if (startDate && startDate < todayStr) {
      toast.error('La date de début ne peut pas être une date passée');
      return;
    }
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      toast.error('La date de fin ne peut pas être antérieure à la date de début');
      return;
    }
    if (isPaid && (!price || parseFloat(price) < 200)) {
      toast.error('Pour un événement payant, le tarif minimum requis par le paiement en ligne est de 200 FCFA');
      return;
    }
    setActiveTab(2);
  };

  const goToStep3 = () => {
    setActiveTab(3);
  };

  const handleSave = async ({ backgroundImageUrl, zones, designWidth, designHeight }) => {
    if (!name.trim()) {
      toast.error('Veuillez donner un nom à l\'événement');
      setActiveTab(1);
      return;
    }
    const todayStr = getTodayString();
    if (startDate && startDate < todayStr) {
      toast.error('La date de début ne peut pas être une date passée');
      setActiveTab(1);
      return;
    }
    if (isPaid && (!price || parseFloat(price) < 200)) {
      toast.error('Pour une invitation payante, le tarif minimum requis est de 200 FCFA');
      setActiveTab(1);
      return;
    }
    if (!backgroundImageUrl) {
      toast.error('Veuillez uploader une image de fond pour le badge');
      setActiveTab(3);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          backgroundImageUrl,
          zones,
          designWidth,
          designHeight,
          isPaid,
          price: isPaid ? parseFloat(price) || 0 : 0,
          paymentNumber: isPaid ? paymentNumber : '',
          customFields: JSON.stringify(customFields),
          attendanceDays: parseInt(attendanceDays) || 1,
          startDate,
          endDate,
          sessionsPerDay,
          sessionConfig: JSON.stringify(sessionConfig),
        }),
      });

      if (res.ok) {
        toast.success('Événement créé avec succès !');
        router.push('/dashboard/events');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* 1. COMPACT HEADER & STEPPER TABS */}
      <div className="relative bg-gradient-to-r from-[#0B1736] via-[#1E293B] to-[#0B1736] py-4 px-6 sm:px-8 rounded-[24px] text-white shadow-xl overflow-hidden border border-slate-700/50">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#3B52E8]/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#FF6500]/15 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AppLink 
                href="/dashboard/events"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-all backdrop-blur-md"
              >
                <FiArrowLeft size={13} /> <span>Mes Événements</span>
              </AppLink>
              <span className="text-slate-500">•</span>
              <span className="text-[10px] font-semibold text-[#FF6500] uppercase tracking-wider flex items-center gap-1">
                <BsStars size={12} /> Étape {activeTab} sur 3
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeTab === 1 && "Étape 1 : Informations Générales"}
              {activeTab === 2 && "Étape 2 : Formulaire de Collecte & Sessions"}
              {activeTab === 3 && "Étape 3 : Conception Visuelle du Pass HD"}
            </h1>
          </div>

          {/* Stepper Tabs Nav */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700/60 backdrop-blur-xl shrink-0">
            <button
              onClick={() => setActiveTab(1)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer",
                activeTab === 1 
                  ? "bg-[#3B52E8] text-white shadow-md shadow-[#3B52E8]/30" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Général</span>
            </button>
            <button
              onClick={() => goToStep2()}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer",
                activeTab === 2 
                  ? "bg-[#3B52E8] text-white shadow-md shadow-[#3B52E8]/30" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Formulaire</span>
            </button>
            <button
              onClick={() => {
                if (!name.trim()) {
                  toast.error('Veuillez d\'abord saisir le nom de l\'événement');
                  return;
                }
                setActiveTab(3);
              }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-black transition-all cursor-pointer",
                activeTab === 3 
                  ? "bg-[#FF6500] text-white shadow-md shadow-[#FF6500]/30" 
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )}
            >
              <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Pass HD</span>
            </button>
          </div>
        </div>
      </div>

      {/* STEP 1: INFORMATIONS GÉNÉRALES DE L'ÉVÉNEMENT */}
      {activeTab === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-200/80 shadow-sm space-y-7 animate-in fade-in duration-300">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-[#3B52E8]/10 text-[#3B52E8] flex items-center justify-center font-bold">
                 <FiCalendar size={20} />
               </div>
               <div>
                 <h3 className="text-lg font-black text-slate-900 tracking-tight">Paramètres Principaux</h3>
                 <p className="text-xs text-slate-500 font-medium">Nom, dates et conditions de tarif</p>
               </div>
             </div>
          </div>

          {/* Nom de l'événement */}
          <div className="space-y-2">
             <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
               Nom de l'événement <span className="text-rose-500">*</span>
             </label>
             <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#3B52E8]">
                 <FiTag size={18} />
               </div>
               <input 
                 type="text" 
                 value={name} 
                 onChange={(e) => setName(e.target.value)}
                 placeholder="ex: Gala d'Excellence 2026, Conférence Tech, Mariage..."
                 className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] py-3.5 pl-11 pr-4 text-sm font-semibold text-slate-900 outline-none transition-all focus:bg-white focus:border-[#3B52E8] focus:ring-4 focus:ring-[#3B52E8]/10"
                 required
               />
             </div>
          </div>

          {/* Dates Début & Fin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-end">
             <div className="space-y-2">
               <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                 Date de Début
               </label>
                <input 
                  type="date" 
                  value={startDate} 
                  min={getTodayString()}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] py-3 px-4 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#3B52E8]"
                />
             </div>

             <div className="space-y-2">
               <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                 Date de Fin
               </label>
                <input 
                  type="date" 
                  value={endDate} 
                  min={startDate || undefined}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] py-3 px-4 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-[#3B52E8]"
                />
             </div>

             {/* Durée Calculée Card */}
             <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#3B52E8] block">Durée Totale</span>
                  <span className="text-xl font-black text-slate-900">{attendanceDays} Jour{attendanceDays > 1 ? 's' : ''}</span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-[#3B52E8] text-white flex items-center justify-center font-black shadow-sm">
                  <FiClock size={16} />
                </div>
             </div>
          </div>

          {/* Option Gratuit / Payant */}
          <div className="pt-4 border-t border-slate-100 space-y-5">
             <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/80">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-[#FF6500] flex items-center justify-center font-bold">
                     <FiDollarSign size={20} />
                   </div>
                   <div>
                     <h4 className="text-sm font-black text-slate-900">Événement Payant / Billetterie</h4>
                     <p className="text-xs text-slate-500 font-medium">Exiger un règlement Mobile Money avant la livraison du pass</p>
                   </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isPaid} 
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsPaid(checked);
                      if (checked && (!price || parseFloat(price) < 200)) {
                        setPrice(500);
                      }
                    }} 
                    className="sr-only peer" 
                  />
                  <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6500]"></div>
                </label>
             </div>

             {/* Inputs pour événement payant */}
             {isPaid && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-5 rounded-xl bg-amber-50/50 border border-amber-200/80 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                     <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                       Tarif du Pass (FCFA) <span className="text-rose-500">*</span>
                     </label>
                     <input 
                       type="number" 
                       min="200"
                       step="50"
                       value={price} 
                       onChange={(e) => setPrice(e.target.value)}
                       placeholder="ex: 5000 (min 200 FCFA)"
                       className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-bold text-slate-900 outline-none focus:border-[#FF6500]"
                     />
                     <p className="text-[11px] text-slate-500 font-medium">
                       Montant minimum requis par SasPay : <span className="font-bold text-slate-700">200 FCFA</span>
                     </p>
                  </div>
                  <div className="space-y-1.5">
                     <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                       Numéro Mobile Money (Encaissement)
                     </label>
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                         <FiSmartphone size={16} />
                       </div>
                       <input 
                         type="text" 
                         value={paymentNumber} 
                         onChange={(e) => setPaymentNumber(e.target.value)}
                         placeholder="ex: +225 0700000000"
                         className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-xs font-bold text-slate-900 outline-none focus:border-[#FF6500]"
                       />
                     </div>
                  </div>
               </div>
             )}
          </div>

          {/* Action Next Step */}
          <div className="pt-4 flex justify-end border-t border-slate-100">
            <button
              type="button"
              onClick={goToStep2}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3B52E8] hover:bg-[#2b40c7] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-95"
            >
              <span>Suivant : Formulaire de collecte</span>
              <FiArrowRight size={16} />
            </button>
          </div>

        </div>
      )}

      {/* STEP 2: SESSIONS & FORMULAIRE DE COLLECTE INVITÉS */}
      {activeTab === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-slate-200/80 shadow-sm space-y-7 animate-in fade-in duration-300">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-[#FF6500] flex items-center justify-center font-bold">
                 <FiLayers size={20} />
               </div>
               <div>
                 <h3 className="text-lg font-black text-slate-900 tracking-tight">Formulaire & Horaires</h3>
                 <p className="text-xs text-slate-500 font-medium">Informations demandées aux invités et sous-sessions</p>
               </div>
             </div>
          </div>

          {/* Sessions par jour */}
          <div className="space-y-4">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900">Sessions journalières</h4>
                  <p className="text-xs text-slate-500 font-medium">Heures des sous-créneaux par jour d'événement</p>
                </div>

                <select 
                  value={sessionsPerDay}
                  onChange={(e) => handleSessionsChange(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-[#F8FAFC] py-2 px-4 text-xs font-extrabold text-slate-900 outline-none focus:border-[#3B52E8] cursor-pointer"
                >
                  <option value="1">1 session par jour</option>
                  <option value="2">2 sessions par jour</option>
                  <option value="3">3 sessions par jour</option>
                </select>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               {sessionConfig.map((session) => (
                 <div key={session.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200/80 space-y-1.5">
                   <label className="block text-[10px] font-black uppercase text-slate-500">
                     Heure {session.name}
                   </label>
                   <input 
                     type="time" 
                     value={session.time}
                     onChange={(e) => updateSessionTime(session.id, e.target.value)}
                     className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-900 outline-none focus:border-[#3B52E8]"
                   />
                 </div>
               ))}
             </div>
          </div>

          {/* Formulaire de collecte personnalisée */}
          <div className="pt-5 border-t border-slate-100 space-y-5">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900">Champs requis pour les Invités</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    (Le Nom Complet et le Téléphone sont déjà inclus par défaut)
                  </p>
                </div>

                <button 
                  onClick={() => addField()}
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-[#3B52E8]/10 hover:bg-[#3B52E8] text-[#3B52E8] hover:text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <FiPlus size={15} /> <span>+ Ajouter un champ</span>
                </button>
             </div>

             {/* Preset Chips */}
             <div className="space-y-1.5">
               <span className="text-[10px] font-black uppercase text-slate-400 block">Modèles rapides :</span>
               <div className="flex flex-wrap items-center gap-2">
                 <button
                   type="button"
                   onClick={() => addField('company')}
                   className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#3B52E8]/10 text-slate-700 hover:text-[#3B52E8] text-xs font-bold transition-all flex items-center gap-1 border border-slate-200/60"
                 >
                   <FiBriefcase size={13} /> + Entreprise
                 </button>
                 <button
                   type="button"
                   onClick={() => addField('jobTitle')}
                   className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#3B52E8]/10 text-slate-700 hover:text-[#3B52E8] text-xs font-bold transition-all flex items-center gap-1 border border-slate-200/60"
                 >
                   <FiUser size={13} /> + Fonction
                 </button>
                 <button
                   type="button"
                   onClick={() => addField('phone')}
                   className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#3B52E8]/10 text-slate-700 hover:text-[#3B52E8] text-xs font-bold transition-all flex items-center gap-1 border border-slate-200/60"
                 >
                   <FiPhone size={13} /> + Téléphone
                 </button>
                 <button
                   type="button"
                   onClick={() => addField('city')}
                   className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#3B52E8]/10 text-slate-700 hover:text-[#3B52E8] text-xs font-bold transition-all flex items-center gap-1 border border-slate-200/60"
                 >
                   <FiMapPin size={13} /> + Ville
                 </button>
                 <button
                   type="button"
                   onClick={() => addField('tshirt')}
                   className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#3B52E8]/10 text-slate-700 hover:text-[#3B52E8] text-xs font-bold transition-all flex items-center gap-1 border border-slate-200/60"
                 >
                   <FiTag size={13} /> + Taille T-Shirt
                 </button>
               </div>
             </div>

             {/* Custom Fields List */}
             <div className="space-y-3">
               {customFields.map((field, idx) => (
                 <div key={field.id} className="flex flex-wrap items-end gap-3 p-4 bg-[#F8FAFC] rounded-xl border border-slate-200/80 animate-in slide-in-from-left-4 duration-300">
                   
                   <div className="flex-1 min-w-[180px]">
                     <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">
                       Champ #{idx + 1} - Intitulé
                     </label>
                     <input 
                       type="text" 
                       value={field.label}
                       onChange={(e) => updateField(field.id, { label: e.target.value })}
                       placeholder="ex: Nom de l'entreprise, Taille T-Shirt..."
                       className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-900 outline-none focus:border-[#3B52E8]"
                     />
                   </div>
                   
                   <div className="w-40">
                     <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">Type de Saisie</label>
                     <select 
                       value={field.type}
                       onChange={(e) => updateField(field.id, { type: e.target.value })}
                       className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-900 outline-none focus:border-[#3B52E8]"
                     >
                       <option value="text">Texte Libre</option>
                       <option value="number">Nombre</option>
                       <option value="checkbox">Case à Cocher</option>
                       <option value="select">Menu Déroulant</option>
                     </select>
                   </div>

                   {field.type === 'select' && (
                     <div className="flex-1 min-w-[180px]">
                       <label className="mb-1 block text-[10px] font-black uppercase text-slate-500">Options (séparées par virgules)</label>
                       <input 
                         type="text" 
                         value={field.options}
                         onChange={(e) => updateField(field.id, { options: e.target.value })}
                         placeholder="Option A, Option B..."
                         className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-slate-900 outline-none focus:border-[#3B52E8]"
                       />
                     </div>
                   )}

                   <div className="flex items-center gap-2 h-[36px] px-1">
                     <label className="flex items-center gap-1.5 cursor-pointer select-none">
                       <input 
                         type="checkbox" 
                         checked={field.required} 
                         onChange={(e) => updateField(field.id, { required: e.target.checked })} 
                         className="rounded text-[#3B52E8] focus:ring-0 w-4 h-4" 
                       />
                       <span className="text-xs font-bold text-slate-700">Obligatoire</span>
                     </label>
                   </div>

                   <button 
                     onClick={() => removeField(field.id)}
                     type="button"
                     className="w-9 h-9 flex items-center justify-center text-rose-500 hover:bg-rose-100 rounded-lg transition cursor-pointer"
                     title="Supprimer"
                   >
                     <FiTrash2 size={16} />
                   </button>
                 </div>
               ))}

               {customFields.length === 0 && (
                 <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-[#F8FAFC]/50 text-slate-400 space-y-2">
                   <div className="w-10 h-10 bg-white rounded-xl mx-auto flex items-center justify-center text-slate-300 shadow-xs">
                     <FiFileText size={20} />
                   </div>
                   <p className="text-xs font-bold text-slate-600">Aucun champ personnalisé ajouté</p>
                   <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                     Utilisez les boutons ci-dessus pour ajouter des champs spécifiques.
                   </p>
                 </div>
               )}
             </div>
          </div>

          {/* Action Next Step */}
          <div className="pt-4 flex justify-between items-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <FiArrowLeft size={15} /> <span>Retour</span>
            </button>

            <button
              type="button"
              onClick={goToStep3}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6500] hover:bg-[#e05900] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#FF6500]/20 hover:scale-[1.01] active:scale-95"
            >
              <span>Suivant : Conception Pass Visuel</span>
              <FiArrowRight size={16} />
            </button>
          </div>

        </div>
      )}

      {/* STEP 3: DESIGNER VISUEL DU BADGE / PASS QR CODE */}
      {activeTab === 3 && (
        <div className="bg-gradient-to-b from-[#0B1736] to-[#0A0F1D] p-6 sm:p-8 rounded-[28px] text-white shadow-2xl border border-slate-800 space-y-5 animate-in fade-in duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/60 gap-4">
             <div className="flex items-center gap-3">
               <button 
                 type="button"
                 onClick={() => setActiveTab(2)}
                 className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                 title="Retour à l'étape 2"
               >
                 <FiArrowLeft size={18} />
               </button>
               <div>
                 <h3 className="text-lg font-black uppercase tracking-tight text-white">Étape 3 : Studio Pass Visuel & Badging</h3>
                 <p className="text-xs text-slate-300 font-medium">Ajustez votre image de fond, QR Code et zones de texte dynamiques</p>
               </div>
             </div>

             <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-amber-300 border border-amber-300/20 backdrop-blur-md self-start sm:self-auto">
               <BsShieldCheck size={15} /> <span>Haute Définition 300 DPI</span>
             </div>
          </div>

          {/* Poster Editor Canvas Container */}
          <div className="min-h-[720px] max-w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#0A0F1D] shadow-inner">
            <PosterEditor 
              onSave={handleSave} 
              loading={loading} 
              customFields={customFields}
              saveText="Finaliser & Créer l'Événement"
            />
          </div>
        </div>
      )}

      {/* Full Screen Loading Spinner overlay */}
      {loading && <FullPageLoader message="Enregistrement et génération du pass en cours..." />}
    </div>
  );
}
