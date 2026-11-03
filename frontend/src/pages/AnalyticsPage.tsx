import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchAnalytics } from '../api';
import { AnalyticsData } from '../types';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Droplets,
  Calendar,
  Info,
  Clock,
  Sparkles,
  PieChart as PieIcon,
  Activity,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { selectedTankId, language, t } = useApp();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetchAnalytics(selectedTankId);
        setData(res);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedTankId]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Compiling Community Water Analytics...</p>
        </div>
      </div>
    );
  }

  const levelTrendData = data.history.map((r) => ({
    time: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    level: r.level_pct,
    liters: r.liters,
  }));

  const alertDistributionData = [
    { name: 'Critical', count: data.critical_alerts_count, color: '#ef4444' },
    { name: 'Warning', count: data.warning_alerts_count, color: '#f59e0b' },
    { name: 'Info', count: data.info_alerts_count, color: '#0284c7' },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.analytics}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'te' ? data.tank_name_te : data.tank_name} · Multi-day availability trends & consumption patterns
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs text-slate-700 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Last 24 Hours Analysis</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Availability Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.availabilityTrend}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {data.availability_trend}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Average Level: <span className="font-mono font-bold text-slate-800">{data.average_level_pct}%</span>
          </p>
        </div>

        {/* Card 2: Total Alerts Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Alerts Recorded</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {data.total_alerts_count}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {data.critical_alerts_count} Critical · {data.warning_alerts_count} Warning
          </p>
        </div>

        {/* Card 3: Supply Events */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Supply Events</span>
            <Layers className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {data.supply_events_count}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Operator notices published
          </p>
        </div>

        {/* Card 4: Estimated Water Saved (Demo Model) */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Water Saved (Demo)</span>
            <Droplets className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-950 font-mono">
            ~{Math.round(data.estimated_water_saved_liters).toLocaleString()} L
          </div>
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mt-2 block">
            SIMULATED ASSUMPTION
          </span>
        </div>

      </div>

      {/* Daily Statistics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {language === 'te' ? 'రోజువారీ సగటు మట్టం' : 'Daily Average Level'}
          </span>
          <span className="text-xl font-bold font-mono text-slate-900">
            {data.average_level_pct}%
          </span>
        </div>
        <div className="border-t sm:border-t-0 sm:border-x border-slate-100 pt-2 sm:pt-0">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {language === 'te' ? 'కనిష్ట నీటి మట్టం' : 'Minimum Level'}
          </span>
          <span className="text-xl font-bold font-mono text-amber-700">
            {data.min_level_pct ?? data.average_level_pct}%
          </span>
        </div>
        <div className="border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {language === 'te' ? 'గరిష్ట నీటి మట్టం' : 'Maximum Level'}
          </span>
          <span className="text-xl font-bold font-mono text-sky-700">
            {data.max_level_pct ?? data.average_level_pct}%
          </span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Level Over Time (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Water Level Telemetry Profile
              </h3>
              <p className="text-xs text-slate-500">
                Simulated drawdown and recharge curves
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={levelTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Level']}
                />
                <Area
                  type="monotone"
                  dataKey="level"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#analyticsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Alert Severity Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Alerts by Severity
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Threshold breakdown across records
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {alertDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Critical Alerts (0–9%)</span>
              </span>
              <span className="font-mono font-bold text-slate-900">{data.critical_alerts_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Warning Alerts (10–69%)</span>
              </span>
              <span className="font-mono font-bold text-slate-900">{data.warning_alerts_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                <span>Informational Alerts (70–100%)</span>
              </span>
              <span className="font-mono font-bold text-slate-900">{data.info_alerts_count}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Transparent Water Saved Simulation Methodology Box */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold">Simulated Water Conservation Model</h4>
              <p className="text-xs text-slate-300">Methodology & Assumptions Disclosure</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            DEMO ESTIMATE ONLY
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {data.estimate_explanation}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Assumed Overflow Avoidance:</span>
            <span className="font-bold text-white">4.5% of Tank Capacity / week</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Coordinated Tap Closing:</span>
            <span className="font-bold text-white">3.0% draw reduction</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Field Validation Status:</span>
            <span className="font-bold text-amber-300">Phase 2 Field Study Planned</span>
          </div>
        </div>
      </div>

    </div>
  );
};
