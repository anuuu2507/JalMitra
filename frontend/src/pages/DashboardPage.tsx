import React from 'react';
import { useApp } from '../context/AppContext';
import { WaterTankVisual } from '../components/WaterTankVisual';
import { StatusBadge } from '../components/StatusBadge';
import {
  Droplets,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
  MapPin,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { PageId } from '../components/Sidebar';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { dashboardData, language, t, openPhonePreview } = useApp();

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-600">Loading Community Water Dashboard...</p>
        </div>
      </div>
    );
  }

  const {
    community,
    tank,
    current_level_pct,
    current_liters,
    capacity_liters,
    status,
    sensor_status,
    supply_status,
    next_supply_time,
    latest_operator_message,
    recent_alerts,
    level_trend_24h,
    daily_availability_summary,
  } = dashboardData;

  // Format trend data for Recharts
  const chartData = level_trend_24h.map((rec, index) => {
    const timeStr = new Date(rec.recorded_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      time: timeStr || `T-${index}`,
      level: rec.level_pct,
      liters: rec.liters,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Community Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-100/50 to-transparent rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {language === 'te' ? community.district_te : community.district}, {community.state}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Users className="w-3.5 h-3.5" />
                {community.total_households} {language === 'te' ? 'గృహాలు' : 'Households'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {language === 'te' ? community.name_te : community.name}
            </h1>

            <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
              <span className="text-slate-900 font-semibold">
                {language === 'te' ? tank.name_te : tank.name}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">
                {language === 'te' ? tank.location_te : tank.location}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={status} type="water" size="md" />
            <StatusBadge status={supply_status} type="supply" size="md" />
            <button
              onClick={() => onNavigate('tanks')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>{t.demoControls}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Water Level */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.currentLevel}</span>
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {current_level_pct.toFixed(1)}%
            </span>
            <StatusBadge status={status} type="water" size="sm" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Threshold: ≥ 70% Sufficient · ≥ 30% Moderate · &lt; 30% Critical
          </p>
        </div>

        {/* Card 2: Available Liters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.availableWater}</span>
            <Activity className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {Math.round(current_liters).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ {Math.round(capacity_liters).toLocaleString()} L</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Tank Capacity: {Math.round(capacity_liters).toLocaleString()} Liters
          </p>
        </div>

        {/* Card 3: Supply Schedule */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.nextSupplyTime}</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 leading-tight">
            {next_supply_time}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <StatusBadge status={supply_status} type="supply" size="sm" />
          </div>
        </div>

        {/* Card 4: Sensor & Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-sky-200 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">{t.sensorStatus}</span>
            <Radio className="w-4 h-4 text-sky-500 animate-pulse" />
          </div>
          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{sensor_status}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Telemetry sync: 1 min ago (Simulated)
          </p>
        </div>

      </div>

      {/* Main Centerpiece: Tank Visualization + Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Custom Animated Water Tank (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between items-center">
          <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'te' ? 'లైవ్ ట్యాంక్ సిమ్యులేషన్' : 'Live Community Tank Visual'}
              </h2>
              <p className="text-xs text-slate-500">
                Dynamic hydrodynamic fill animation
              </p>
            </div>
            <StatusBadge status={status} type="water" size="sm" />
          </div>

          <div className="py-2 w-full flex justify-center">
            <WaterTankVisual
              levelPct={current_level_pct}
              capacityLiters={capacity_liters}
              currentLiters={current_liters}
              status={status}
              tankName={tank.name}
              size="normal"
            />
          </div>

          <div className="w-full mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Height: 3.0m</span>
            <span>Calculated Meniscus: {(3.0 * (1 - current_level_pct / 100)).toFixed(2)}m from top</span>
          </div>
        </div>

        {/* Right: Trend Chart & Operator Announcement (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Operator Notice Banner */}
          {latest_operator_message && (
            <div className="bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 p-5 rounded-3xl border border-sky-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                  <span className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                    {t.latestOperatorNotice}
                  </span>
                </div>
                <StatusBadge status={latest_operator_message.status} type="supply" size="sm" />
              </div>
              
              <p className="text-sm font-semibold text-slate-800">
                {latest_operator_message.message_en}
              </p>
              {latest_operator_message.message_te && (
                <p className="text-xs text-slate-600 font-telugu mt-1.5 pt-1.5 border-t border-sky-200/60">
                  {latest_operator_message.message_te}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>By: {latest_operator_message.operator_name}</span>
                <span>Expected: {latest_operator_message.expected_supply_time}</span>
              </div>
            </div>
          )}

          {/* 24-Hour Trend Chart Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {t.waterLevelOverTime}
                </h2>
                <p className="text-xs text-slate-500">
                  Historical telemetry and threshold boundaries
                </p>
              </div>
              <button
                onClick={() => onNavigate('analytics')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <span>Full Analytics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
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
                    formatter={(value: any) => [`${value}%`, 'Water Level']}
                  />
                  <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Sufficient (70%)', fill: '#10b981', fontSize: 10 }} />
                  <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Moderate (30%)', fill: '#f59e0b', fontSize: 10 }} />
                  <ReferenceLine y={10} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical (10%)', fill: '#ef4444', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="level"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#waterGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Availability Summary Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Daily Avg</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {daily_availability_summary.average_level_pct}%
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Min Level</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {daily_availability_summary.min_level_pct}%
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block">Peak Level</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {daily_availability_summary.max_level_pct}%
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Recent Alerts Feed Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t.recentAlerts}</h2>
            <p className="text-xs text-slate-500">
              Threshold triggers & operator broadcast updates
            </p>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            <span>{t.allAlerts}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {recent_alerts.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4 text-center">No alerts recorded yet.</p>
          ) : (
            recent_alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-sky-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={alert.severity} type="severity" size="sm" />
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!alert.is_read && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{alert.message_en}</p>
                  <p className="text-xs text-slate-600 font-telugu">{alert.message_te}</p>
                </div>

                <button
                  onClick={() => openPhonePreview(alert)}
                  className="self-start sm:self-center px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200 transition-colors whitespace-nowrap"
                >
                  Preview on Phone
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0" />
        <span className="leading-relaxed">
          <strong>Hackathon Disclosure:</strong> {dashboardData.disclaimer}
        </span>
      </div>

    </div>
  );
};
