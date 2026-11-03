import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchHardwareSpec } from '../api';
import {
  Cpu,
  Radio,
  Wifi,
  Database,
  ArrowRight,
  Send,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCode2,
} from 'lucide-react';

export const HardwareSpecPage: React.FC = () => {
  const { selectedTankId, refreshData, showToast } = useApp();
  const [spec, setSpec] = useState<any>(null);
  const [testDistanceCm, setTestDistanceCm] = useState<number>(75.0);
  const [testDeviceId, setTestDeviceId] = useState<string>('ESP32-WARD4-01');
  const [telemetryResponse, setTelemetryResponse] = useState<any>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    fetchHardwareSpec().then(setSpec).catch(console.error);
  }, []);

  const handleSendTestTelemetry = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/sensors/esp32/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: testDeviceId,
          tank_id: selectedTankId,
          distance_cm: testDistanceCm,
        }),
      });
      const data = await res.json();
      setTelemetryResponse(data);
      await refreshData();
      showToast(
        `Hardware telemetry ingested! Calculated level: ${data.calculated_level_pct}% (${data.tank_status})`,
        'success'
      );
    } catch (err: any) {
      showToast('Failed to send hardware test telemetry', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hardware-Ready Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Phase 2 physical sensor specification & ESP32 telemetry ingestion contract
          </p>
        </div>

        <div className="px-3 py-1.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>FastAPI Telemetry Contract Ready</span>
        </div>
      </div>

      {/* Architecture Visual Diagram */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            End-to-End IoT Hardware Pipeline
          </h3>
          <p className="text-xs text-slate-500">
            Seamless transition from Phase 1 Software Mock to Phase 2 Field Ultrasonic Transducer
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Node 1: Sensor */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">1. JSN-SR04T Sensor</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mounted at overhead tank lid. Sends 40kHz ultrasonic pulse to detect distance to water surface (20cm to 600cm range, IP67 waterproof).
            </p>
          </div>

          {/* Node 2: Microcontroller */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">2. ESP32 Controller</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Reads pulse echo time ($t$). Computes $d = (t \times 0.0343) / 2$. Packages JSON telemetry and sends via Wi-Fi or 4G GSM.
            </p>
          </div>

          {/* Node 3: Backend Ingestion */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">3. FastAPI Ingestion</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Validates device signature, computes tank geometry depth-to-liters, checks threshold boundaries, and persists records.
            </p>
          </div>

          {/* Node 4: Community Delivery */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">4. Citizen Dispatch</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Updates web dashboard and triggers bilingual SMS / automated Telugu IVRS voice broadcast when tank drops below 30%.
            </p>
          </div>

        </div>

        {/* Math Formula Card */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-1.5">
          <div className="text-[11px] text-sky-400 font-bold uppercase tracking-wider">
            Geometric Water Meniscus Calculation:
          </div>
          <div className="text-slate-200">
            Water Depth (cm) = Total Tank Height (300cm) - Sensor Reading (d_s)
          </div>
          <div className="text-slate-200">
            Water Level (%) = [ (300 - d_s) / (300 - DeadZone_20cm) ] * 100
          </div>
        </div>

        {/* Hardware Bill of Materials Table */}
        {spec?.hardware_components && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Phase 2 Field Component Bill of Materials (BOM)
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3">Component</th>
                    <th className="p-3">Hardware Model</th>
                    <th className="p-3 text-right">Est. Cost (INR ₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {spec.hardware_components.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-800">{item.component}</td>
                      <td className="p-3 font-mono text-[11px]">{item.model}</td>
                      <td className="p-3 font-mono font-bold text-right text-slate-900">₹{item.estimated_inr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Live ESP32 Telemetry Test Console */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-200 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900">
              Interactive ESP32 Ingestion Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Test the live backend hardware endpoint <code className="text-sky-700 font-mono">POST /api/sensors/esp32/telemetry</code>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Input Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Simulated ESP32 Device MAC / ID:
              </label>
              <input
                type="text"
                value={testDeviceId}
                onChange={(e) => setTestDeviceId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Raw Distance Reading from Transducer (cm):
                </label>
                <span className="font-mono font-bold text-sky-700 text-xs">
                  {testDistanceCm} cm
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="300"
                step="5"
                value={testDistanceCm}
                onChange={(e) => setTestDistanceCm(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span>20 cm (Full Tank)</span>
                <span>160 cm (Half Tank)</span>
                <span>300 cm (Empty Tank)</span>
              </div>
            </div>

            <button
              onClick={handleSendTestTelemetry}
              disabled={isSending}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Transmitting...' : 'Send ESP32 Telemetry Packet'}</span>
            </button>
          </div>

          {/* Response Console */}
          <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs flex flex-col justify-between border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
              <span>ENDPOINT: /api/sensors/esp32/telemetry</span>
              <span className="text-emerald-400">HTTP 200</span>
            </div>

            <pre className="text-emerald-300 py-3 overflow-x-auto text-[11px] leading-relaxed">
              {telemetryResponse
                ? JSON.stringify(telemetryResponse, null, 2)
                : '// Click "Send ESP32 Telemetry Packet" to test contract response'}
            </pre>

            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
              Validates that the backend is fully hardware-ready without needing physical boards in this challenge stage.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
