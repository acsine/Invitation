'use client';

import React from 'react';
import Modal from '@/components/Modal';
import { FiTrash2, FiAlertTriangle, FiLoader } from 'react-icons/fi';

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Supprimer l'événement",
  itemName,
  eventName, // fallback for backward compatibility
  description,
  loading 
}) {
  const nameToDisplay = itemName || eventName;

  return (
    <Modal
      visible={isOpen}
      onClose={onClose}
      outerClassName="max-w-md"
      containerClassName="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl"
    >
      <div className="text-center pt-2">
        {/* Glowing Danger Icon Badge */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-100 dark:border-rose-900/50 shadow-xl shadow-rose-500/10">
          <FiTrash2 size={28} className="stroke-[2.2]" />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        
        {/* Description & Item Name */}
        <div className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description ? (
            <p>{description}</p>
          ) : (
            <p>
              Êtes-vous sûr de vouloir supprimer
              {nameToDisplay ? (
                <> <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block max-w-full truncate align-bottom my-1">"{nameToDisplay}"</span></>
              ) : (
                " cet élément"
              )} ?
            </p>
          )}
          
          <div className="mt-4 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5 bg-rose-50/70 dark:bg-rose-950/30 py-2 px-3 rounded-xl border border-rose-100 dark:border-rose-900/30">
            <FiAlertTriangle size={15} className="shrink-0" />
            <span>Cette action est définitive et irréversible.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={16} />
                <span>Suppression...</span>
              </>
            ) : (
              <>
                <FiTrash2 size={16} />
                <span>Supprimer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

