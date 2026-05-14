'use client';

import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiActivity, FiFilter, FiCheckCircle, FiUsers, FiLink, FiX, FiEdit3 } from 'react-icons/fi';
import cn from 'classnames';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

export default function EventStatistics({ event, guests }) {
  const [selectedField, setSelectedField] = useState('status');
  const [selectedSession, setSelectedSession] = useState('all'); // 'all' or 'd1s1', etc.
  const [chartType, setChartType] = useState('bar'); // bar, pie, area, line
  const [valueGroups, setValueGroups] = useState({}); // { [field]: { [val]: group } }
  const [showGroupsManager, setShowGroupsManager] = useState(false);

  // Prepare available sessions for filtering
  const availableSessions = useMemo(() => {
    const days = event.attendanceDays || 1;
    const sessions = event.sessionsPerDay || 1;
    const list = [{ id: 'all', label: 'Toutes les sessions' }];
    for (let d = 1; d <= days; d++) {
      for (let s = 1; s <= sessions; s++) {
        list.push({ id: `d${d}s${s}`, label: `Jour ${d} - Session ${s}` });
      }
    }
    return list;
  }, [event.attendanceDays, event.sessionsPerDay]);

  // Parse custom fields configuration
  const customFields = useMemo(() => {
    try {
      return JSON.parse(event.customFields || '[]');
    } catch (e) {
      return [];
    }
  }, [event.customFields]);

  // Fields available for statistics
  const availableFields = useMemo(() => {
    const fields = [
      { name: 'status', label: 'Statut de Paiement' },
      ...customFields
    ];
    return fields;
  }, [customFields]);

  // Get unique values for the current field (for grouping UI)
  const uniqueValues = useMemo(() => {
    const values = new Set();
    guests.forEach(guest => {
      let val;
      if (selectedField === 'status') {
        val = guest.status === 'PAID' ? 'Validé' : guest.status === 'PENDING' ? 'En attente' : 'Annulé';
      } else {
        try {
          const data = JSON.parse(guest.additionalData || '{}');
          val = data[selectedField];
        } catch (e) {}
      }
      
      if (Array.isArray(val)) {
        val.forEach(v => v && values.add(String(v).trim()));
      } else if (val) {
        values.add(String(val).trim());
      }
    });
    return Array.from(values).sort();
  }, [guests, selectedField]);

  // Process data for the selected field
  const chartData = useMemo(() => {
    const countsMap = new Map(); // key: groupName (or value if no group), value: count
    const fieldGroups = valueGroups[selectedField] || {};
    
    const processValue = (v) => {
      if (v === null || v === undefined) return;
      
      const strV = String(v).trim();
      if (!strV) return;
      
      const key = strV.toLowerCase();
      // Use the manual group name if it exists, otherwise use the original value
      const groupName = fieldGroups[strV] || strV;
      const groupKey = groupName.toLowerCase();

      if (countsMap.has(groupKey)) {
        countsMap.get(groupKey).count += 1;
      } else {
        countsMap.set(groupKey, { label: groupName, count: 1 });
      }
    };

    guests.forEach(guest => {
      if (selectedField === 'status') {
        const label = guest.status === 'PAID' ? 'Validé' : guest.status === 'PENDING' ? 'En attente' : 'Annulé';
        processValue(label);
      } else {
        try {
          const data = JSON.parse(guest.additionalData || '{}');
          const value = data[selectedField];
          
          if (Array.isArray(value)) {
            value.forEach(v => processValue(v));
          } else if (value !== undefined) {
            processValue(value);
          } else {
            processValue('Non renseigné');
          }
        } catch (e) {
          processValue('Erreur');
        }
      }
    });

    return Array.from(countsMap.values()).map(item => ({ name: item.label, value: item.count }));
  }, [guests, selectedField, valueGroups]);

  // Attendance stats with session filtering
  const attendanceStats = useMemo(() => {
    let presentCount = 0;
    guests.forEach(guest => {
      try {
        const att = JSON.parse(guest.attendance || '{}');
        
        if (selectedSession === 'all') {
          // If any session has true, mark as present
          if (Object.values(att).some(v => v === true)) {
            presentCount++;
          }
        } else {
          // Check specific session
          if (att[selectedSession] === true) {
            presentCount++;
          }
        }
      } catch (e) {}
    });

    return [
      { name: 'Présents', value: presentCount },
      { name: 'Absents', value: guests.length - presentCount }
    ];
  }, [guests, selectedSession]);

  // Custom Tooltip for professional look
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-2 p-4 border border-stroke dark:border-white/10 rounded-xl shadow-xl">
          <p className="text-sm font-bold text-dark dark:text-white mb-1">{label}</p>
          <p className="text-primary font-bold text-lg">
            {payload[0].value} <span className="text-xs text-body-color font-normal">({guests.length > 0 ? ((payload[0].value / guests.length) * 100).toFixed(1) : 0}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const totalEntries = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-80 text-body-color italic">
          Aucune donnée disponible pour ce champ
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 30, right: 30, left: 20, bottom: 60 }
    };

    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={4} dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} label={{ position: 'top', fill: '#637381', fontSize: 12, fontWeight: 'bold' }}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Configuration Header */}
      <div className="bg-white dark:bg-dark-2 p-6 rounded-3xl border border-stroke dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <FiFilter size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-dark dark:text-white">Analyse par Variable</h3>
            <p className="text-xs text-body-color">Sélectionnez une variable pour générer les statistiques</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Field Selector */}
          <div className="flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-dark-3 p-1 rounded-xl border border-stroke dark:border-white/5 max-w-full overflow-x-auto custom-scrollbar">
            {availableFields.map(field => (
              <button
                key={field.name}
                onClick={() => setSelectedField(field.name)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                  selectedField === field.name 
                    ? "bg-white dark:bg-dark-2 text-primary shadow-sm" 
                    : "text-body-color hover:text-dark dark:hover:text-white"
                )}
              >
                {field.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-dark-3 p-1 rounded-xl border border-stroke dark:border-white/5">
            {[
              { id: 'bar', icon: FiBarChart2 },
              { id: 'pie', icon: FiPieChart },
              { id: 'area', icon: FiTrendingUp },
              { id: 'line', icon: FiActivity },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  chartType === type.id 
                    ? "bg-white dark:bg-dark-2 text-primary shadow-sm" 
                    : "text-body-color hover:text-dark dark:hover:text-white"
                )}
                title={type.id.charAt(0).toUpperCase() + type.id.slice(1)}
              >
                <type.icon size={20} />
              </button>
            ))}
          </div>

          {/* Grouping Toggle */}
          <button
            onClick={() => setShowGroupsManager(!showGroupsManager)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
              showGroupsManager 
                ? "bg-primary text-white border-primary" 
                : "bg-white dark:bg-dark-2 text-dark dark:text-white border-stroke dark:border-white/10 hover:border-primary/50"
            )}
          >
            <FiLink size={16} />
            <span>Lier les valeurs</span>
          </button>
        </div>
      </div>

      {/* Groups Manager Panel */}
      {showGroupsManager && (
        <div className="bg-white dark:bg-dark-2 p-8 rounded-3xl border border-primary/20 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-dark dark:text-white flex items-center gap-2">
                <FiEdit3 className="text-primary" /> Regroupement manuel des valeurs
              </h4>
              <p className="text-xs text-body-color mt-1">Donnez le même nom à plusieurs valeurs pour les fusionner dans les graphiques</p>
            </div>
            <button onClick={() => setShowGroupsManager(false)} className="p-2 text-body-color hover:text-red-500 transition">
              <FiX size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {uniqueValues.map(val => (
              <div key={val} className="flex flex-col gap-1 p-3 bg-gray-50 dark:bg-dark-3 rounded-xl border border-stroke dark:border-white/5">
                <span className="text-[10px] font-bold text-body-color truncate uppercase" title={val}>{val}</span>
                <input 
                  type="text"
                  placeholder="Grouper sous..."
                  className="bg-white dark:bg-dark-2 border border-stroke dark:border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition"
                  value={valueGroups[selectedField]?.[val] || ''}
                  onChange={(e) => {
                    const newGroups = { ...valueGroups };
                    if (!newGroups[selectedField]) newGroups[selectedField] = {};
                    newGroups[selectedField][val] = e.target.value;
                    setValueGroups(newGroups);
                  }}
                />
              </div>
            ))}
            {uniqueValues.length === 0 && (
              <div className="col-span-full py-10 text-center text-body-color italic text-sm">
                Aucune valeur trouvée pour ce champ
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
             <button 
              onClick={() => {
                const newGroups = { ...valueGroups };
                delete newGroups[selectedField];
                setValueGroups(newGroups);
              }} 
              className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-wider"
            >
              Réinitialiser ce champ
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-2 p-8 rounded-3xl border border-stroke dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold text-dark dark:text-white flex items-center gap-2">
              Répartition : {availableFields.find(f => f.name === selectedField)?.label}
            </h4>
            <div className="px-4 py-1.5 bg-gray-100 dark:bg-dark-3 rounded-full text-xs font-bold text-body-color">
              Total : <span className="text-primary">{totalEntries}</span> entrées
            </div>
          </div>
          {renderChart()}
        </div>

        {/* Presence Statistics */}
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold text-dark dark:text-white flex items-center gap-2">
              <FiCheckCircle className="text-green-500" /> Statistiques de Présence
            </h4>
            
            {/* Session Selector */}
            <select 
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-gray-100 dark:bg-dark-3 text-[10px] font-black uppercase tracking-wider text-primary border-none rounded-lg px-2 py-1 outline-none cursor-pointer"
            >
              {availableSessions.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-grow flex items-center justify-center min-h-[250px]">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={attendanceStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" opacity={0.1} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-body-color">Présents</span>
              </div>
              <span className="font-bold text-green-600">{attendanceStats[0].value}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-body-color">Absents</span>
              </div>
              <span className="font-bold text-red-600">{attendanceStats[1].value}</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-stroke dark:border-white/5">
            <div className="text-center">
              <div className="text-4xl font-black text-primary mb-1">
                {guests.length > 0 ? ((attendanceStats[0].value / guests.length) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs font-bold uppercase text-body-color tracking-widest">Taux de présence</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
