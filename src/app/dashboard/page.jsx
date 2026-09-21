'use client';

import React, { useState, useEffect } from 'react';
import cn from 'classnames';
import AppLink from '@/components/AppLink';
import Loader from '@/components/Loader';
import NewEventButton from '@/components/dashboard/NewEventButton';
import { 
  FiCalendar, FiUsers, FiDollarSign, FiActivity, 
  FiRefreshCw, FiChevronDown, FiPlus, FiArrowUpRight, 
  FiCheckCircle, FiMoreVertical, FiExternalLink, FiFileText, 
  FiUserCheck, FiSmartphone, FiZap, FiClock, FiTrendingUp, FiFilter
} from 'react-icons/fi';
import { BsQrCode, BsStars, BsShieldCheck } from 'react-icons/bs';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, PieChart, Pie, Cell 
} from 'recharts';

export default function DashboardOverviewPage() {
  const [tab, setTab] = useState('ongoing');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalEvents: 0,
    totalGuests: 0,
    totalStaff: 0,
    totalRevenue: 0,
    projectSummary: [],
    pieDistribution: [],
    monthlyCashflow: [],
    recentPayments: [],
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/overview');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const {
    database,
    totalEvents = 0,
    totalGuests = 0,
    totalStaff = 0,
    totalRevenue = 0,
    projectSummary = [],
    pieDistribution = [],
    monthlyCashflow = [],
    recentPayments = [],
  } = data;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#3B52E8]/20 border-t-[#3B52E8] animate-spin" />
          <BsStars className="absolute text-[#FF6500] text-xl animate-pulse" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">
          Chargement de votre Tableau de Bord Exécutif...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-16">
      
      {/* 1. EXECUTIVE HERO BANNER (COMPACT HEIGHT) */}
      <div className="relative bg-gradient-to-r from-[#0B1736] via-[#1E293B] to-[#0B1736] py-5 px-6 sm:px-8 rounded-[24px] text-white shadow-xl overflow-hidden border border-slate-700/50">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#3B52E8]/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#FF6500]/15 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-[#3B52E8]/20 text-[#3B52E8] border border-[#3B52E8]/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                <BsStars size={12} className="text-[#FF6500]" /> ThaborSolution Executive Suite
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Base de données Neon Synchro</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Tableau de Bord Exécutif
            </h1>
            <p className="text-slate-300 text-xs leading-relaxed font-medium">
              Supervisez la présence de vos invités et suivez le taux d'accès en temps réel.
            </p>
          </div>

          {/* Quick Actions Cluster */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <NewEventButton className="inline-flex items-center justify-center rounded-xl bg-[#FF6500] hover:bg-[#e05900] py-2.5 px-5 text-center text-xs font-black text-white uppercase tracking-wider shadow-md shadow-[#FF6500]/20 hover:scale-105 active:scale-95 transition-all gap-2 cursor-pointer" />

            <AppLink 
              href="/scan" 
              className="inline-flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 py-2.5 px-4 text-center text-xs font-black text-white uppercase tracking-wider backdrop-blur-md transition-all gap-2 hover:scale-105 active:scale-95 shadow-sm"
            >
              <BsQrCode size={16} className="text-amber-400" />
              <span>Scanner Pass</span>
            </AppLink>

            <button
              onClick={fetchDashboardData}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all hover:rotate-185 shadow-sm cursor-pointer"
              title="Actualiser les données"
            >
              <FiRefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI METRICS CARDS (4 COLUMNS GRID) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Événements Actifs */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#3B52E8]/10 text-[#3B52E8] flex items-center justify-center font-black">
              <FiCalendar size={22} />
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#3B52E8] text-[10px] font-black uppercase tracking-wider">
              Cérémonies
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 tracking-tight block">
              {totalEvents}
            </span>
            <span className="text-xs font-bold text-slate-400 mt-1 block">
              Événements enregistrés
            </span>
          </div>
        </div>

        {/* KPI 2: Total Invités */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
              <FiUsers size={22} />
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
              Participants
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 tracking-tight block">
              {totalGuests}
            </span>
            <span className="text-xs font-bold text-slate-400 mt-1 block">
              Invités inscrits & confirmés
            </span>
          </div>
        </div>

        {/* KPI 3: Billeterie / Recettes */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#FF6500] flex items-center justify-center font-black">
              <FiDollarSign size={22} />
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-[#FF6500] text-[10px] font-black uppercase tracking-wider">
              Recettes
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 tracking-tight block truncate">
              {totalRevenue ? `${totalRevenue.toLocaleString()} FCFA` : '0 FCFA'}
            </span>
            <span className="text-xs font-bold text-slate-400 mt-1 block">
              Ventes de pass & billeterie
            </span>
          </div>
        </div>

        {/* KPI 4: Équipe & Hôtes */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-black">
              <FiUserCheck size={22} />
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider">
              Contrôle Staff
            </span>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 tracking-tight block">
              {totalStaff}
            </span>
            <span className="text-xs font-bold text-slate-400 mt-1 block">
              Hôtes & Agents autorisés
            </span>
          </div>
        </div>

      </div>

      {/* 3. ROW 1: APERÇU DES ÉVÉNEMENTS (7 COLS) & RÉPARTITION STATISTIQUE (5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Table Column (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-200/70 flex flex-col justify-between space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Aperçu des Événements</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Suivi en direct des cérémonies et du taux de présence</p>
            </div>

            {/* Filter Sub-tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
              <button 
                onClick={() => setTab('ongoing')} 
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  tab === 'ongoing' ? "bg-white text-[#3B52E8] shadow-xs" : "text-slate-500 hover:text-slate-900"
                )}
              >
                En cours
              </button>
              <button 
                onClick={() => setTab('negotiation')} 
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer",
                  tab === 'negotiation' ? "bg-white text-[#3B52E8] shadow-xs" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Planifiés
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {projectSummary.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl mx-auto flex items-center justify-center text-slate-400">
                  <FiCalendar size={28} />
                </div>
                <p className="text-sm font-black text-slate-800">Aucun événement trouvé</p>
                <p className="text-xs text-slate-400 font-medium">Commencez par créer votre premier événement pour commencer le suivi.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-3 px-3">Nom Événement</th>
                    <th className="py-3 px-3">Accès</th>
                    <th className="py-3 px-3">Date Début</th>
                    <th className="py-3 px-3">Présences</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {projectSummary.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-3">
                        <span className="font-extrabold text-slate-900 block truncate max-w-[180px]">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">ID: {p.id.slice(0, 8)}</span>
                      </td>
                      <td className="py-4 px-3">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          p.type.includes('Payant') 
                            ? "bg-amber-100/80 text-[#FF6500]" 
                            : "bg-blue-100/80 text-[#3B52E8]"
                        )}>
                          {p.type}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-slate-500 font-medium">
                        {p.startDate}
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-[#3B52E8] h-full rounded-full transition-all duration-700" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="text-xs font-black text-slate-900">{p.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <AppLink 
              href="/dashboard/events" 
              className="inline-flex items-center gap-2 text-xs font-black text-[#3B52E8] hover:text-[#2b40c7] uppercase tracking-wider"
            >
              <span>Voir tous les événements ({totalEvents})</span>
              <FiArrowUpRight size={16} />
            </AppLink>
          </div>

        </div>

        {/* Statistic Donut Column (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-200/70 flex flex-col justify-between space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Répartition Invités</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Statuts globaux d'accès & validation</p>
            </div>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">
              {new Date().getFullYear()}
            </span>
          </div>

          {/* Donut Chart Display */}
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
            
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={pieDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-2xl font-black text-slate-900">{totalGuests}</span>
                 <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Total</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="space-y-3.5 text-xs font-bold text-slate-700 w-full sm:w-auto">
              {pieDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between sm:justify-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: item.color }} />
                    <span className="font-extrabold text-slate-800">{item.name}</span>
                  </div>
                  <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3B52E8] flex items-center justify-center shrink-0">
               <BsShieldCheck size={20} />
             </div>
             <p className="text-xs font-semibold text-slate-600 leading-snug">
               Toutes les entrées sont sécurisées par QR Code chiffré unique avec vérification anti-double entrée.
             </p>
          </div>

        </div>

      </div>

      {/* 4. ROW 2: FRÉQUENTATION MENSUELLE (7 COLS) & DERNIÈRES INSCRIPTIONS (5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cashflow Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-200/70 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Activité & Fréquentation</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Évolution des inscriptions et recettes par mois</p>
            </div>

            <div className="flex items-center gap-5 text-xs font-bold">
              <span className="flex items-center gap-2 text-slate-700 font-extrabold">
                <span className="w-3 h-3 rounded-full bg-[#3B52E8]" /> Inscriptions / Recettes
              </span>
              <span className="flex items-center gap-2 text-slate-700 font-extrabold">
                <span className="w-3 h-3 rounded-full bg-[#FF6500]" /> Logistique / Entrées
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={monthlyCashflow} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B52E8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3B52E8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="outcomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6500" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#FF6500" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1736', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px', padding: '12px 16px' }}
                />
                <Area type="monotone" dataKey="income" name="Inscriptions" stroke="#3B52E8" strokeWidth={3} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="outcome" name="Présences" stroke="#FF6500" strokeWidth={3} fillOpacity={1} fill="url(#outcomeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

        {/* Recent Guest Registrations Column (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-200/70 flex flex-col justify-between space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Dernières Inscriptions</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Invités récemment enregistrés</p>
            </div>
            
            <AppLink 
              href="/dashboard/events" 
              className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-[#3B52E8] hover:text-white text-slate-700 text-xs font-black transition-all cursor-pointer"
            >
              Tout voir
            </AppLink>
          </div>

          <div className="space-y-4">
            {recentPayments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-semibold text-xs">
                Aucune inscription récente.
              </div>
            ) : (
              recentPayments.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100/80">
                  
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.avatar} 
                      alt={item.name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs" 
                    />
                    <div>
                      <h3 className="text-xs font-black text-slate-900">{item.name}</h3>
                      <p className="text-[10px] font-semibold text-slate-400 truncate max-w-[140px]">{item.sub}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100/80 text-emerald-700">
                      {item.amount}
                    </span>
                    <p className="text-[9px] font-bold text-slate-400 mt-0.5">{item.date}</p>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
