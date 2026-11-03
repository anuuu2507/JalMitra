import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchSettings, updateSettings, resetDemo } from '../api';
import {
  Settings as SettingsIcon,
  Globe,
  Sliders,
  RotateCcw,
  ShieldCheck,
  CheckCircle,
  Database,
  Info,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    language,
    setLanguage,
    communities,
    tanks,
    selectedTankId,
    setSelectedTankId,
    refreshData,
    t,
    showToast,
  } = useApp();

  const [sufficientThreshold, setSufficientThreshold] = useState<number>(70);
  const [moderateThreshold, setModerateThreshold] = useState<number>(30);
  const [lowThreshold, setLowThreshold] = useState<number>(10);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        setSufficientThreshold(s.sufficient_threshold);
        setModerateThreshold(s.moderate_threshold);
        setLowThreshold(s.low_threshold);
      })
      .catch(console.error);
  }, []);

  const handleSaveThresholds = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        sufficient_threshold: sufficientThreshold,
        moderate_threshold: moderateThreshold,
        low_threshold: lowThreshold,
      });
      await refreshData();
      showToast('Threshold settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all demo data back to clean baseline presentation state?')) {
      try {
        await resetDemo();
        await refreshData();
        showToast('Demo data reset to clean baseline (75%).', 'success');
      } catch (err) {
        showToast('Reset failed', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.settings}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure application localization, active community parameters, and simulation rules
        </p>
      </div>

      {/* Language Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Globe className="w-5 h-5 text-sky-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">{t.languageSelect}</h3>
            <p className="text-xs text-slate-500">Select default interface language for all screens</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              language === 'en'
                ? 'bg-sky-50 border-sky-600 text-sky-950 ring-2 ring-sky-200'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="text-sm font-bold">English</div>
            <div className="text-xs text-slate-500 mt-1">Standard Government & Challenge Format</div>
          </button>

          <button
            onClick={() => setLanguage('te')}
            className={`p-4 rounded-2xl border text-left transition-all font-telugu ${
              language === 'te'
                ? 'bg-sky-50 border-sky-600 text-sky-950 ring-2 ring-sky-200'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="text-sm font-bold">తెలుగు (Telugu)</div>
            <div className="text-xs text-slate-500 mt-1">గ్రామీణ పౌరులకు స్థానిక భాషా ఇంటర్‌ఫేస్</div>
          </button>
        </div>
      </div>

      {/* Community Selection */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">{t.communitySelect}</h3>
            <p className="text-xs text-slate-500">Switch active community overhead tank for demo display</p>
          </div>
        </div>

        <div className="space-y-3">
          {tanks.map((tank) => (
            <div
              key={tank.id}
              onClick={() => setSelectedTankId(tank.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                selectedTankId === tank.id
                  ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-100'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {language === 'te' ? tank.name_te : tank.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {tank.location} · Capacity: {Math.round(tank.capacity_liters).toLocaleString()} L
                </div>
              </div>

              {selectedTankId === tank.id && (
                <span className="px-2.5 py-1 bg-sky-600 text-white rounded-lg text-xs font-semibold">
                  Active
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Threshold Configuration */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Sliders className="w-5 h-5 text-sky-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">{t.thresholdSettings}</h3>
            <p className="text-xs text-slate-500">Adjust percentage rules triggering automated alerts</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-emerald-800">Sufficient Threshold (%):</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{sufficientThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              value={sufficientThreshold}
              onChange={(e) => setSufficientThreshold(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-amber-800">Moderate Warning Threshold (%):</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{moderateThreshold}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="60"
              value={moderateThreshold}
              onChange={(e) => setModerateThreshold(Number(e.target.value))}
              className="w-full accent-amber-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-rose-800">Low Water Critical Threshold (%):</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{lowThreshold}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              value={lowThreshold}
              onChange={(e) => setLowThreshold(Number(e.target.value))}
              className="w-full accent-rose-600"
            />
          </div>

          <button
            onClick={handleSaveThresholds}
            disabled={isSaving}
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-xs transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Threshold Parameters'}
          </button>
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Reset Demo State</h4>
          <p className="text-xs text-slate-500">
            Restores database records back to the 75% baseline presentation state
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Demo Data</span>
        </button>
      </div>

      {/* Prototype Disclosures */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-sky-400" />
          <h4 className="text-sm font-bold">Challenge Prototype Disclosures</h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {t.disclaimerText}
        </p>
        <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex flex-wrap gap-4">
          <span>Seva First Innovation Challenge 2026</span>
          <span>Theme: Swachh & Sustainable Bharat</span>
          <span>Track A: Product or Technology</span>
        </div>
      </div>

    </div>
  );
};
