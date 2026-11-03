import React from 'react';
import { WaterStatus } from '../types';
import { useApp } from '../context/AppContext';
import { Activity, Radio, AlertTriangle } from 'lucide-react';

interface WaterTankVisualProps {
  levelPct: number;
  capacityLiters: number;
  currentLiters: number;
  status: WaterStatus;
  tankName: string;
  sensorStatus?: string;
  size?: 'normal' | 'large' | 'compact';
}

export const WaterTankVisual: React.FC<WaterTankVisualProps> = ({
  levelPct,
  capacityLiters,
  currentLiters,
  status,
  tankName,
  sensorStatus = 'Simulated Sensor Connected',
  size = 'normal',
}) => {
  const { language, t } = useApp();
  const clampedPct = Math.max(0, Math.min(100, levelPct));

  // Determine color themes based on status
  const getTheme = () => {
    switch (status) {
      case 'Sufficient':
        return {
          gradient: 'from-sky-600 via-sky-500 to-cyan-400',
          waveFill: '#0284c7',
          waveSecondary: '#38bdf8',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          pulseColor: 'bg-emerald-500',
          glow: 'shadow-[0_0_25px_rgba(2,132,199,0.3)]',
          label: t.sufficient,
        };
      case 'Moderate':
        return {
          gradient: 'from-blue-600 via-cyan-500 to-sky-400',
          waveFill: '#0369a1',
          waveSecondary: '#0ea5e9',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          pulseColor: 'bg-amber-500',
          glow: 'shadow-[0_0_20px_rgba(14,165,233,0.25)]',
          label: t.moderate,
        };
      case 'Low':
        return {
          gradient: 'from-amber-600 via-amber-500 to-yellow-400',
          waveFill: '#d97706',
          waveSecondary: '#f59e0b',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300 font-semibold',
          pulseColor: 'bg-amber-600 animate-pulse',
          glow: 'shadow-[0_0_25px_rgba(245,158,11,0.35)]',
          label: t.low,
        };
      case 'Critical':
      default:
        return {
          gradient: 'from-rose-600 via-red-500 to-rose-400',
          waveFill: '#dc2626',
          waveSecondary: '#ef4444',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
          pulseColor: 'bg-rose-600 animate-ping',
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.45)]',
          label: t.critical,
        };
    }
  };

  const theme = getTheme();
  const heightClass = size === 'large' ? 'h-80 sm:h-96' : size === 'compact' ? 'h-52' : 'h-64 sm:h-72';
  const widthClass = size === 'large' ? 'max-w-md' : size === 'compact' ? 'max-w-[220px]' : 'max-w-xs sm:max-w-sm';

  return (
    <div className={`relative flex flex-col items-center mx-auto w-full ${widthClass}`}>
      {/* Top Ultrasonic Transducer Cap */}
      <div className="relative z-20 flex flex-col items-center">
        {/* Sensor Housing */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 text-slate-100 rounded-full border border-slate-600 shadow-md text-xs font-mono">
          <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span className="text-[11px] font-medium tracking-wide">JSN-SR04T Sensor</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
        {/* Simulated Telemetry Ray */}
        <div className="w-0.5 h-4 bg-dashed bg-gradient-to-b from-sky-400 to-transparent"></div>
        {/* Tank Top Dome */}
        <div className="w-48 sm:w-56 h-4 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-t-xl border-t border-x border-slate-400 shadow-sm"></div>
      </div>

      {/* Main Cylindrical Tank Body */}
      <div
        className={`relative w-48 sm:w-56 ${heightClass} bg-gradient-to-b from-slate-100/90 to-slate-200/95 rounded-b-2xl border-2 border-slate-300 shadow-inner overflow-hidden backdrop-blur-sm ${theme.glow} transition-shadow duration-700`}
      >
        {/* Glass reflection gradient highlight */}
        <div className="absolute top-0 left-2 w-4 h-full bg-gradient-to-r from-white/40 to-transparent pointer-events-none z-10"></div>
        <div className="absolute top-0 right-2 w-2 h-full bg-gradient-to-l from-white/20 to-transparent pointer-events-none z-10"></div>

        {/* Graduation Tick Marks */}
        <div className="absolute left-1 top-0 bottom-0 w-8 flex flex-col justify-between py-2 text-[10px] font-mono text-slate-500 select-none z-10 pointer-events-none">
          <div className="flex items-center gap-1 border-t border-slate-400 pr-1"><span>100%</span></div>
          <div className="flex items-center gap-1 border-t border-slate-300 pr-1"><span>75%</span></div>
          <div className="flex items-center gap-1 border-t border-slate-300 pr-1"><span>50%</span></div>
          <div className="flex items-center gap-1 border-t border-slate-300 pr-1"><span>25%</span></div>
          <div className="flex items-center gap-1 border-t border-slate-400 pr-1"><span>0%</span></div>
        </div>

        {/* Dynamic Water Fluid Fill Container */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-in-out overflow-hidden"
          style={{ height: `${clampedPct}%` }}
        >
          {/* Wave Layer 1 */}
          <div className="absolute -top-3 left-0 right-0 w-[200%] h-6 animate-wave-fast pointer-events-none opacity-85">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M0.00,49.98 C150.00,150.00 349.81,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                fill={theme.waveFill}
              ></path>
            </svg>
          </div>

          {/* Wave Layer 2 (translucent depth) */}
          <div className="absolute -top-4 left-0 right-0 w-[200%] h-7 animate-wave-slow pointer-events-none opacity-60">
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full">
              <path
                d="M0.00,49.98 C190.00,120.00 310.81,-30.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                fill={theme.waveSecondary}
              ></path>
            </svg>
          </div>

          {/* Main Fluid Gradient */}
          <div className={`w-full h-full bg-gradient-to-t ${theme.gradient} opacity-90`}>
            {/* Subtle rising bubble simulation */}
            {clampedPct > 15 && (
              <div className="relative w-full h-full overflow-hidden pointer-events-none">
                <span className="absolute bottom-2 left-10 w-2 h-2 rounded-full bg-white/40 animate-bounce duration-1000"></span>
                <span className="absolute bottom-6 left-24 w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce duration-700"></span>
                <span className="absolute bottom-10 left-36 w-2.5 h-2.5 rounded-full bg-white/30 animate-bounce duration-1200"></span>
              </div>
            )}
          </div>
        </div>

        {/* Central Live Digital Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-2 text-center">
          <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 shadow-lg text-white">
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
              {clampedPct.toFixed(1)}
              <span className="text-sm font-sans font-medium text-sky-300 ml-0.5">%</span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium whitespace-nowrap">
              {Math.round(currentLiters).toLocaleString()} / {Math.round(capacityLiters).toLocaleString()} {t.liters}
            </div>
          </div>
          {status === 'Critical' && (
            <div className="mt-2 flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
              <AlertTriangle className="w-3 h-3" />
              <span>CRITICAL DEFICIT</span>
            </div>
          )}
        </div>
      </div>

      {/* Structural Support Legs & Drain Valve */}
      <div className="w-48 sm:w-56 flex justify-between px-4 text-slate-400">
        <div className="w-3 h-8 bg-gradient-to-b from-slate-400 to-slate-600 rounded-b"></div>
        <div className="w-1.5 h-6 bg-slate-500 rounded-b mt-1"></div>
        <div className="w-3 h-8 bg-gradient-to-b from-slate-400 to-slate-600 rounded-b"></div>
      </div>
      <div className="w-40 h-1.5 bg-slate-300 rounded-full mt-0.5"></div>

      {/* Status Pill Badge Below Tank */}
      <div className="mt-3 flex items-center gap-2">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${theme.badgeBg}`}>
          <span className={`w-2 h-2 rounded-full ${theme.pulseColor}`}></span>
          <span className="font-semibold">{theme.label}</span>
        </div>
      </div>

      {/* Hardware Disclosure Pill */}
      <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
        <Activity className="w-3 h-3 text-sky-600" />
        <span>{t.simulatedSensorConnected}</span>
      </div>
    </div>
  );
};
