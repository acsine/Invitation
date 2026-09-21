'use client';

import React, { useState, useRef } from 'react';
import Modal from '@/components/Modal';
import { FiUpload, FiFileText, FiCheckCircle, FiAlertCircle, FiUsers, FiInfo } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

export default function ExcelImportModal({ isOpen, onClose, eventId, onGuestsImported }) {
  const [fileData, setFileData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (jsonData.length > 0) {
          setFileData(jsonData);
          setColumns(Object.keys(jsonData[0]));
          toast.success(`${jsonData.length} lignes lues dans le fichier Excel !`);
        } else {
          toast.error('Fichier Excel vide');
        }
      } catch (err) {
        toast.error('Erreur lors de la lecture du fichier Excel');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (fileData.length === 0) {
      return toast.error('Veuillez d\'abord sélectionner un fichier Excel');
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: fileData })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Succès ! ${data.createdCount} invités ont été importés avec succès.`);
        if (data.skippedCount > 0) {
          toast.success(`${data.skippedCount} doublons ignorés.`);
        }
        setFileData([]);
        setColumns([]);
        onClose();
        if (onGuestsImported) onGuestsImported();
      } else {
        toast.error(data.error || 'Erreur lors de l\'importation');
      }
    } catch (err) {
      toast.error('Erreur réseau lors de l\'importation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal 
      visible={isOpen} 
      onClose={onClose} 
      outerClassName="max-w-3xl"
      containerClassName="!p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FiUpload className="text-indigo-600" /> Importer des invités via Excel
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Téléversez votre fichier Excel (.xlsx, .xls) pour ajouter plusieurs invités en bloc
            </p>
          </div>
        </div>

        {/* File Select Area */}
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-500 transition-colors">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-3">
            <FiFileText size={28} />
          </div>
          <p className="text-sm font-bold text-slate-900 mb-1">
            {fileData.length > 0 ? `${fileData.length} invités détectés` : 'Glissez votre fichier ici ou cliquez pour choisir'}
          </p>
          <p className="text-xs text-slate-400 mb-4">Formats acceptés: .xlsx, .xls</p>

          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            {fileData.length > 0 ? 'Changer de fichier' : 'Sélectionner un fichier Excel'}
          </button>
        </div>

        {/* Data Preview Table */}
        {fileData.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <FiInfo className="text-indigo-600" /> Aperçu des données ({fileData.length} lignes)
              </span>
              <span className="text-[11px] text-slate-400">Colonnes : {columns.join(', ')}</span>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 sticky top-0">
                  <tr>
                    {columns.map(col => (
                      <th key={col} className="py-2 px-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fileData.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {columns.map(col => (
                        <td key={col} className="py-2 px-3 text-slate-700 font-medium truncate max-w-[150px]">
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {fileData.length > 5 && (
              <p className="text-[11px] text-slate-400 italic text-center">... et {fileData.length - 5} autres lignes.</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="button"
            disabled={fileData.length === 0 || loading}
            onClick={handleImport}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FiCheckCircle size={15} />
            )}
            <span>{loading ? 'Importation en cours...' : `Importer ${fileData.length} invités`}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
