'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  FiCamera, FiCheckCircle, FiXCircle, FiRefreshCw, FiUsers, 
  FiClock, FiCalendar, FiChevronLeft, FiLogOut, FiSearch, 
  FiUserPlus, FiUser, FiPhone, FiPlus, FiCheck, FiActivity, FiZap, FiChevronDown, FiWifiOff, FiWifi, FiEdit3
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Loader from '@/components/Loader';
import cn from 'classnames';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function StandaloneScanner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncQueue, setSyncQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [manualSessionKey, setManualSessionKey] = useState(null);
  const [lastScanned, setLastScanned] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  
  // Tabs & Search
  const [activeTab, setActiveTab] = useState('scanner');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Dynamic Form State
  const [formData, setFormData] = useState({ name: '', phone: '', additionalData: {} });
  const [submittingGuest, setSubmittingGuest] = useState(false);
  
  const scannerRef = useRef(null);

  // 1. Monitor Connectivity & Hydrate
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    const savedQueue = localStorage.getItem('scan_sync_queue');
    if (savedQueue) {
      try { setSyncQueue(JSON.parse(savedQueue)); } catch (e) {}
    }

    if (!navigator.onLine) {
      const lastEvent = localStorage.getItem('last_scan_event');
      const lastGuests = localStorage.getItem('last_scan_guests');
      if (lastEvent && lastGuests) {
        setSelectedEvent(JSON.parse(lastEvent));
        setGuests(JSON.parse(lastGuests));
        setLoading(false);
      }
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('scan_sync_queue', JSON.stringify(syncQueue));
  }, [syncQueue]);

  useEffect(() => {
    if (selectedEvent && guests.length > 0) {
      localStorage.setItem('last_scan_event', JSON.stringify(selectedEvent));
      localStorage.setItem('last_scan_guests', JSON.stringify(guests));
    }
  }, [selectedEvent, guests]);

  // 2. Fetch Data
  useEffect(() => {
    if (status === 'authenticated' && isOnline) {
      fetchEvents();
    } else if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, isOnline]);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/scan/events');
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
        localStorage.setItem('scan_events_list', JSON.stringify(data));
      }
    } catch (error) {
      const saved = localStorage.getItem('scan_events_list');
      if (saved) setEvents(JSON.parse(saved));
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!selectedEvent || !isOnline) return;
    fetchGuests();
  }, [selectedEvent, isOnline]);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}/guests`);
      const data = await res.json();
      if (res.ok) {
        setGuests(data.map(g => ({
          ...g,
          attendanceMap: JSON.parse(g.attendance || '{}')
        })));
      }
    } catch (error) { toast.error('Mode hors-ligne activé'); } finally { setLoading(false); }
  };

  // 3. Configuration Parsers
  const eventCustomFields = useMemo(() => {
    if (!selectedEvent) return [];
    try { return JSON.parse(selectedEvent.customFields || '[]'); } catch (e) { return []; }
  }, [selectedEvent]);

  const availableSessions = useMemo(() => {
    if (!selectedEvent) return [];
    const sessions = [];
    const config = JSON.parse(selectedEvent.sessionConfig || '[]');
    for (let d = 1; d <= selectedEvent.attendanceDays; d++) {
      config.forEach(s => {
        sessions.push({ key: `d${d}s${s.id}`, label: `Jour ${d} - ${s.name}`, day: d, name: s.name });
      });
    }
    return sessions;
  }, [selectedEvent]);

  const activeSessionKey = manualSessionKey || currentSession?.key;

  useEffect(() => {
    if (!selectedEvent) return;
    const updateSession = () => {
      const now = new Date();
      const start = new Date(selectedEvent.startDate);
      const diffTime = now - start;
      const dayNum = Math.ceil((diffTime + 1) / (1000 * 60 * 60 * 24));
      const config = JSON.parse(selectedEvent.sessionConfig || '[]');
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      let session = config[0];
      for (const s of config) if (timeStr >= s.time) session = s;
      setCurrentSession({ day: dayNum, name: session?.name || 'S1', key: `d${dayNum}s${session?.id || 1}` });
    };
    updateSession();
    const timer = setInterval(updateSession, 60000);
    return () => clearInterval(timer);
  }, [selectedEvent]);

  // 4. Scanner Logic
  useEffect(() => {
    if (loading || !selectedEvent || activeTab !== 'scanner') {
       if (scannerRef.current) scannerRef.current.clear().catch(() => {});
       return;
    }
    const scanner = new Html5QrcodeScanner("reader-standalone", { 
      fps: 15, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0, showTorchButtonIfSupported: true, videoConstraints: { facingMode: "environment" }
    });
    scanner.render(onScanSuccess, () => {});
    scannerRef.current = scanner;
    return () => { if (scannerRef.current) scannerRef.current.clear().catch(() => {}); };
  }, [loading, selectedEvent, activeTab]);

  const onScanSuccess = (decodedText) => {
    if (lastScanned?.id === decodedText && Date.now() - lastScanned.time < 3000) return; 
    markGuestPresent(decodedText);
  };

  const markGuestPresent = (guestId) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest || !activeSessionKey) {
      toast.error(guest ? 'Sélectionnez une session' : 'Inconnu');
      return;
    }
    if (guest.attendanceMap[activeSessionKey]) {
      setLastScanned({ id: guestId, name: guest.name, time: Date.now(), status: 'ALREADY_PRESENT' });
      return;
    }
    const updatedGuests = guests.map(g => g.id === guestId ? { ...g, attendanceMap: { ...g.attendanceMap, [activeSessionKey]: true } } : g);
    setGuests(updatedGuests);
    setSyncQueue(prev => [...prev, { guestId, sessionKey: activeSessionKey, timestamp: Date.now() }]);
    setLastScanned({ id: guestId, name: guest.name, time: Date.now(), status: 'SUCCESS' });
    toast.success(`${guest.name} ✅`);
  };

  // 5. Form Submission
  const handleAddGuest = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) { toast.error('Nom et Téléphone obligatoires'); return; }

    const payload = {
      eventId: selectedEvent.id,
      name: formData.name,
      phone: formData.phone,
      additionalData: JSON.stringify(formData.additionalData),
      saveToCloud: false
    };

    if (!isOnline) {
       const tempId = `temp_${Date.now()}`;
       setGuests(prev => [{ id: tempId, ...payload, attendanceMap: {}, isOffline: true }, ...prev]);
       setShowAddModal(false);
       setFormData({ name: '', phone: '', additionalData: {} });
       toast.warning('Enregistré localement');
       return;
    }

    setSubmittingGuest(true);
    try {
       const res = await fetch('/api/guests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
       });
       if (res.ok) {
          toast.success('Ajouté');
          setShowAddModal(false);
          setFormData({ name: '', phone: '', additionalData: {} });
          fetchGuests();
       } else {
          const data = await res.json();
          toast.error(data.error || 'Erreur');
       }
    } catch (error) { toast.error('Erreur réseau'); } finally { setSubmittingGuest(false); }
  };

  // 6. Sync Loop
  useEffect(() => {
    if (syncQueue.length === 0 || isSyncing || !isOnline || !selectedEvent) return;
    const sync = async () => {
      setIsSyncing(true);
      try {
        const res = await fetch(`/api/events/${selectedEvent.id}/attendance`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(syncQueue[0])
        });
        if (res.ok) setSyncQueue(prev => prev.slice(1));
      } catch (e) {} finally { setIsSyncing(false); }
    };
    const timer = setTimeout(sync, 2000);
    return () => clearTimeout(timer);
  }, [syncQueue, isSyncing, isOnline, selectedEvent]);

  const filteredGuests = guests.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()) || (g.phone && g.phone.includes(searchQuery)));

  if (status === 'loading' || (loading && !selectedEvent)) return <div className="flex h-screen items-center justify-center bg-white"><Loader /></div>;

  // --- View 1: Event Selection ---
  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 relative overflow-hidden font-sans">
        <div className="max-w-2xl mx-auto space-y-16 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-[20px] flex items-center justify-center text-white font-black shadow-2xl ring-4 ring-white">I</div>
               <div>
                  <h1 className="text-3xl font-black tracking-tighter text-slate-900">Scanner Pro</h1>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <FiUser className="text-primary" /> {session?.user?.name}
                  </p>
               </div>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="group w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-white transition-all duration-300 shadow-xl"
            >
              <FiLogOut />
            </button>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Événements Actifs</h2>
              <div className={cn("px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2", isOnline ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100")}>
                 {isOnline ? <FiWifi /> : <FiWifiOff />} {isOnline ? 'En Ligne' : 'Hors-Ligne'}
              </div>
            </div>
            
            <div className="grid gap-6">
              {events.length > 0 ? events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="group relative bg-white hover:bg-slate-50 border border-slate-100 hover:border-primary/30 p-10 rounded-[40px] text-left transition-all duration-500 overflow-hidden shadow-xl hover:shadow-2xl"
                >
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black group-hover:text-primary transition-colors tracking-tight text-slate-800">{event.name}</h3>
                      <div className="flex flex-wrap items-center gap-6 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                         <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100"><FiCalendar className="text-primary" /> {new Date(event.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg ring-1 ring-primary/10">
                       <FiCamera size={24} />
                    </div>
                  </div>
                </button>
              )) : (
                <div className="py-24 text-center bg-white rounded-[48px] border-2 border-dashed border-slate-100">
                   <FiActivity size={48} className="text-slate-100 mx-auto mb-6" />
                   <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Aucun événement disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- View 2: Scanner UI ---
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <div className="px-6 py-8 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-2xl sticky top-0 z-[100] shadow-sm">
         <button onClick={() => setSelectedEvent(null)} className="flex items-center gap-3 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] hover:text-slate-900 transition-all">
           <FiChevronLeft size={16} /> Retour
         </button>
         <div className="text-right">
            <div className={cn("px-3 py-1 rounded-full font-black uppercase tracking-[0.3em] text-[8px] flex items-center gap-2 border inline-flex", isOnline ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100")}>
               {isOnline ? 'Connecté' : 'Hors-Ligne'}
            </div>
            <div className="text-sm font-black tracking-tight text-slate-800 mt-1">{selectedEvent.name}</div>
         </div>
      </div>

      <div className="flex-1 p-6 flex flex-col max-w-lg mx-auto w-full gap-8 relative z-10">
        {/* Session Selector */}
        <div className="relative">
           <select value={activeSessionKey || ''} onChange={(e) => setManualSessionKey(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[28px] py-5 pl-16 pr-12 text-xs font-black uppercase tracking-[0.2em] appearance-none focus:ring-4 focus:ring-primary/5 transition-all text-slate-700 shadow-sm">
              {availableSessions.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
           </select>
           <FiClock className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" />
           <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Tabs */}
        <div className="flex p-1.5 bg-slate-50 rounded-[24px] border border-slate-100 shadow-inner">
           <button onClick={() => setActiveTab('scanner')} className={cn("flex-1 py-4 rounded-[18px] font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500", activeTab === 'scanner' ? "bg-white text-primary shadow-lg" : "text-slate-400")}>Scanner</button>
           <button onClick={() => setActiveTab('manual')} className={cn("flex-1 py-4 rounded-[18px] font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500", activeTab === 'manual' ? "bg-white text-primary shadow-lg" : "text-slate-400")}>Recherche</button>
        </div>

        {activeTab === 'scanner' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl flex items-center justify-between">
               <div className="space-y-1">
                 <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">Session active</p>
                 <h3 className="text-3xl font-black text-slate-800">{currentSession?.name || '---'}</h3>
               </div>
               <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 text-xl font-black">J{currentSession?.day || '-'}</div>
            </div>
            <div className="relative aspect-square">
               <div className="absolute -inset-4 border-primary/30 border-2 rounded-[60px] pointer-events-none opacity-50" />
               <div className="relative bg-slate-100 rounded-[48px] overflow-hidden border-4 border-white shadow-2xl w-full h-full">
                 <div id="reader-standalone" className="w-full h-full"></div>
                 {activeTab === 'scanner' && <div className="absolute inset-x-0 h-1 bg-primary/50 shadow-[0_0_15px_rgba(68,55,255,0.5)] animate-scan-line z-10" />}
                 {lastScanned && Date.now() - lastScanned.time < 2000 && (
                   <div className={cn("absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in duration-300 z-50", lastScanned.status === 'SUCCESS' ? "bg-green-50/60" : "bg-red-50/60")}>
                      <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white text-white", lastScanned.status === 'SUCCESS' ? "bg-green-500" : "bg-red-500")}>
                         {lastScanned.status === 'SUCCESS' ? <FiCheck size={40} /> : <FiXCircle size={40} />}
                      </div>
                      <div className="text-2xl font-black text-slate-800 text-center px-10">{lastScanned.name || 'Inconnu'}</div>
                   </div>
                 )}
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
             <div className="relative">
                <FiSearch className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-300 text-xl" />
                <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-[32px] py-7 pl-18 pr-8 text-base font-bold shadow-sm" />
             </div>
             <div className="space-y-4 max-h-[45vh] overflow-y-auto custom-scrollbar pr-3">
                {filteredGuests.map(guest => {
                   const isPresent = guest.attendanceMap[activeSessionKey];
                   return (
                     <div key={guest.id} className="bg-white border border-slate-100 p-6 rounded-[32px] flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-5">
                           <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden relative">
                              {guest.photoUrl ? <img src={guest.photoUrl} className="w-full h-full object-cover" /> : <FiUser size={24} />}
                              {isPresent && <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center"><FiCheck className="text-green-600" /></div>}
                           </div>
                           <div><h4 className="text-base font-black text-slate-800">{guest.name}</h4><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{guest.phone || '-'}</p></div>
                        </div>
                        <button disabled={isPresent} onClick={() => markGuestPresent(guest.id)} className={cn("w-12 h-12 rounded-[20px] flex items-center justify-center shadow-lg transition-all", isPresent ? "bg-green-50 text-green-500" : "bg-primary text-white active:scale-95")}>
                           {isPresent ? <FiCheck /> : <FiUserPlus />}
                        </button>
                     </div>
                   );
                })}
             </div>
          </div>
        )}

        {/* Floating Action Button for Add */}
        <div className="grid grid-cols-2 gap-5 mt-auto pb-6">
           <div className="bg-white rounded-[32px] p-7 border border-slate-100 shadow-xl">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-3">Présents</p>
              <div className="flex items-baseline gap-3"><span className="text-4xl font-black text-slate-800">{guests.filter(g => g.attendanceMap[activeSessionKey]).length}</span><span className="text-xs text-slate-400 font-black tracking-widest">/ {guests.length}</span></div>
           </div>
           <button onClick={() => setShowAddModal(true)} className="bg-primary rounded-[32px] p-7 text-white shadow-xl shadow-primary/20 flex flex-col items-center justify-center active:scale-95 transition-all">
              <FiPlus size={24} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nouvel Invité</p>
           </button>
        </div>
      </div>

      {/* Sync Status Overlay */}
      {(syncQueue.length > 0 || isSyncing) && (
         <div className="fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[150] border bg-white border-slate-100 text-primary">
            <FiRefreshCw className={isSyncing ? "animate-spin" : ""} />
            <div className="flex flex-col text-[10px] font-black uppercase tracking-widest"><span>{isOnline ? 'Synchro' : 'Attente'}</span><span className="text-slate-400">{syncQueue.length} restants</span></div>
         </div>
      )}

      {/* Dynamic Add Guest Modal */}
      {showAddModal && (
         <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-lg p-10 rounded-t-[50px] sm:rounded-[50px] border border-slate-100 shadow-2xl animate-in slide-in-from-bottom-full duration-500 overflow-y-auto max-h-[90vh]">
               <div className="flex justify-between items-center mb-8">
                  <div><h3 className="text-3xl font-black text-slate-800">Enrôlement</h3><p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">Configuration de l'événement</p></div>
                  <button onClick={() => setShowAddModal(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><FiXCircle size={24} /></button>
               </div>

               <form onSubmit={handleAddGuest} className="space-y-6">
                  {/* Fixed Core Fields */}
                  <div className="relative">
                    <FiUser className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Nom complet" className="w-full bg-slate-50 border border-slate-100 rounded-[28px] py-6 pl-14 pr-8 font-bold text-slate-800" />
                  </div>
                  <div className="relative">
                    <FiPhone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Téléphone" className="w-full bg-slate-50 border border-slate-100 rounded-[28px] py-6 pl-14 pr-8 font-bold text-slate-800" />
                  </div>

                  {/* Dynamic Fields from JSON */}
                  {eventCustomFields.map(field => (
                    <div key={field.id} className="relative">
                       <FiEdit3 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                       {field.type === 'select' ? (
                          <div className="relative">
                             <select 
                               value={formData.additionalData[field.name] || ''}
                               onChange={(e) => setFormData({...formData, additionalData: {...formData.additionalData, [field.name]: e.target.value}})}
                               className="w-full bg-slate-50 border border-slate-100 rounded-[28px] py-6 pl-14 pr-12 font-bold text-slate-800 appearance-none"
                             >
                                <option value="">{field.label}</option>
                                {(field.options || '').split(',').map(opt => <option key={opt} value={opt.trim()}>{opt.trim()}</option>)}
                             </select>
                             <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                       ) : field.type === 'checkbox' ? (
                          <div className="w-full bg-slate-50 border border-slate-100 rounded-[28px] py-6 pl-14 pr-8 flex items-center justify-between">
                             <span className="font-bold text-slate-500">{field.label}</span>
                             <input type="checkbox" checked={!!formData.additionalData[field.name]} onChange={(e) => setFormData({...formData, additionalData: {...formData.additionalData, [field.name]: e.target.checked}})} className="w-6 h-6 rounded-lg text-primary border-slate-200" />
                          </div>
                       ) : (
                          <input 
                             type={field.type === 'number' ? 'number' : 'text'}
                             value={formData.additionalData[field.name] || ''}
                             onChange={(e) => setFormData({...formData, additionalData: {...formData.additionalData, [field.name]: e.target.value}})}
                             placeholder={field.label}
                             className="w-full bg-slate-50 border border-slate-100 rounded-[28px] py-6 pl-14 pr-8 font-bold text-slate-800"
                          />
                       )}
                    </div>
                  ))}

                  <button type="submit" disabled={submittingGuest} className="w-full bg-primary py-7 rounded-[32px] text-white font-black uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3">
                     {submittingGuest ? <FiRefreshCw className="animate-spin" /> : <FiCheckCircle />}
                     <span>Confirmer</span>
                  </button>
               </form>
            </div>
         </div>
      )}

      <style jsx global>{`
         @keyframes scan-line { 0% { top: 0; } 100% { top: 100%; } }
         .animate-scan-line { animation: scan-line 3s linear infinite; }
         .pl-14 { padding-left: 3.5rem; }
         .pl-18 { padding-left: 4.5rem; }
      `}</style>
    </div>
  );
}
