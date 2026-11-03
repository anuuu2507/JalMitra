import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchAlerts, markAlertRead } from '../api';
import { Alert, AlertSeverity } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  BellRing,
  Filter,
  CheckCheck,
  Search,
  Smartphone,
  Info,
  Calendar,
  ShieldAlert,
  Droplets,
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { selectedTankId, openPhonePreview, language, t, showToast } = useApp();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterUnread, setFilterUnread] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAlerts({
        tankId: selectedTankId,
        severity: filterSeverity,
        unreadOnly: filterUnread,
      });
      setAlerts(data);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [selectedTankId, filterSeverity, filterUnread]);

  const handleMarkRead = async (alertId: number) => {
    try {
      await markAlertRead(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a))
      );
      showToast('Alert marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark alert as read', 'error');
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      a.message_en.toLowerCase().includes(term) ||
      a.message_te.toLowerCase().includes(term) ||
      a.alert_type.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.smartAlerts}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time threshold evaluations and community water supply announcements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Active Tank Alerts:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono font-bold text-xs">
            {alerts.length}
          </span>
        </div>
      </div>

      {/* Threshold Reference Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Official Challenge Alert Threshold Rules
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Duplicate Alert Prevention Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Sufficient */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
            <div className="flex justify-between font-bold text-emerald-900">
              <span>Sufficient (≥ 70%)</span>
              <span className="text-[10px] font-mono uppercase bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800">Info</span>
            </div>
            <p className="text-emerald-800 font-medium">“Water availability is sufficient.”</p>
            <p className="text-emerald-700 font-telugu text-[11px]">“నీటి లభ్యత సరిపడా ఉంది.”</p>
          </div>

          {/* Moderate */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
            <div className="flex justify-between font-bold text-amber-900">
              <span>Moderate (≥ 30% & &lt; 70%)</span>
              <span className="text-[10px] font-mono uppercase bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">Warning</span>
            </div>
            <p className="text-amber-800 font-medium">“Water level is moderate. Please use water responsibly.”</p>
            <p className="text-amber-700 font-telugu text-[11px]">“నీటి మట్టం మధ్యస్థంగా ఉంది. జాగ్రత్తగా వాడండి.”</p>
          </div>

          {/* Critical */}
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
            <div className="flex justify-between font-bold text-rose-900">
              <span>Critical (&lt; 30%)</span>
              <span className="text-[10px] font-mono uppercase bg-rose-100 px-1.5 py-0.5 rounded text-rose-800">Critical</span>
            </div>
            <p className="text-rose-800 font-medium">“Critical water level (&lt; 30%). Please conserve water and check the next supply update.”</p>
            <p className="text-rose-700 font-telugu text-[11px]">“నీటి మట్టం చాలా తక్కువగా ఉంది (&lt; 30%). నీటిని పొదుపుగా వాడండి.”</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['all', 'critical', 'warning', 'info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterSeverity === sev
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {sev === 'all' ? 'All Severities' : sev}
            </button>
          ))}

          <label className="flex items-center gap-1.5 ml-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterUnread}
              onChange={(e) => setFilterUnread(e.target.checked)}
              className="accent-sky-600 rounded"
            />
            <span>Unread Only</span>
          </label>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

      </div>

      {/* Alerts Stream */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading alerts...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
            <BellRing className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">{t.noAlertsFound}</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all ${
                alert.is_read
                  ? 'bg-white border-slate-200/80 shadow-xs'
                  : 'bg-gradient-to-r from-sky-50/60 to-white border-sky-300 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={alert.severity} type="severity" size="sm" />
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-slate-100 text-slate-700">
                      {alert.alert_type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(alert.created_at).toLocaleString()}
                    </span>
                    {!alert.is_read && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-600 text-white">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {alert.message_en}
                  </p>
                  <p className="text-xs text-slate-600 font-telugu leading-relaxed">
                    {alert.message_te}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={() => openPhonePreview(alert)}
                    className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Phone Preview</span>
                  </button>

                  {!alert.is_read && (
                    <button
                      onClick={() => handleMarkRead(alert.id)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.markAsRead}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
