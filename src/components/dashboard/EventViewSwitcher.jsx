'use client';

import React, { useState } from 'react';
import { FiList, FiPieChart, FiTrash2, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import cn from 'classnames';
import GuestManagerTable from './GuestManagerTable';
import EventStatistics from './EventStatistics';
import { useRouter } from 'next/navigation';
import Modal from '../Modal';

export default function EventViewSwitcher({ event, guests }) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'stats'
  const [uniquenessField, setUniquenessField] = useState(event.uniquenessField || 'none'); // local selection
  const [isCleaning, setIsCleaning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successModal, setSuccessModal] = useState({ visible: false, title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ visible: false, count: 0 });
  const router = useRouter();

  const isFormApplied = event.uniquenessField === uniquenessField;

  // Helper to get unique guests based on a field
  const uniqueGuests = React.useMemo(() => {
    if (!uniquenessField || uniquenessField === 'none') return guests;

    const seen = new Set();
    return guests.filter(guest => {
      let val;
      if (uniquenessField === 'phone') {
        val = guest.phone;
      } else {
        try {
          const data = JSON.parse(guest.additionalData || '{}');
          val = data[uniquenessField];
        } catch (e) {
          val = null;
        }
      }

      if (!val) return true; 
      
      const key = String(val).trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [guests, uniquenessField]);

  const handlePermanentClean = async () => {
    if (uniquenessField === 'none') {
      alert("Veuillez sélectionner un champ d'unicité d'abord.");
      return;
    }

    const count = guests.length - uniqueGuests.length;
    if (count === 0) {
      alert("Aucun doublon détecté avec cette contrainte.");
      return;
    }

    setConfirmModal({ visible: true, count });
  };

  const executePermanentClean = async () => {
    setConfirmModal({ ...confirmModal, visible: false });
    setIsCleaning(true);
    try {
      const res = await fetch(`/api/events/${event.id}/guests`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldName: uniquenessField })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessModal({
          visible: true,
          title: "Nettoyage réussi",
          message: `${data.deletedCount} doublons ont été supprimés définitivement de la base de données.`
        });
        router.refresh();
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression.");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleSaveToForm = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uniquenessField })
      });

      if (res.ok) {
        setSuccessModal({
          visible: true,
          title: "Configuration mise à jour",
          message: "Le formulaire d'enrôlement vérifiera désormais l'unicité sur ce champ pour toutes les nouvelles inscriptions."
        });
        router.refresh();
      } else {
        alert("Erreur lors de la mise à jour.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Confirmation Modal */}
      <Modal 
        visible={confirmModal.visible} 
        onClose={() => setConfirmModal({ ...confirmModal, visible: false })}
        outerClassName="max-w-md"
      >
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/10 mb-6">
            <FiAlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-dark dark:text-white mb-3">
            Suppression définitive
          </h3>
          <p className="text-body-color mb-8 leading-relaxed">
            Attention : Cette action va supprimer <strong className="text-red-500">DEFINITIVEMENT {confirmModal.count} enregistrements</strong> (doublons) de la base de données. Voulez-vous continuer ?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmModal({ ...confirmModal, visible: false })}
              className="flex-1 rounded-xl bg-gray-100 dark:bg-dark-3 py-4 px-8 text-center text-sm font-bold text-body-color hover:text-dark dark:hover:text-white transition"
            >
              Annuler
            </button>
            <button
              onClick={executePermanentClean}
              className="flex-1 rounded-xl bg-red-500 py-4 px-8 text-center text-sm font-bold text-white hover:bg-red-600 transition shadow-lg shadow-red-500/20"
            >
              Oui, supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal 
        visible={successModal.visible} 
        onClose={() => setSuccessModal({ ...successModal, visible: false })}
        outerClassName="max-w-md"
      >
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10 mb-6">
            <FiCheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-dark dark:text-white mb-3">
            {successModal.title}
          </h3>
          <p className="text-body-color mb-8 leading-relaxed">
            {successModal.message}
          </p>
          <button
            onClick={() => setSuccessModal({ ...successModal, visible: false })}
            className="w-full rounded-xl bg-primary py-4 px-8 text-center text-sm font-bold text-white hover:bg-opacity-90 transition shadow-lg shadow-primary/20"
          >
            Fermer
          </button>
        </div>
      </Modal>

      {/* Tabs Switcher & Uniqueness Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-dark-3 p-1 rounded-2xl w-fit border border-stroke dark:border-white/5">
          <button
            onClick={() => setActiveTab('list')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm",
              activeTab === 'list' 
                ? "bg-white dark:bg-dark-2 text-primary shadow-md scale-105" 
                : "text-body-color hover:text-dark dark:hover:text-white"
            )}
          >
            <FiList size={18} />
            <span>Liste des Invités</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm",
              activeTab === 'stats' 
                ? "bg-white dark:bg-dark-2 text-primary shadow-md scale-105" 
                : "text-body-color hover:text-dark dark:hover:text-white"
            )}
          >
            <FiPieChart size={18} />
            <span>Statistiques & Analyses</span>
          </button>
        </div>

        {/* Global Uniqueness Selector & Clean Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 bg-white dark:bg-dark-2 px-4 py-2 rounded-2xl border border-stroke dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", isFormApplied ? "bg-green-500" : "bg-primary animate-pulse")} />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Unicité :</span>
              </div>
              <select 
                value={uniquenessField}
                onChange={(e) => setUniquenessField(e.target.value)}
                className="bg-transparent text-xs font-bold text-dark dark:text-white outline-none focus:ring-0 cursor-pointer"
              >
                <option value="none">Aucune (Tous les enregistrements)</option>
                <option value="phone">Téléphone</option>
                {JSON.parse(event.customFields || '[]').map(field => (
                  <option key={field.id} value={field.name}>{field.label}</option>
                ))}
              </select>
            </div>
            {!isFormApplied && uniquenessField !== 'none' && (
              <span className="text-[9px] text-primary font-bold italic px-2">Mode : Statistiques uniquement</span>
            )}
            {isFormApplied && uniquenessField !== 'none' && (
              <span className="text-[9px] text-green-500 font-bold italic px-2">Appliqué au formulaire ✅</span>
            )}
          </div>

          {!isFormApplied && uniquenessField !== 'none' && (
            <button
              onClick={handleSaveToForm}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all text-xs font-bold shadow-lg shadow-primary/20"
            >
              {isSaving ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiCheckCircle size={14} />
              )}
              <span>Appliquer au formulaire</span>
            </button>
          )}

          {uniquenessField !== 'none' && guests.length > uniqueGuests.length && (
            <button
              onClick={handlePermanentClean}
              disabled={isCleaning}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all text-xs font-bold shadow-sm"
            >
              {isCleaning ? (
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiTrash2 size={14} />
              )}
              <span>Nettoyer la base ({guests.length - uniqueGuests.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="transition-all duration-300">
        {activeTab === 'list' ? (
          <GuestManagerTable event={event} guests={uniqueGuests} allGuestsCount={guests.length} />
        ) : (
          <EventStatistics event={event} guests={uniqueGuests} />
        )}
      </div>
    </div>
  );
}
