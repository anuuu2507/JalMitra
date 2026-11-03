import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  updateWaterLevel,
  simulateConsumption,
  simulateRefill,
  fetchTankHistory,
} from '../api';
import { WaterTankVisual } from '../components/WaterTankVisual';
import { StatusBadge } from '../components/StatusBadge';
import { WaterLevelRecord } from '../types';
import {
  Sliders,
  MinusCircle,
  PlusCircle,
  Activity,
  Radio,
  Clock,
  Sparkles,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export const TankMonitoringPage: React.FC = () => {
  const {
    dashboardData,
    selectedTankId,
    refreshData,
    language,
    t,
    showToast,
  } = useApp();

  const [sliderValue, setSliderValue] = useState<number>(75);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [historyRecords, setHistoryRecords] = useState<WaterLevelRecord[]>([]);
  const [trendView, setTrendView] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    if (dashboardData) {
      setSliderValue(dashboardData.current_level_pct);
    }
  }, [dashboardData]);

  // Load history records for the tank
  const loadHistory = async () => {
    try {
      const recs = await fetchTankHistory(selectedTankId, trendView === 'daily' ? 24 : 50);
      setHistoryRecords(recs);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedTankId, trendView, dashboardData?.current_level_pct]);

  const handleApplySlider = async () => {
    setIsUpdating(true);
    try {
      const updated = await updateWaterLevel(selectedTankId, sliderValue);
      await refreshData();
      showToast(
        `Water level set to ${updated.current_level_pct}%. Status: ${updated.status}`,
        'success'
      );
    } catch (err: any) {
      showToast('Failed to update water level', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreset = async (targetPct: number) => {
    setSliderValue(targetPct);
    setIsUpdating(true);
    try {
      const updated = await updateWaterLevel(selectedTankId, targetPct);
      await refreshData();
      showToast(
        `Preset ${targetPct}% applied via backend. Status: ${updated.status}`,
        'success'
      );
    } catch (err: any) {
      showToast('Failed to apply preset', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSimulateConsume = async () => {
    setIsUpdating(true);
    try {
      const updated = await simulateConsumption(selectedTankId, 15.0);
      await refreshData();
      setSliderValue(updated.current_level_pct);
      showToast(
        `Consumption simulated (-15%). Current: ${updated.current_level_pct}% (${updated.status})`,
        'info'
      );
    } catch (err: any) {
      showToast('Consumption simulation failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSimulateRefill = async () => {
    setIsUpdating(true);
    try {
      const updated = await simulateRefill(selectedTankId, 25.0);
      await refreshData();
      setSliderValue(updated.current_level_pct);
      showToast(
        `Refill simulated (+25%). Current: ${updated.current_level_pct}% (${updated.status})`,
        'success'
      );
    } catch (err: any) {
      showToast('Refill simulation failed', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!dashboardData) return null;

  const { tank, current_level_pct, capacity_liters, current_liters, status } = dashboardData;

  const chartData = historyRecords.map((r, i) => ({
    label: new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    level: r.level_pct,
    liters: r.liters,
    status: r.status,
  }));

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.tankMonitoring}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'te' ? tank.name_te : tank.name} · {tank.location}
          </p>
        </div>

        {/* Sensor Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl text-xs font-medium">
          <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          <span>Simulated Sensor Connected</span>
        </div>
      </div>

      {/* Main Grid: Visual & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Custom Animated Tank Card (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between items-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Hydrodynamic Model
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'te' ? tank.name_te : tank.name}
              </h3>
            </div>
            <StatusBadge status={status} type="water" />
          </div>

          <div className="py-4 w-full flex justify-center">
            <WaterTankVisual
              levelPct={current_level_pct}
              capacityLiters={capacity_liters}
              currentLiters={current_liters}
              status={status}
              tankName={tank.name}
              size="large"
            />
          </div>

          {/* Metric Badges */}
          <div className="w-full grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Volume</span>
              <span className="font-bold text-slate-800 font-mono text-sm">
                {Math.round(capacity_liters).toLocaleString()} L
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Available Now</span>
              <span className="font-bold text-sky-700 font-mono text-sm">
                {Math.round(current_liters).toLocaleString()} L
              </span>
            </div>
          </div>
        </div>

        {/* Right: Demo Control Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Demo Control Card */}
          <div className="bg-white p-6 rounded-3xl border border-sky-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t.demoControls}</h3>
                  <p className="text-xs text-slate-500">FastAPI backend state manipulation</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                Live Backend Hook
              </span>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                {t.quickPresets}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[85, 75, 45, 20, 10].map((val) => (
                  <button
                    key={val}
                    onClick={() => handlePreset(val)}
                    disabled={isUpdating}
                    className={`py-2 px-1 text-xs font-mono font-bold rounded-xl border transition-all ${
                      Math.round(current_level_pct) === val
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-sky-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Slider */}
            <div className="space-y-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">{t.sliderInstruction}</span>
                <span className="font-mono font-bold text-base text-sky-700">
                  {sliderValue.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0% (Empty)</span>
                <span>25% (Low)</span>
                <span>50% (Moderate)</span>
                <span>75% (Sufficient)</span>
                <span>100% (Full)</span>
              </div>

              <button
                onClick={handleApplySlider}
                disabled={isUpdating}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                <span>{t.updateWaterLevel}</span>
              </button>
            </div>

            {/* Step Simulator Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleSimulateConsume}
                disabled={isUpdating}
                className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MinusCircle className="w-4 h-4 text-amber-700" />
                <span>{t.simulateConsumption}</span>
              </button>

              <button
                onClick={handleSimulateRefill}
                disabled={isUpdating}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                <span>{t.simulateRefill}</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>
                Backend evaluates threshold boundaries and generates bilingual alerts automatically when thresholds are crossed.
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* History & Trend Chart Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t.waterLevelOverTime}
            </h3>
            <p className="text-xs text-slate-500">
              Simulated telemetry trajectory with threshold reference bands
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setTrendView('daily')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                trendView === 'daily'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24-Hour View
            </button>
            <button
              onClick={() => setTrendView('weekly')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                trendView === 'weekly'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly Cycle
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
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
              <ReferenceLine y={70} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Sufficient (70%)', fill: '#10b981', fontSize: 10 }} />
              <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Moderate (30%)', fill: '#f59e0b', fontSize: 10 }} />
              <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical (10%)', fill: '#ef4444', fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="level"
                stroke="#0284c7"
                strokeWidth={3}
                dot={{ r: 3, fill: '#0284c7' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
