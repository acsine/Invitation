'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  FiCamera, FiCheckCircle, FiXCircle, FiRefreshCw, FiUsers, 
  FiClock, FiCalendar, FiChevronLeft, FiLogOut, FiSearch, 
  FiUserPlus, FiUser, FiPhone, FiPlus, FiCheck, FiActivity, FiZap, FiChevronDown, FiWifiOff, FiWifi, FiEdit3, FiArrowRight, FiArrowLeft
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Loader from '@/components/Loader';
import cn from 'classnames';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/AppLink';

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

  // Loading States for Buttons
  const [selectingEventId, setSelectingEventId] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNavigatingDashboard, setIsNavigatingDashboard] = useState(false);
  const [validatingGuestId, setValidatingGuestId] = useState(null);
  
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
    } catch (error) { toast.error('Mode hors-ligne activé'); } finally { 
      setLoading(false); 
      setSelectingEventId(null);
    }
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
      toast.error(guest ? 'Sélectionnez une session' : 'Invité non reconnu');
      return;
    }
    if (guest.attendanceMap[activeSessionKey]) {
      setLastScanned({ id: guestId, name: guest.name, time: Date.now(), status: 'ALREADY_PRESENT' });
      toast.success(`${guest.name} est déjà présent`);
      return;
    }

    setValidatingGuestId(guestId);
    const updatedGuests = guests.map(g => g.id === guestId ? { ...g, attendanceMap: { ...g.attendanceMap, [activeSessionKey]: true } } : g);
    setGuests(updatedGuests);
    setSyncQueue(prev => [...prev, { guestId, sessionKey: activeSessionKey, timestamp: Date.now() }]);
    setLastScanned({ id: guestId, name: guest.name, time: Date.now(), status: 'SUCCESS' });
    toast.success(`${guest.name} marqué présent !`);
    setTimeout(() => setValidatingGuestId(null), 800);
  };

  const handleSelectEvent = (event) => {
    setSelectingEventId(event.id);
    setSelectedEvent(event);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    signOut({ callbackUrl: '/auth/login' });
  };

  const handleGoDashboard = () => {
    setIsNavigatingDashboard(true);
    router.push('/dashboard/events');
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
          toast.success('Invité ajouté');
          setShowAddModal(false);
          setFormData({ name: '', phone: '', additionalData: {} });
          fetchGuests();
       } else {
          const data = await res.json();
          toast.error(data.error || 'Erreur lors de l\'enregistrement');
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

  if (status === 'loading' || (loading && !selectedEvent)) return <div className="flex h-screen items-center justify-center bg-[#F4F6FB]"><Loader /></div>;

  // --- View 1: Event Selection Page ---
  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-[#F4F6FB] text-slate-800 font-sans selection:bg-[#FF6500] selection:text-white flex flex-col">
        {/* Brand Header Navbar */}
        <header className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs py-3 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center cursor-pointer" onClick={handleGoDashboard}>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                Invite<span className="text-[#FF6500]">Manager</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/60 text-xs font-bold text-slate-700">
                <FiUser className="text-[#FF6500]" size={14} />
                <span>{session?.user?.name || 'Super Admin'}</span>
              </div>

              <div className={cn("px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border", 
                isOnline 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-rose-50 text-rose-700 border-rose-200"
              )}>
                {isOnline ? <FiWifi size={13} /> : <FiWifiOff size={13} />}
                <span>{isOnline ? 'En ligne' : 'Hors-ligne'}</span>
              </div>

              <button 
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors border border-slate-200/60 cursor-pointer disabled:opacity-50"
                title="Déconnexion"
              >
                {isLoggingOut ? <FiRefreshCw className="animate-spin text-rose-600" size={16} /> : <FiLogOut size={16} />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-10 space-y-8">
          {/* Section Heading */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#FF6500]/10 text-[#FF6500]">
              <FiZap size={14} /> Module Scanner Pro
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Sélectionnez un Événement
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
              Choisissez un événement pour lancer le contrôle d'accès en direct et valider les présences des invités par scanner QR.
            </p>
          </div>

          {/* Events Grid or Pristine Empty State */}
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => {
                const isSelected = selectingEventId === event.id;
                return (
                  <div
                    key={event.id}
                    onClick={() => !selectingEventId && handleSelectEvent(event)}
                    className={cn(
                      "group bg-white hover:bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between",
                      isSelected && "ring-2 ring-[#FF6500] border-transparent"
                    )}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="bg-slate-100 font-mono font-bold text-slate-600 text-xs px-2.5 py-1 rounded-lg border border-slate-200/60">
                          #{event.shareCode}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          event.isPaid ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {event.isPaid ? 'Payant' : 'Gratuit'}
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#FF6500] transition-colors line-clamp-2">
                        {event.name}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <FiCalendar size={14} className="text-[#FF6500]" />
                          <span>{new Date(event.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          <FiUsers size={14} className="text-indigo-600" />
                          <span>{event._count?.guests || 0} invités</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                        Prêt pour le scan
                      </span>
                      <button 
                        disabled={isSelected}
                        className="px-4 py-2.5 rounded-xl bg-[#0B1736] group-hover:bg-[#FF6500] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm disabled:opacity-80 cursor-pointer"
                      >
                        {isSelected ? (
                          <>
                            <FiRefreshCw className="animate-spin text-white" size={14} />
                            <span>Chargement...</span>
                          </>
                        ) : (
                          <>
                            <span>Lancer le Scanner</span>
                            <FiArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* EMPTY STATE WITH SPINNER ACTION BUTTON */
            <div className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-16 text-center shadow-sm max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 bg-[#FF6500]/10 text-[#FF6500] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <FiCamera size={36} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Aucun Événement Disponible
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed max-w-md mx-auto">
                  Vous n'avez actuellement aucun événement actif prêt pour le scanner. Créez votre premier événement dans le tableau de bord pour démarrer.
                </p>
              </div>

              <div className="pt-2">
                <button
                  disabled={isNavigatingDashboard}
                  onClick={handleGoDashboard}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B1736] hover:bg-[#FF6500] text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-80"
                >
                  {isNavigatingDashboard ? (
                    <>
                      <FiRefreshCw className="animate-spin" size={15} />
                      <span>Redirection...</span>
                    </>
                  ) : (
                    <>
                      <FiArrowLeft size={16} />
                      <span>Aller à mes événements</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // --- View 2: Active Event Scanner View ---
  return (
    <div className="min-h-screen bg-[#F4F6FB] text-slate-800 font-sans flex flex-col">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-white sticky top-0 z-[100] shadow-sm flex items-center justify-between">
        <button 
          onClick={() => setSelectedEvent(null)} 
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs transition-all cursor-pointer"
        >
          <FiChevronLeft size={18} /> <span>Retour aux événements</span>
        </button>

        <div className="text-center">
          <h3 className="text-base font-extrabold text-slate-900">{selectedEvent.name}</h3>
          <span className="text-[11px] text-slate-500 font-semibold">
            Code: #{selectedEvent.shareCode}
          </span>
        </div>

        <div className={cn("px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 border", 
          isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
        )}>
          {isOnline ? <FiWifi size={13} /> : <FiWifiOff size={13} />}
          <span>{isOnline ? 'En ligne' : 'Hors-ligne'}</span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col max-w-md mx-auto w-full gap-6">
        {/* Session Selector */}
        <div className="relative">
          <select 
            value={activeSessionKey || ''} 
            onChange={(e) => setManualSessionKey(e.target.value)} 
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-10 text-xs font-bold text-slate-800 appearance-none outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm cursor-pointer"
          >
            {availableSessions.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={16} />
          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-200/80 rounded-2xl border border-slate-200/60">
          <button 
            onClick={() => setActiveTab('scanner')} 
            className={cn("flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer", 
              activeTab === 'scanner' ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Camera Scanner
          </button>
          <button 
            onClick={() => setActiveTab('manual')} 
            className={cn("flex-1 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer", 
              activeTab === 'manual' ? "bg-white text-indigo-600 shadow-sm font-extrabold" : "text-slate-600 hover:text-slate-900"
            )}
          >
            Recherche Manuelle
          </button>
        </div>

        {activeTab === 'scanner' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider">Session Active</p>
                <h4 className="text-xl font-extrabold text-slate-900">{currentSession?.name || 'Session 1'}</h4>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-lg border border-indigo-100">
                J{currentSession?.day || 1}
              </div>
            </div>

            {/* Scanner Viewport Box */}
            <div className="relative aspect-square bg-slate-900 rounded-3xl overflow-hidden border-4 border-slate-800 shadow-xl">
              <div id="reader-standalone" className="w-full h-full"></div>
              {lastScanned && Date.now() - lastScanned.time < 2000 && (
                <div className={cn("absolute inset-0 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-in fade-in duration-200 z-50", 
                  lastScanned.status === 'SUCCESS' ? "bg-emerald-600/90 text-white" : "bg-rose-600/90 text-white"
                )}>
                  {lastScanned.status === 'SUCCESS' ? <FiCheckCircle size={56} className="mb-2 animate-bounce" /> : <FiXCircle size={56} className="mb-2 animate-shake" />}
                  <h4 className="text-xl font-black">{lastScanned.name || 'Inconnu'}</h4>
                  <p className="text-xs font-bold uppercase tracking-wider mt-1">
                    {lastScanned.status === 'SUCCESS' ? 'PRÉSENT !' : (lastScanned.status === 'ALREADY_PRESENT' ? 'DÉJÀ MARQUÉ PRÉSENT' : 'INVITÉ NON TROUVÉ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher un invité..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20" 
              />
            </div>
            
            <div className="space-y-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
              {filteredGuests.map(guest => {
                const isPresent = guest.attendanceMap[activeSessionKey];
                const isValidating = validatingGuestId === guest.id;
                return (
                  <div key={guest.id} className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold overflow-hidden border">
                        {guest.photoUrl ? <img src={guest.photoUrl} alt="" className="w-full h-full object-cover" /> : <span>{guest.name.charAt(0)}</span>}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{guest.name}</h5>
                        <p className="text-[10px] text-slate-500">{guest.phone || '-'}</p>
                      </div>
                    </div>
                    <button 
                      disabled={isPresent || isValidating} 
                      onClick={() => markGuestPresent(guest.id)} 
                      className={cn("px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-70", 
                        isPresent ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                      )}
                    >
                      {isValidating ? (
                        <>
                          <FiRefreshCw className="animate-spin" size={13} />
                          <span>Validation...</span>
                        </>
                      ) : isPresent ? (
                        <>
                          <FiCheck size={14} />
                          <span>Présent</span>
                        </>
                      ) : (
                        <>
                          <FiUserPlus size={14} />
                          <span>Valider</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Counter Summary */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Présents</span>
            <span className="text-2xl font-black text-emerald-600">{guests.filter(g => g.attendanceMap[activeSessionKey]).length}</span>
            <span className="text-xs font-bold text-slate-400"> / {guests.length}</span>
          </div>

          <button 
            onClick={() => setShowAddModal(true)} 
            className="bg-[#0B1736] hover:bg-[#FF6500] rounded-2xl p-4 text-white shadow-md flex flex-col items-center justify-center transition-colors cursor-pointer"
          >
            <FiPlus size={20} className="mb-1" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Nouvel Invité</span>
          </button>
        </div>
      </div>

      {/* Enrolment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Enrôlement d'Invité</h3>
                <p className="text-xs text-slate-500 font-medium">Ajouter un participant en direct sur l'événement</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 bg-slate-100">
                <FiXCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom complet *</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Jean Dupont" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone *</label>
                <input 
                  required 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  placeholder="Ex: +225 07 00 00 00" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20" 
                />
              </div>

              {eventCustomFields.map(field => (
                <div key={field.id || field.name}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{field.label || field.name}</label>
                  {field.type === 'select' ? (
                    <select 
                      value={formData.additionalData[field.name] || ''}
                      onChange={(e) => setFormData({...formData, additionalData: {...formData.additionalData, [field.name]: e.target.value}})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-medium outline-none cursor-pointer"
                    >
                      <option value="">Sélectionner...</option>
                      {(field.options || '').split(',').map(opt => <option key={opt} value={opt.trim()}>{opt.trim()}</option>)}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={!!formData.additionalData[field.name]} 
                        onChange={(e) => setFormData({...formData, additionalData: {...formData.additionalData, [field.name]: e.target.checked}})} 
                        className="w-4 h-4 rounded text-indigo-600 border-slate-300 cursor-pointer" 
                      />
                      <span className="text-xs text-slate-600">{field.label}</span>
                    </div>
                  ) : (
                    <input 
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={formData.additionalData[field.name] || ''}
                      onChange={(e) => setFormData({...formData, additionalData: {...formData.additionalData, [field.name]: e.target.value}})}
                      placeholder={field.label}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs font-medium outline-none"
                    />
                  )}
                </div>
              ))}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={submittingGuest}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {submittingGuest ? <FiRefreshCw className="animate-spin" size={15} /> : <FiCheckCircle size={15} />}
                  <span>{submittingGuest ? 'Enregistrement...' : 'Confirmer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
