'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FiCamera, FiCheckCircle, FiXCircle, FiRefreshCw, FiUsers, FiClock, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Loader from '@/components/Loader';
import AppLink from '@/components/AppLink';
import cn from 'classnames';

export default function ScannerPage({ params }) {
  const { id: eventId } = use(params);
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncQueue, setSyncQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [lastScanned, setLastScanned] = useState(null);
  const scannerRef = useRef(null);

  // 1. Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, guestsRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(`/api/events/${eventId}/guests`)
        ]);
        const eventData = await eventRes.json();
        const guestsData = await guestsRes.json();
        
        setEvent(eventData);
        setGuests(guestsData.map(g => ({
          ...g,
          attendanceMap: JSON.parse(g.attendance || '{}')
        })));
        setLoading(false);
      } catch (error) {
        toast.error('Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, [eventId]);

  // 2. Determine Current Session
  useEffect(() => {
    if (!event) return;
    
    const updateSession = () => {
      const now = new Date();
      const start = new Date(event.startDate);
      const diffTime = now - start;
      const dayNum = Math.ceil((diffTime + 1) / (1000 * 60 * 60 * 24));
      
      if (dayNum < 1 || dayNum > event.attendanceDays) {
        setCurrentSession({ type: 'OUT_OF_RANGE', message: 'Événement non actif aujourd\'hui' });
        return;
      }

      const config = JSON.parse(event.sessionConfig || '[]');
      // Find the closest session based on time
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      let session = config[0];
      for (const s of config) {
        if (timeStr >= s.time) session = s;
      }

      setCurrentSession({
        day: dayNum,
        sessionId: session?.id || 1,
        name: session?.name || 'Session 1',
        time: session?.time,
        key: `d${dayNum}s${session?.id || 1}`
      });
    };

    updateSession();
    const timer = setInterval(updateSession, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [event]);

  // 3. QR Scanner Logic
  useEffect(() => {
    if (loading || !event) return;

    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      videoConstraints: {
        facingMode: "environment"
      }
    });

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error(err));
      }
    };
  }, [loading, event]);

  const onScanSuccess = (decodedText) => {
    if (lastScanned?.id === decodedText && Date.now() - lastScanned.time < 3000) return; // Prevent double scans
    
    const guestId = decodedText;
    const guest = guests.find(g => g.id === guestId);

    if (!guest) {
      setLastScanned({ id: guestId, time: Date.now(), status: 'NOT_FOUND' });
      toast.error('Invité non reconnu');
      return;
    }

    if (!currentSession || currentSession.type === 'OUT_OF_RANGE') {
      toast.error('Aucune session active');
      return;
    }

    const sessionKey = currentSession.key;
    
    if (guest.attendanceMap[sessionKey]) {
      setLastScanned({ id: guestId, name: guest.name, time: Date.now(), status: 'ALREADY_PRESENT' });
      toast.success(`${guest.name} est déjà marqué présent`);
      return;
    }

    // Mark as present in local state
    const updatedGuests = guests.map(g => {
      if (g.id === guestId) {
        const newMap = { ...g.attendanceMap, [sessionKey]: true };
        return { ...g, attendanceMap: newMap, attendance: JSON.stringify(newMap) };
      }
      return g;
    });
    setGuests(updatedGuests);
    
    // Add to sync queue
    setSyncQueue(prev => [...prev, { guestId, sessionKey, timestamp: Date.now() }]);
    setLastScanned({ id: guestId, name: guest.name, time: Date.now(), status: 'SUCCESS' });
    toast.success(`${guest.name} marqué présent !`);
  };

  const onScanError = (err) => {
    // Silently ignore errors as scanner is continuous
  };

  // 4. Background Sync Logic
  useEffect(() => {
    if (syncQueue.length === 0 || isSyncing) return;

    const sync = async () => {
      setIsSyncing(true);
      const item = syncQueue[0];
      
      try {
        const res = await fetch(`/api/events/${eventId}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });

        if (res.ok) {
          setSyncQueue(prev => prev.slice(1));
        } else {
          // Retry later - move to end of queue or just wait
          const errorData = await res.json();
          console.error('Sync failed:', errorData.error);
        }
      } catch (error) {
        console.error('Network error during sync');
      } finally {
        setIsSyncing(false);
      }
    };

    const timer = setTimeout(sync, 2000); // Wait for inactivity
    return () => clearTimeout(timer);
  }, [syncQueue, isSyncing, eventId]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-900"><Loader /></div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
           <div>
             <AppLink href={`/dashboard/events/${eventId}`} className="text-gray-500 hover:text-white transition flex items-center gap-2 mb-2">
                <FiXCircle /> Quitter le scanner
             </AppLink>
             <h1 className="text-2xl font-black tracking-tight">{event.name}</h1>
           </div>
           <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-primary font-bold">
                 <FiClock /> {currentSession?.name}
              </div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                Jour {currentSession?.day} • {currentSession?.time}
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scanner Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-black rounded-[32px] overflow-hidden border-4 border-gray-900 shadow-2xl aspect-square">
              <div id="reader" className="w-full h-full"></div>
              
              {/* Overlay for scan status */}
              {lastScanned && Date.now() - lastScanned.time < 2000 && (
                <div className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in duration-300 z-50",
                  lastScanned.status === 'SUCCESS' ? "bg-green-500/20" : "bg-red-500/20"
                )}>
                   {lastScanned.status === 'SUCCESS' ? (
                     <FiCheckCircle className="text-green-500 text-8xl mb-4 animate-bounce" />
                   ) : (
                     <FiXCircle className="text-red-500 text-8xl mb-4 animate-shake" />
                   )}
                   <div className="text-2xl font-black text-center px-6">
                      {lastScanned.name || 'Inconnu'}
                   </div>
                   <div className="text-sm font-bold uppercase tracking-widest mt-2">
                      {lastScanned.status === 'SUCCESS' ? 'PRÉSENT !' : (lastScanned.status === 'ALREADY_PRESENT' ? 'DÉJÀ PRÉSENT' : 'NON TROUVÉ')}
                   </div>
                </div>
              )}
            </div>

            {/* Sync Status */}
            <div className="bg-gray-900/50 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full animate-pulse", syncQueue.length > 0 ? "bg-yellow-500" : "bg-green-500")} />
                  <span className="text-sm font-bold">
                    {syncQueue.length > 0 ? `${syncQueue.length} mise(s) à jour en attente...` : 'Toutes les données sont synchronisées'}
                  </span>
               </div>
               {isSyncing && <FiRefreshCw className="animate-spin text-primary" />}
            </div>
          </div>

          {/* Stats & Session Info */}
          <div className="space-y-6">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
               <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                  <FiUsers className="text-primary" /> Statistiques Session
               </h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-400">Total Invités</span>
                     <span className="text-lg font-black">{guests.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-sm text-gray-400">Présents (Session)</span>
                     <span className="text-2xl font-black text-green-500">
                        {guests.filter(g => g.attendanceMap[currentSession?.key]).length}
                     </span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
                     <div 
                        className="bg-green-500 h-full transition-all duration-500" 
                        style={{ width: `${(guests.filter(g => g.attendanceMap[currentSession?.key]).length / guests.length) * 100}%` }}
                     />
                  </div>
               </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
               <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                  <FiCalendar className="text-primary" /> Détails Événement
               </h3>
               <div className="space-y-4">
                  <div className="flex flex-col">
                     <span className="text-[10px] text-gray-500 uppercase font-black">Période</span>
                     <span className="text-sm font-bold">
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                     </span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] text-gray-500 uppercase font-black">Sessions par jour</span>
                     <span className="text-sm font-bold">{event.sessionsPerDay} sessions</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
