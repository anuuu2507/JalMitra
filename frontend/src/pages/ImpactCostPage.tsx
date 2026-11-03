import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Coins,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
  HeartHandshake,
  Building2,
  Sliders,
  RotateCcw,
  Info,
  Sparkles,
} from 'lucide-react';

export const ImpactCostPage: React.FC = () => {
  const { language, t } = useApp();

  // Transparent Editable Cost Assumptions (INR ₹)
  const defaultCosts = {
    esp32: 450,
    ultrasonicSensor: 650,
    solarPowerModule: 850,
    ip67Enclosure: 350,
    wiringMounting: 250,
    monthlySimData: 75,
    annualMaintenance: 600,
    monthlyCloudHosting: 40,
  };

  const [costs, setCosts] = useState(defaultCosts);

  // Derived Calculations
  const hardwareSetupCost =
    costs.esp32 +
    costs.ultrasonicSensor +
    costs.solarPowerModule +
    costs.ip67Enclosure +
    costs.wiringMounting;

  const monthlyRunningCost =
    costs.monthlySimData +
    costs.monthlyCloudHosting +
    costs.annualMaintenance / 12;

  const threeYearTCO = hardwareSetupCost + monthlyRunningCost * 36;
  const costPerHouseholdPerYear = Math.round(
    (hardwareSetupCost / 3 + monthlyRunningCost * 12) / 340
  );

  const handleResetCosts = () => {
    setCosts(defaultCosts);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t.impactCost}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Beneficiary analysis, potential community impact, and transparent deployment economics
          </p>
        </div>

        <div className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold">
          Illustrative Demo Metrics · Transparent Assumptions
        </div>
      </div>

      {/* Beneficiaries Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Resident Beneficiaries */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Rural & Semi-Urban Residents
          </h3>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Daily Planning:</strong> Families know exact tank reserves in advance, preventing wasted visits to dry taps.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Conserving in Shortages:</strong> Low-water notifications prompt households to store water prudently.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Telugu Language Access:</strong> Localized voice & text ensures elders and low-literacy citizens stay informed.</span>
            </li>
          </ul>
        </div>

        {/* Local Operators */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Jal Sahayaks & Pump Operators
          </h3>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Proactive Delay Broadcasts:</strong> Publish maintenance notices in one click rather than handling dozens of complaints.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Reduced Conflict:</strong> Transparent schedules eliminate rumors and disputes at community standposts.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Pump Overfill Prevention:</strong> Level visibility reduces electric pumping waste and reservoir overflow.</span>
            </li>
          </ul>
        </div>

        {/* Governance & Gram Panchayat */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Grama Panchayat & Jal Jeevan Mission
          </h3>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Verifiable Audit Trail:</strong> Historical records provide objective logs of supply duration and reliability.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Aligned with Swachh Bharat:</strong> Enhances equitable water distribution across all wards.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Frugal Public Spending:</strong> Ultra-low CapEx makes it viable for every village panchayat budget.</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Potential Impact vs Field Claims Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Potential Impact Projections (Illustrative Demo Model)
            </h3>
            <p className="text-xs text-slate-500">
              Model assumptions for a representative 340-household rural ward
            </p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-sky-100 text-sky-800">
            Phase 1 Prototype Assessment
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider mb-1">
              Estimated Time Saved
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono">
              ~25-40 min
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Per household / day avoided idle tap queuing
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider mb-1">
              Estimated Overflow Prevention
            </span>
            <span className="text-2xl font-black text-emerald-700 font-mono">
              ~1,450 L
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Per week per tank through early fill alerts
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider mb-1">
              Citizen Notification Reach
            </span>
            <span className="text-2xl font-black text-sky-700 font-mono">
              100%
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">
              Via Telugu In-App + planned SMS / IVRS
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 italic text-center pt-2">
          *All values represent modeled design projections. JalMitra has not yet conducted live field trials or clinical measurements.
        </p>
      </div>

      {/* Interactive Editable Cost Calculator */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-sky-600" />
              <h3 className="text-lg font-bold text-slate-900">
                {t.costEstimator}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Interactive pricing model based on Indian component supply chains. Adjust assumptions below:
            </p>
          </div>

          <button
            onClick={handleResetCosts}
            className="self-start sm:self-center px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Inputs vs Output Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Editable Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Adjust Hardware & Service Estimates (₹ INR)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  ESP32 Microcontroller:
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={costs.esp32}
                    onChange={(e) => setCosts({ ...costs, esp32: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  JSN-SR04T Waterproof Ultrasonic:
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={costs.ultrasonicSensor}
                    onChange={(e) => setCosts({ ...costs, ultrasonicSensor: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  10W Solar + 18650 Battery BMS:
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={costs.solarPowerModule}
                    onChange={(e) => setCosts({ ...costs, solarPowerModule: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  IP67 Waterproof Enclosure & Glands:
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={costs.ip67Enclosure}
                    onChange={(e) => setCosts({ ...costs, ip67Enclosure: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Monthly 4G SIM / IoT Telemetry:
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={costs.monthlySimData}
                    onChange={(e) => setCosts({ ...costs, monthlySimData: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Annual Spares & Cleaning (₹/yr):
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    value={costs.annualMaintenance}
                    onChange={(e) => setCosts({ ...costs, annualMaintenance: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Computed Summary Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-sky-950 text-white p-6 rounded-2xl flex flex-col justify-between shadow-lg">
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-sky-400 mb-2">
                Estimated Deployment Economics
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-300">Initial Hardware Setup Cost / Tank:</span>
                  <div className="text-3xl font-extrabold font-mono text-white">
                    ₹{hardwareSetupCost.toLocaleString()}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <span className="text-xs text-slate-300">Monthly Operating Cost (Data & Maint):</span>
                  <div className="text-xl font-bold font-mono text-sky-300">
                    ₹{Math.round(monthlyRunningCost).toLocaleString()} / month
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <span className="text-xs text-slate-300">3-Year Total Cost of Ownership (TCO):</span>
                  <div className="text-xl font-bold font-mono text-cyan-300">
                    ₹{Math.round(threeYearTCO).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">Includes hardware + 36 months data & maintenance</span>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <span className="text-xs text-slate-300">Annual Cost per Beneficiary Household:</span>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    ~₹{costPerHouseholdPerYear} / year
                  </div>
                  <span className="text-[10px] text-slate-400">Based on 340 homes per village ward</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-400 leading-relaxed">
              <strong>Govt Budget Fit:</strong> At under ₹{costPerHouseholdPerYear} per home annually, this system easily fits within 15th Finance Commission untied village sanitation grants.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
