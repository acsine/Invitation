'use client';

import React, { useState, useMemo } from 'react';
import cn from 'classnames';
import { 
  FiUsers, 
  FiCheckCircle, 
  FiClock, 
  FiDownload, 
  FiFileText, 
  FiCamera, 
  FiPrinter, 
  FiSearch, 
  FiUpload, 
  FiFilter, 
  FiPlus, 
  FiRefreshCw, 
  FiTrash2,
  FiX
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AppLink from '@/components/AppLink';
import ExcelImportModal from './ExcelImportModal';
import LiveQRScannerModal from './LiveQRScannerModal';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const GuestManagerTable = ({ event, guests: initialGuests = [], allGuestsCount }) => {
  const router = useRouter();
  const [guests, setGuests] = useState(initialGuests);

  // Sync state if props change
  React.useEffect(() => {
    setGuests(initialGuests);
  }, [initialGuests]);

  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingXML, setIsExportingXML] = useState(false);
  const [selectedSession, setSelectedSession] = useState('d1s1');
  const [pdfDaysPerPage, setPdfDaysPerPage] = useState(4);

  // Modals state
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTargetField, setSearchTargetField] = useState('ALL'); // 'ALL', 'name', 'phone', or custom field key
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'PAID', 'PENDING'

  const customFieldsConfig = useMemo(() => {
    try {
      if (typeof event.customFields === 'string') {
        return JSON.parse(event.customFields || '[]');
      }
      return Array.isArray(event.customFields) ? event.customFields : [];
    } catch (e) {
      return [];
    }
  }, [event.customFields]);

  const attendanceDays = event.attendanceDays || 1;
  const sessionsPerDay = event.sessionsPerDay || 1;

  // Prepare available sessions
  const availableSessions = useMemo(() => {
    const list = [];
    for (let d = 1; d <= attendanceDays; d++) {
      for (let s = 1; s <= sessionsPerDay; s++) {
        list.push({ id: `d${d}s${s}`, label: `J${d}-S${s}` });
      }
    }
    return list;
  }, [attendanceDays, sessionsPerDay]);

  // Advanced Filtering Logic across Custom Fields & Metadata
  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && guest.status !== statusFilter) {
        return false;
      }

      // 2. Search Query Filter
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      const additionalData = typeof guest.additionalData === 'string' 
        ? JSON.parse(guest.additionalData || '{}') 
        : (guest.additionalData || {});

      if (searchTargetField === 'ALL') {
        // Search across Name, Phone, and all custom fields
        const matchName = guest.name && guest.name.toLowerCase().includes(query);
        const matchPhone = guest.phone && guest.phone.toLowerCase().includes(query);
        const matchCustom = Object.values(additionalData).some(val => 
          val && String(val).toLowerCase().includes(query)
        );

        return matchName || matchPhone || matchCustom;
      } else if (searchTargetField === 'name') {
        return guest.name && guest.name.toLowerCase().includes(query);
      } else if (searchTargetField === 'phone') {
        return guest.phone && guest.phone.toLowerCase().includes(query);
      } else {
        // Target a specific custom field key
        const val = additionalData[searchTargetField];
        return val && String(val).toLowerCase().includes(query);
      }
    });
  }, [guests, searchQuery, searchTargetField, statusFilter]);

  // Attendance update callback from Scanner or manual toggle
  const handleAttendanceMarked = (guestId, sessionKey) => {
    setGuests(prev => prev.map(g => {
      if (g.id === guestId) {
        const currentAttendance = JSON.parse(g.attendance || '{}');
        const updated = { ...currentAttendance, [sessionKey]: true };
        return { ...g, attendance: JSON.stringify(updated) };
      }
      return g;
    }));
    router.refresh();
  };

  // Toggle Attendance Checkbox
  const toggleAttendance = async (guestId, sessionKey, currentVal) => {
    const newVal = !currentVal;
    
    // Optimistic UI update
    setGuests(prev => prev.map(g => {
      if (g.id === guestId) {
        const currentAttendance = JSON.parse(g.attendance || '{}');
        const updated = { ...currentAttendance, [sessionKey]: newVal };
        return { ...g, attendance: JSON.stringify(updated) };
      }
      return g;
    }));

    try {
      await fetch(`/api/events/${event.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, sessionKey, val: newVal })
      });
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const exportPDF = async () => {
    setIsExportingPDF(true);
    setTimeout(() => {
      try {
        const daysPerPageSetting = parseInt(pdfDaysPerPage) || 4;
        const attendanceCols = daysPerPageSetting * sessionsPerDay;
        const totalCols = customFieldsConfig.length + attendanceCols + 1;
        const orientation = totalCols > 8 ? 'l' : 'p';

        const doc = new jsPDF(orientation, 'mm', 'a4'); 
        const totalPagesExp = '{total_pages_count_string}';
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        
        const totalPageGroups = Math.ceil(attendanceDays / daysPerPageSetting);

        for (let groupIdx = 0; groupIdx < totalPageGroups; groupIdx++) {
          if (groupIdx > 0) doc.addPage();

          const startDay = groupIdx * daysPerPageSetting + 1;
          const endDay = Math.min(startDay + daysPerPageSetting - 1, attendanceDays);

          doc.setFontSize(20);
          doc.setTextColor(30);
          doc.text(`Liste des Invités : ${event.name}`, pageWidth / 2, 20, { align: 'center' });
          
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(`Période : Jours ${startDay} à ${endDay} - Généré le : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 27, { align: 'center' });

          const headers = ['Invité', 'Téléphone'];
          customFieldsConfig.forEach(field => headers.push(field.label));
          
          for (let d = startDay; d <= endDay; d++) {
            for (let s = 1; s <= sessionsPerDay; s++) {
              headers.push(`J${d}-S${s}`);
            }
          }

          const tableData = filteredGuests.map(guest => {
            const additionalData = JSON.parse(guest.additionalData || '{}');
            const attendanceMap = JSON.parse(guest.attendance || '{}');
            const row = [guest.name, guest.phone || '-'];
            
            customFieldsConfig.forEach(field => {
              const val = additionalData[field.name];
              row.push(val === true ? 'OUI' : (val === false ? 'NON' : (val || '-')));
            });

            for (let d = startDay; d <= endDay; d++) {
              for (let s = 1; s <= sessionsPerDay; s++) {
                const key = `d${d}s${s}`;
                row.push(attendanceMap[key] ? 'OUI' : '-');
              }
            }
            return row;
          });

          autoTable(doc, {
            head: [headers],
            body: tableData,
            startY: 35,
            theme: 'grid',
            styles: { fontSize: orientation === 'p' ? 7 : 8, cellPadding: 2.5, halign: 'center', valign: 'middle' },
            headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
            didDrawPage: (data) => {
              let str = 'Page ' + doc.internal.getNumberOfPages();
              if (typeof doc.putTotalPages === 'function') str = str + ' sur ' + totalPagesExp;
              doc.setFontSize(9);
              doc.text(str, data.settings.margin.left, pageHeight - 10);
            }
          });
        }

        if (typeof doc.putTotalPages === 'function') doc.putTotalPages(totalPagesExp);
        doc.save(`invites_${event.name.replace(/\s+/g, '_')}.pdf`);
      } catch (err) {
        console.error(err);
      } finally {
        setIsExportingPDF(false);
      }
    }, 400);
  };

  const exportXML = () => {
    setIsExportingXML(true);
    setTimeout(() => {
      try {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<event>\n';
        xml += `  <id>${event.id}</id>\n  <name>${escapeXml(event.name)}</name>\n  <guests>\n`;

        filteredGuests.forEach(guest => {
          const additionalData = JSON.parse(guest.additionalData || '{}');
          xml += '    <guest>\n';
          xml += `      <id>${guest.id}</id>\n`;
          xml += `      <name>${escapeXml(guest.name)}</name>\n`;
          xml += `      <phone>${escapeXml(guest.phone || '')}</phone>\n`;
          xml += `      <status>${guest.status}</status>\n`;
          xml += '      <custom_fields>\n';
          Object.entries(additionalData).forEach(([key, value]) => {
            xml += `        <field name="${escapeXml(key)}">${escapeXml(String(value))}</field>\n`;
          });
          xml += '      </custom_fields>\n    </guest>\n';
        });

        xml += '  </guests>\n</event>';

        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invites_${event.name.replace(/\s+/g, '_')}.xml`;
        link.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
      } finally {
        setIsExportingXML(false);
      }
    }, 300);
  };

  function escapeXml(unsafe) {
    return String(unsafe || '').replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  return (
    <div className="w-full space-y-6">
      {/* Action Header & Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <FiUsers size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Liste des Invités ({filteredGuests.length})
              </h3>
              {guests.length !== filteredGuests.length && (
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {filteredGuests.length} filtré(s) sur {guests.length}
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500">
              Gérez les présences, effectuez des recherches et importez votre liste
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Scanner Button */}
          <button
            onClick={() => setIsScannerModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <FiCamera size={15} />
            <span>Scanner QR Code</span>
          </button>

          {/* Excel Import Button */}
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-800 hover:border-indigo-600 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <FiUpload size={15} />
            <span>Importer Excel</span>
          </button>

          {/* Badge Generator Link */}
          <AppLink 
            href={`/dashboard/events/${event.id}/badge`}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <FiPrinter size={15} />
            <span>Imprimer Badges</span>
          </AppLink>

          {/* PDF Report Export */}
          <button 
            disabled={isExportingPDF}
            onClick={exportPDF}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <FiFileText className="text-rose-500" size={15} />
            <span>PDF</span>
          </button>

          {/* XML Export */}
          <button 
            disabled={isExportingXML}
            onClick={exportXML}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <FiDownload className="text-blue-500" size={15} />
            <span>XML</span>
          </button>
        </div>
      </div>

      {/* Advanced Search & Filtering Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Field Target Dropdown */}
          <div className="w-full sm:w-56 shrink-0">
            <select
              value={searchTargetField}
              onChange={(e) => setSearchTargetField(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="ALL">🔍 Tous les champs (Global)</option>
              <option value="name">👤 Nom complet</option>
              <option value="phone">📞 Téléphone</option>
              {customFieldsConfig.map(field => (
                <option key={field.id || field.name} value={field.name}>
                  📋 {field.label || field.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Query Input */}
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text"
              placeholder={`Rechercher un invité par ${searchTargetField === 'ALL' ? 'nom, téléphone, entreprise...' : searchTargetField}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 placeholder:text-slate-400 pl-10 pr-9 py-2 rounded-xl text-xs font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="w-full sm:w-44 shrink-0 flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PAID">✅ Validés / Payés</option>
              <option value="PENDING">⏳ En attente</option>
            </select>
          </div>

          {/* Session Selector */}
          <div className="w-full sm:w-36 shrink-0 bg-indigo-50/70 border border-indigo-100 rounded-xl px-3 py-2 flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-indigo-400">Session:</span>
            <select 
              value={selectedSession} 
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-transparent text-xs font-bold text-indigo-700 outline-none cursor-pointer w-full"
            >
              {availableSessions.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Guest Data Table - PRISTINE WHITE LIGHT DESIGN */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-5">Invité</th>
                <th className="py-3.5 px-5">Téléphone</th>
                {customFieldsConfig.map(field => (
                  <th key={field.id || field.name} className="py-3.5 px-5">
                    {field.label || field.name}
                  </th>
                ))}
                <th className="py-3.5 px-5 text-center">Présence ({selectedSession.toUpperCase()})</th>
                <th className="py-3.5 px-5 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs bg-white">
              {filteredGuests.map((guest) => {
                const additionalData = typeof guest.additionalData === 'string'
                  ? JSON.parse(guest.additionalData || '{}')
                  : (guest.additionalData || {});

                const attendanceMap = typeof guest.attendance === 'string'
                  ? JSON.parse(guest.attendance || '{}')
                  : (guest.attendance || {});

                const isPresent = !!attendanceMap[selectedSession];

                return (
                  <tr key={guest.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Guest Name & Avatar */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400 font-bold">
                          {guest.photoUrl ? (
                            <img src={guest.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span>{guest.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{guest.name}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-5 font-mono text-slate-600 font-medium">
                      {guest.phone || '-'}
                    </td>
                    
                    {/* Custom Fields */}
                    {customFieldsConfig.map(field => (
                      <td key={field.id || field.name} className="py-3.5 px-5 text-slate-700 font-medium">
                        {field.type === 'checkbox' ? (
                          additionalData[field.name] ? '✅' : '❌'
                        ) : (
                          additionalData[field.name] || '-'
                        )}
                      </td>
                    ))}

                    {/* Attendance Toggle Checkbox */}
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => toggleAttendance(guest.id, selectedSession, isPresent)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                          isPresent 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' 
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        <FiCheckCircle size={13} className={isPresent ? 'text-emerald-600' : 'text-slate-400'} />
                        <span>{isPresent ? 'Présent' : 'Absence'}</span>
                      </button>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        guest.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {guest.status === 'PAID' ? 'Validé' : 'En attente'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={4 + customFieldsConfig.length} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FiUsers size={40} className="text-slate-300 mb-3" />
                      <p className="text-slate-700 font-bold text-sm mb-1">Aucun invité trouvé</p>
                      <p className="text-slate-400 text-xs">
                        {searchQuery ? 'Essayez de modifier votre recherche.' : 'Importez vos invités via Excel ou partagez le lien d\'invitation.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ExcelImportModal 
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        eventId={event.id}
        onGuestsImported={() => router.refresh()}
      />

      <LiveQRScannerModal 
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        event={event}
        guests={guests}
        selectedSession={selectedSession}
        onAttendanceMarked={handleAttendanceMarked}
      />
    </div>
  );
};

export default GuestManagerTable;
