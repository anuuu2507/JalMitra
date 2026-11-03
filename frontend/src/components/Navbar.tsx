import React from 'react';
import { useApp } from '../context/AppContext';
import { resetDemo } from '../api';
import { Droplets, PlayCircle, RotateCcw, Globe, Info, Menu, X, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const {
    language,
    setLanguage,
    t,
    tanks,
    selectedTankId,
    setSelectedTankId,
    refreshData,
    setIsDemoModalOpen,
    showToast,
  } = useApp();

  const handleReset = async () => {
    try {
      await resetDemo();
      await refreshData();
      showToast('Demo data successfully reset to baseline presentation state (75%).', 'success');
    } catch (err) {
      showToast('Failed to reset demo data.', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Branding & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Droplets className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                    {t.appName}
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-sky-100 text-sky-800 rounded-md">
                    2026
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500 hidden sm:block">
                  {t.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Community Selector & Hackathon Tag */}
          <div className="hidden md:flex items-center gap-4">
            {/* Hackathon Badge */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Seva First '26 · Swachh & Sustainable Bharat</span>
            </div>

            {/* Tank Selector */}
            <div className="flex items-center gap-1.5 bg-sky-50/80 border border-sky-200 rounded-lg px-2.5 py-1">
              <span className="text-xs font-medium text-sky-900 whitespace-nowrap">Tank:</span>
              <select
                aria-label="Select community water tank"
                value={selectedTankId}
                onChange={(e) => setSelectedTankId(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-sky-950 focus:outline-none cursor-pointer max-w-[200px] truncate"
              >
                {tanks.map((tank) => (
                  <option key={tank.id} value={tank.id}>
                    {language === 'te' ? tank.name_te : tank.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Actions, Language Switch, Demo Presentation Mode */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Simulation Badge with Tooltip */}
            <div
              className="relative group flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-medium cursor-help"
              title={t.simulatedTooltip}
            >
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden xl:inline">{t.simulatedSensorNotice}</span>
              <span className="xl:hidden">Simulated</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('te')}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'te'
                    ? 'bg-white text-sky-700 shadow-xs font-telugu'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                తెలుగు
              </button>
            </div>

            {/* Reset Demo Button */}
            <button
              onClick={handleReset}
              title="Reset simulated data to clean 75% baseline"
              className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{t.resetDemo}</span>
            </button>

            {/* Run Demo Scenario Button */}
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 rounded-lg shadow-sm shadow-sky-600/30 flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <PlayCircle className="w-4 h-4 text-sky-200" />
              <span>{t.runDemoScenario}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
