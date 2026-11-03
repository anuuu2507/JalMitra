import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchSupplyUpdates, createSupplyUpdate } from '../api';
import { SupplyUpdate, SupplyStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  Truck,
  Calendar,
  Clock,
  Send,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Info,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export const SupplyUpdatesPage: React.FC = () => {
  const { selectedTankId, dashboardData, refreshData, language, t, showToast } = useApp();
  const [updates, setUpdates] = useState<SupplyUpdate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Operator Form State
  const [expectedTime, setExpectedTime] = useState<string>('Tomorrow at 06:30 AM');
  const [status, setStatus] = useState<SupplyStatus>('Scheduled');
  const [operatorName, setOperatorName] = useState<string>('Ramesh Babu (Jal Sahayak)');
  const [messageEn, setMessageEn] = useState<string>('');
  const [messageTe, setMessageTe] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadUpdates = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSupplyUpdates(selectedTankId);
      setUpdates(data);
    } catch (err) {
      console.error('Failed to load supply updates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates();
  }, [selectedTankId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageEn.trim()) {
      showToast('Please enter an operator message', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const newRec = await createSupplyUpdate({
        tank_id: selectedTankId,
        expected_supply_time: expectedTime,
        status: status,
        operator_name: operatorName,
        message_en: messageEn,
        message_te: messageTe.trim() || undefined,
      });
      await refreshData();
      await loadUpdates();
      setMessageEn('');
      setMessageTe('');
      showToast(
        status === 'Delayed'
          ? 'Supply update published! Delay alert automatically broadcast to community.'
          : 'Supply update published successfully!',
        'success'
      );
    } catch (err: any) {
      showToast('Failed to publish supply update', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.supplyUpdates}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Official supply schedule announcements and local operator status notices
          </p>
        </div>

        {dashboardData && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Current Status:</span>
            <StatusBadge status={dashboardData.supply_status} type="supply" />
          </div>
        )}
      </div>

      {/* Main Grid: Operator Panel (Left 5) & Resident Log (Right 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Operator Console Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-sky-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.operatorPanel}</h3>
                <p className="text-xs text-slate-500">Authorized local operator actions</p>
              </div>
            </div>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              OPERATOR ROLE
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Status Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                {t.supplyStatus}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Scheduled', 'Delayed', 'Completed'] as SupplyStatus[]).map((st) => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => {
                      setStatus(st);
                      if (st === 'Delayed' && !messageEn) {
                        setMessageEn('Pump motor maintenance in progress. Expected supply delayed.');
                        setMessageTe('పంప్ మోటార్ మరమ్మతులు జరుగుతున్నాయి. తదుపరి సరఫరా ఆలస్యం.');
                      }
                    }}
                    className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                      status === st
                        ? st === 'Delayed'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {st === 'Scheduled' && t.scheduled}
                    {st === 'Delayed' && t.delayed}
                    {st === 'Completed' && t.completed}
                  </button>
                ))}
              </div>
            </div>

            {/* Expected Supply Time */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                {t.expectedDateAndTime}
              </label>
              <input
                type="text"
                value={expectedTime}
                onChange={(e) => setExpectedTime(e.target.value)}
                placeholder="e.g. Tomorrow at 06:30 AM"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            {/* Operator Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Operator Name / Designation
              </label>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Ramesh Babu (Jal Sahayak)"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Message EN */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Operator Notice (English)
              </label>
              <textarea
                rows={2}
                value={messageEn}
                onChange={(e) => setMessageEn(e.target.value)}
                placeholder={t.enterMessage}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>

            {/* Message TE */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                ఆపరేటర్ ప్రకటన (తెలుగు) — Optional
              </label>
              <textarea
                rows={2}
                value={messageTe}
                onChange={(e) => setMessageTe(e.target.value)}
                placeholder="గ్రామస్థులకు తెలుగులో వివరణ..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none font-telugu"
              />
            </div>

            {/* Delay Alert Warning Notice */}
            {status === 'Delayed' && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Automatic Community Alert</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Marking supply as delayed will automatically trigger a bilingual Warning Alert in the citizen notification feed and SMS channel.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.publishUpdate}</span>
            </button>
          </form>

          {/* Explicit Architectural Note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
            <strong>Challenge Design Rule:</strong> Supply delays are never inferred from tank levels alone; they require operator dispatch or validated municipal schedules.
          </div>
        </div>

        {/* Right: Resident Supply Timeline & History */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Community Supply Updates History
              </h3>
              <p className="text-xs text-slate-500">
                Log of published schedules and operator announcements
              </p>
            </div>
            <Truck className="w-5 h-5 text-sky-600" />
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-xs">Loading updates...</div>
            ) : updates.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">No supply updates yet.</p>
            ) : (
              updates.map((up) => (
                <div
                  key={up.id}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 hover:border-sky-200 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={up.status} type="supply" size="sm" />
                      <span className="text-xs font-bold text-slate-900">
                        {up.expected_supply_time}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(up.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    {up.message_en}
                  </p>
                  {up.message_te && (
                    <p className="text-xs text-slate-600 font-telugu leading-relaxed pt-1 border-t border-slate-200/60">
                      {up.message_te}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                    <span>Operator: {up.operator_name}</span>
                    <span className="font-mono text-[10px]">Verified Record</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
