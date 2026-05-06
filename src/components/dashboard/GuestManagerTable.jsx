'use client';

import React, { useState } from 'react';
import cn from 'classnames';
import { FiUsers, FiCheckCircle, FiClock, FiDownload, FiFileText, FiCamera } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AppLink from '@/components/AppLink';
import { FiPrinter } from 'react-icons/fi';

const GuestManagerTable = ({ event, guests: initialGuests }) => {
  const [guests] = useState(initialGuests);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingXML, setIsExportingXML] = useState(false);
  
  const [pdfDaysPerPage, setPdfDaysPerPage] = useState(4);
  const customFieldsConfig = JSON.parse(event.customFields || '[]');
  const attendanceDays = event.attendanceDays || 1;

  const exportPDF = async () => {
    setIsExportingPDF(true);
    setTimeout(() => {
      try {
        const sessionsPerDay = event.sessionsPerDay || 1;
        const totalDays = event.attendanceDays || 1;
        const daysPerPageSetting = parseInt(pdfDaysPerPage) || 4;
        
        // Calculate total columns on a page
        const attendanceCols = daysPerPageSetting * sessionsPerDay;
        const totalCols = customFieldsConfig.length + attendanceCols + 1; // +1 for Guest Name
        const orientation = totalCols > 8 ? 'l' : 'p';

        const doc = new jsPDF(orientation, 'mm', 'a4'); 
        const totalPagesExp = '{total_pages_count_string}';
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        
        const totalPageGroups = Math.ceil(totalDays / daysPerPageSetting);

        for (let groupIdx = 0; groupIdx < totalPageGroups; groupIdx++) {
          if (groupIdx > 0) doc.addPage();

          const startDay = groupIdx * daysPerPageSetting + 1;
          const endDay = Math.min(startDay + daysPerPageSetting - 1, totalDays);

          // Header setup
          doc.setFontSize(22);
          doc.setTextColor(40);
          doc.text(`Liste des Invites de ${event.name}`, pageWidth / 2, 22, { align: 'center' });
          
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Periode : Jours ${startDay} a ${endDay} - Genere le : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 30, { align: 'center' });
          
          doc.setFontSize(11);
          doc.setTextColor(80);
          const description = "Liste des participants et suivi de presence (Check = Present).";
          doc.text(description, pageWidth / 2, 40, { align: 'center' });

          // Headers
          const headers = ['Invite'];
          customFieldsConfig.forEach(field => headers.push(field.label));
          
          for (let d = startDay; d <= endDay; d++) {
            for (let s = 1; s <= sessionsPerDay; s++) {
              headers.push(`J${d}-S${s}`);
            }
          }

          const tableData = guests.map(guest => {
            const additionalData = JSON.parse(guest.additionalData || '{}');
            const attendanceMap = JSON.parse(guest.attendance || '{}');
            const row = [guest.name];
            
            customFieldsConfig.forEach(field => {
              const val = additionalData[field.name];
              row.push(val === true ? 'OUI' : (val === false ? 'NON' : (val || '-')));
            });

            for (let d = startDay; d <= endDay; d++) {
              for (let s = 1; s <= sessionsPerDay; s++) {
                const key = `d${d}s${s}`;
                row.push(attendanceMap[key] ? 'YES' : '');
              }
            }
            return row;
          });

          autoTable(doc, {
            head: [headers],
            body: tableData,
            startY: 48,
            theme: 'grid',
            styles: { fontSize: orientation === 'p' ? 7 : 8, cellPadding: 3, halign: 'center', valign: 'middle' },
            headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold', fontSize: orientation === 'p' ? 8 : 9 },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
            didDrawPage: (data) => {
              let str = 'Page ' + doc.internal.getNumberOfPages();
              if (typeof doc.putTotalPages === 'function') str = str + ' sur ' + totalPagesExp;
              doc.setFontSize(10);
              doc.text(str, data.settings.margin.left, pageHeight - 10);
            }
          });
        }

        if (typeof doc.putTotalPages === 'function') doc.putTotalPages(totalPagesExp);
        doc.save(`rapport_final_${event.name.replace(/\s+/g, '_')}.pdf`);
      } catch (err) {
        console.error(err);
      } finally {
        setIsExportingPDF(false);
      }
    }, 500);
  };

  const exportXML = () => {
    setIsExportingXML(true);
    
    setTimeout(() => {
      try {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<event>\n';
        xml += `  <id>${event.id}</id>\n`;
        xml += `  <name>${escapeXml(event.name)}</name>\n`;
        xml += '  <guests>\n';

        guests.forEach(guest => {
          const additionalData = JSON.parse(guest.additionalData || '{}');
          xml += '    <guest>\n';
          xml += `      <id>${guest.id}</id>\n`;
          xml += `      <name>${escapeXml(guest.name)}</name>\n`;
          xml += `      <status>${guest.status}</status>\n`;
          xml += `      <photo>${escapeXml(guest.photoUrl || '')}</photo>\n`;
          xml += '      <additional_data>\n';
          Object.entries(additionalData).forEach(([key, value]) => {
            xml += `        <field name="${escapeXml(key)}">${escapeXml(String(value))}</field>\n`;
          });
          xml += '      </additional_data>\n';
          xml += '    </guest>\n';
        });

        xml += '  </guests>\n';
        xml += '</event>';

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
    }, 500);
  };

  function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
      return c;
    });
  }

  const [isNavigatingToScanner, setIsNavigatingToScanner] = useState(false);
  const [isNavigatingToBadge, setIsNavigatingToBadge] = useState(false);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
           <FiUsers className="text-primary" /> Liste des Invités ({guests.length})
        </h3>
         <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-dark-3 rounded-lg border border-stroke dark:border-white/10">
              <span className="text-[10px] font-black text-gray-400 uppercase">Jours / Page :</span>
              <select 
                value={pdfDaysPerPage} 
                onChange={(e) => setPdfDaysPerPage(e.target.value)}
                className="bg-transparent text-xs font-bold text-dark dark:text-white outline-none"
              >
                <option value="1">1 jour</option>
                <option value="2">2 jours</option>
                <option value="3">3 jours</option>
                <option value="4">4 jours</option>
                <option value="6">6 jours</option>
              </select>
            </div>
            <AppLink 
              href={`/dashboard/events/${event.id}/scanner`}
              onClick={() => setIsNavigatingToScanner(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-70"
            >
              {isNavigatingToScanner ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiCamera />
              )}
              {isNavigatingToScanner ? 'Chargement...' : 'Lancer le scanner'}
            </AppLink>
            <AppLink 
              href={`/dashboard/events/${event.id}/badge`}
              onClick={() => setIsNavigatingToBadge(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition text-sm font-bold shadow-lg disabled:opacity-70"
            >
              {isNavigatingToBadge ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiPrinter />
              )}
              {isNavigatingToBadge ? 'Chargement...' : 'Badges & Impression'}
            </AppLink>
           <button 
            disabled={isExportingPDF}
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-3 text-dark dark:text-white border border-stroke dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-4 transition text-sm font-bold shadow-sm disabled:opacity-50"
           >
             {isExportingPDF ? (
               <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
             ) : (
               <FiFileText className="text-red-500" />
             )}
             {isExportingPDF ? 'Génération...' : 'PDF Rapport'}
           </button>
           <button 
            disabled={isExportingXML}
            onClick={exportXML}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-3 text-dark dark:text-white border border-stroke dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-4 transition text-sm font-bold shadow-sm disabled:opacity-50"
           >
             {isExportingXML ? (
               <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             ) : (
               <FiDownload className="text-blue-500" />
             )}
             {isExportingXML ? 'Exportation...' : 'XML Export'}
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-2 rounded-3xl border border-stroke dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-stroke dark:border-white/10 bg-gray-50/50 dark:bg-dark-3/50">
                <th className="p-6 text-xs font-black uppercase text-gray-400 tracking-wider">Invité</th>
                {customFieldsConfig.map(field => (
                  <th key={field.id} className="p-6 text-xs font-black uppercase text-gray-400 tracking-wider">
                    {field.label}
                  </th>
                ))}
                <th className="p-6 text-xs font-black uppercase text-gray-400 tracking-wider text-center">Statut</th>
                <th className="p-6 text-xs font-black uppercase text-gray-400 tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-white/10">
              {guests.map((guest) => {
                const additionalData = JSON.parse(guest.additionalData || '{}');
                return (
                  <tr key={guest.id} className="hover:bg-gray-50 dark:hover:bg-dark-3/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border-2 border-white dark:border-dark-3 shadow-sm">
                          {guest.photoUrl ? (
                            <img src={guest.photoUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <FiCamera size={20} />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-dark dark:text-white">{guest.name}</span>
                      </div>
                    </td>
                    
                    {customFieldsConfig.map(field => (
                      <td key={field.id} className="p-6 text-sm text-body-color font-medium">
                        {field.type === 'checkbox' ? (
                          additionalData[field.name] ? '✅' : '❌'
                        ) : (
                          additionalData[field.name] || '-'
                        )}
                      </td>
                    ))}

                    <td className="p-6 text-center">
                      <span className={cn("inline-flex px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border", {
                        "bg-green-500/10 text-green-500 border-green-500/20": guest.status === 'PAID',
                        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20": guest.status === 'PENDING'
                      })}>
                        {guest.status === 'PAID' ? 'Validé' : 'En attente'}
                      </span>
                    </td>

                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-3">
                        {guest.generatedImageUrl && (
                          <a href={guest.generatedImageUrl} target="_blank" className="p-2 text-primary hover:bg-primary/10 rounded-lg transition" title="Voir l'affiche">
                            <FiDownload size={18} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {guests.length === 0 && (
                <tr>
                  <td colSpan={3 + customFieldsConfig.length} className="p-20 text-center">
                    <div className="flex flex-col items-center">
                      <FiUsers size={48} className="text-gray-200 mb-4" />
                      <p className="text-body-color font-medium italic">Aucun invité pour le moment.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GuestManagerTable;
