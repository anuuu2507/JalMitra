import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { DemoWalkthroughModal } from './components/DemoWalkthroughModal';
import { NotificationPreviewModal } from './components/NotificationPreviewModal';
import { DashboardPage } from './pages/DashboardPage';
import { TankMonitoringPage } from './pages/TankMonitoringPage';
import { AlertsPage } from './pages/AlertsPage';
import { SupplyUpdatesPage } from './pages/SupplyUpdatesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ImpactCostPage } from './pages/ImpactCostPage';
import { HardwareSpecPage } from './pages/HardwareSpecPage';
import { SettingsPage } from './pages/SettingsPage';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const { toast } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Top Navigation Bar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => setCurrentPage(page)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage onNavigate={(page) => setCurrentPage(page)} />
          )}
          {currentPage === 'tanks' && <TankMonitoringPage />}
          {currentPage === 'alerts' && <AlertsPage />}
          {currentPage === 'supply' && <SupplyUpdatesPage />}
          {currentPage === 'analytics' && <AnalyticsPage />}
          {currentPage === 'impact' && <ImpactCostPage />}
          {currentPage === 'hardware' && <HardwareSpecPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <DemoWalkthroughModal />
      <NotificationPreviewModal />

      {/* Global Floating Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 flex items-start gap-3 animate-bounce-short">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}
          <div className="flex-1 text-xs leading-relaxed font-medium">
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
