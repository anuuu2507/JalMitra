import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Gauge,
  BellRing,
  Truck,
  BarChart3,
  Users,
  Cpu,
  Settings as SettingsIcon,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'tanks'
  | 'alerts'
  | 'supply'
  | 'analytics'
  | 'impact'
  | 'hardware'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpen,
  onClose,
}) => {
  const { t, dashboardData, language } = useApp();

  const unreadAlertsCount =
    dashboardData?.recent_alerts.filter((a) => !a.is_read).length || 0;

  const navItems: { id: PageId; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'tanks', label: t.tankMonitoring, icon: Gauge },
    { id: 'alerts', label: t.smartAlerts, icon: BellRing, badge: unreadAlertsCount },
    { id: 'supply', label: t.supplyUpdates, icon: Truck },
    { id: 'analytics', label: t.analytics, icon: BarChart3 },
    { id: 'impact', label: t.impactCost, icon: Users },
    { id: 'hardware', label: t.hardwareArchitecture, icon: Cpu },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

  const handleNavClick = (id: PageId) => {
    onSelectPage(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 sm:top-20 z-40 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        {/* Navigation Items */}
        <div className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {language === 'te' ? 'ప్రధాన నావిగేషన్' : 'Main Menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-900 border border-sky-200/80 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  />
                  <span className={`truncate ${language === 'te' ? 'font-telugu' : ''}`}>
                    {item.label}
                  </span>
                </div>

                {item.badge && item.badge > 0 ? (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-500 text-white shrink-0">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Challenge Footer Info Card */}
        <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-slate-900 to-sky-950 text-white shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold tracking-wide uppercase text-sky-300">
              Seva First 2026
            </span>
          </div>
          <div className="text-xs font-semibold leading-snug">
            Swachh & Sustainable Bharat
          </div>
          <div className="text-[11px] text-slate-300 mt-1">
            Track A · Open Undergraduate
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <span>Prototype v1.0</span>
            <span className="text-amber-300 font-mono">SIMULATED</span>
          </div>
        </div>
      </aside>
    </>
  );
};
