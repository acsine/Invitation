'use client';

import React, { useState } from 'react';
import cn from 'classnames';
import { FiUsers, FiCheckCircle, FiClock, FiDownload, FiFileText, FiCamera } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GuestManagerTable = ({ event, guests: initialGuests }) => {
  const [guests] = useState(initialGuests);
  const customFieldsConfig = JSON.parse(event.customFields || '[]');
  const attendanceDays = event.attendanceDays || 1;

  const exportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape A4
    const totalPagesExp = '{total_pages_count_string}';
    
    // Header setup
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text(`Liste des Invités de ${event.name}`, pageWidth / 2, 22, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date du rapport : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(80);
    const description = "Ce document contient la liste officielle des participants enregistrés ainsi que les cases d'émargement pour le suivi de présence journalier.";
    doc.text(description, pageWidth / 2, 40, { align: 'center' });

    // Headers - REMOVED Photo and Nom complet
    const headers = [];
    // Add custom fields to headers
    customFieldsConfig.forEach(field => headers.push(field.label));
    // Add attendance columns
    for (let i = 1; i <= attendanceDays; i++) {
      headers.push(`Jour ${i}`);
    }

    const tableData = guests.map(guest => {
      const additionalData = JSON.parse(guest.additionalData || '{}');
      const row = [];
      
      customFieldsConfig.forEach(field => {
        const val = additionalData[field.name];
        row.push(val === true ? 'OUI' : (val === false ? 'NON' : (val || '-')));
      });

      // Empty boxes for attendance
      for (let i = 1; i <= attendanceDays; i++) {
        row.push('');
      }
      return row;
    });

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 48,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, halign: 'center', valign: 'middle' },
      headStyles: { fillColor: [31, 41, 55], textColor: 255, fontStyle: 'bold', fontSize: 10 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        // First columns (custom fields) might need left alignment
        0: { halign: 'left' }
      },
      didDrawPage: (data) => {
        // Footer with pagination
        let str = 'Page ' + doc.internal.getNumberOfPages();
        if (typeof doc.putTotalPages === 'function') {
          str = str + ' sur ' + totalPagesExp;
        }
        doc.setFontSize(10);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.left, pageHeight - 10);
      }
    });

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp);
    }

    doc.save(`rapport_invites_${event.name.replace(/\s+/g, '_')}.pdf`);
  };

  const exportXML = () => {
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

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-dark dark:text-white flex items-center gap-2">
           <FiUsers className="text-primary" /> Liste des Invités ({guests.length})
        </h3>
        <div className="flex gap-3">
           <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-3 text-dark dark:text-white border border-stroke dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-4 transition text-sm font-bold shadow-sm"
           >
             <FiFileText className="text-red-500" /> PDF Rapport
           </button>
           <button 
            onClick={exportXML}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-3 text-dark dark:text-white border border-stroke dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-4 transition text-sm font-bold shadow-sm"
           >
             <FiDownload className="text-blue-500" /> XML Export
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
