'use client';

import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/components/Modal';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FiCheckCircle, FiXCircle, FiCamera, FiRefreshCw, FiUser, FiClock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function LiveQRScannerModal({ isOpen, onClose, event, guests, selectedSession, onAttendanceMarked }) {
  const [scanResult, setScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !event) return;

    let scanner;
    const timer = setTimeout(() => {
      try {
        scanner = new Html5QrcodeScanner("modal-qr-reader", { 
          fps: 10, 
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
          videoConstraints: { facingMode: "environment" }
        });

        scanner.render(handleScanSuccess, handleScanError);
        scannerRef.current = scanner;
      } catch (err) {
        console.error("Scanner init error:", err);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
      }
    };
  }, [isOpen, event]);

  const handleScanSuccess = async (decodedText) => {
    if (isProcessing) return;
    
    const scannedId = decodedText.trim();
    // Match guest by ID or Phone
    const guest = guests.find(g => 
      g.id === scannedId || 
      (g.phone && g.phone.replace(/\D/g, '') === scannedId.replace(/\D/g, ''))
    );

    if (!guest) {
      setScanResult({ status: 'ERROR', message: 'Invité non reconnu' });
      toast.error('Invité non reconnu dans cet événement');
      setTimeout(() => setScanResult(null), 3000);
      return;
    }

    setIsProcessing(true);
    const sessionKey = selectedSession || 'd1s1';
    const attendanceMap = JSON.parse(guest.attendance || '{}');

    if (attendanceMap[sessionKey]) {
      setScanResult({ status: 'WARNING', guest, message: `${guest.name} est déjà marqué présent !` });
      toast.success(`${guest.name} est déjà présent`);
      setIsProcessing(false);
      setTimeout(() => setScanResult(null), 3000);
      return;
    }

    try {
      const res = await fetch(`/api/events/${event.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId: guest.id, sessionKey })
      });

      if (res.ok) {
        setScanResult({ status: 'SUCCESS', guest, message: `Présence validée : ${guest.name}` });
        toast.success(`✅ ${guest.name} marqué Présent !`);
        if (onAttendanceMarked) {
          onAttendanceMarked(guest.id, sessionKey);
        }
      } else {
        toast.error('Erreur lors de la validation');
      }
    } catch (err) {
      toast.error('Erreur réseau');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setScanResult(null), 3000);
    }
  };

  const handleScanError = (err) => {
    // Continuous scan silent listener
  };

  if (!isOpen) return null;

  return (
    <Modal 
      visible={isOpen} 
      onClose={onClose} 
      outerClassName="max-w-xl"
      containerClassName="!p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FiCamera className="text-indigo-600" /> Scanner un Badge QR
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Placez le QR Code de l'invité face à la caméra pour valider sa présence
            </p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
            <FiClock size={12} /> {selectedSession ? selectedSession.toUpperCase() : 'J1-S1'}
          </span>
        </div>

        {/* Camera Scanner Viewport */}
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-square border border-slate-800 flex items-center justify-center">
          <div id="modal-qr-reader" className="w-full h-full"></div>

          {/* Overlay Result Message */}
          {scanResult && (
            <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-in fade-in duration-200 ${
              scanResult.status === 'SUCCESS' ? 'bg-emerald-600/90 text-white' :
              scanResult.status === 'WARNING' ? 'bg-amber-500/90 text-white' :
              'bg-rose-600/90 text-white'
            }`}>
              {scanResult.status === 'SUCCESS' && <FiCheckCircle size={64} className="mb-3 animate-bounce" />}
              {scanResult.status === 'WARNING' && <FiCheckCircle size={64} className="mb-3" />}
              {scanResult.status === 'ERROR' && <FiXCircle size={64} className="mb-3 animate-shake" />}

              <h4 className="text-2xl font-black mb-1">
                {scanResult.guest ? scanResult.guest.name : 'Erreur'}
              </h4>
              <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                {scanResult.message}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
          >
            Fermer le scanner
          </button>
        </div>
      </div>
    </Modal>
  );
}
