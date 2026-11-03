import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Smartphone,
  MessageSquare,
  PhoneCall,
  Bell,
  Volume2,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const NotificationPreviewModal: React.FC = () => {
  const { isPhoneSimOpen, setIsPhoneSimOpen, phonePreviewAlert, language } = useApp();
  const [activeChannel, setActiveChannel] = useState<'in_app' | 'sms' | 'ivrs'>('sms');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  if (!isPhoneSimOpen) return null;

  const alert = phonePreviewAlert || {
    id: 999,
    tank_id: 1,
    severity: 'Warning' as const,
    alert_type: 'THRESHOLD' as const,
    message_en: 'Water level is low. Please conserve water.',
    message_te: 'నీటి మట్టం తక్కువగా ఉంది. దయచేసి నీటిని పొదుపుగా వాడండి.',
    is_read: false,
    created_at: new Date().toISOString(),
  };

  const handleSimulateCall = () => {
    setIsPlayingAudio(true);
    // Simple Web Speech Synthesis if available in browser
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(alert.message_en);
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold">Multi-Channel Citizen Alert Preview</h3>
              <p className="text-[11px] text-slate-400">Rural Communication Simulation</p>
            </div>
          </div>
          <button
            onClick={() => setIsPhoneSimOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector Pills */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex gap-2">
          <button
            onClick={() => setActiveChannel('sms')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeChannel === 'sms'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>SMS Preview</span>
          </button>

          <button
            onClick={() => setActiveChannel('ivrs')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeChannel === 'ivrs'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>IVRS Voice Call</span>
          </button>

          <button
            onClick={() => setActiveChannel('in_app')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              activeChannel === 'in_app'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>In-App Web</span>
          </button>
        </div>

        {/* Channel Status Banner */}
        <div className="px-6 py-2 text-xs flex items-center justify-between border-b">
          {activeChannel === 'in_app' ? (
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-medium">Active Channel · Live in Web Dashboard</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md w-full">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold">Planned — Not Connected (Demo Simulation)</span>
            </div>
          )}
        </div>

        {/* Realistic Mobile Viewport Container */}
        <div className="p-6 bg-slate-50 flex justify-center">
          
          {/* Phone Frame */}
          <div className="w-[300px] h-[440px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col">
            
            {/* Phone Speaker Notch */}
            <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950"></div>
            </div>

            {/* Phone Screen Display */}
            <div className="flex-1 bg-white rounded-[26px] overflow-hidden flex flex-col">
              
              {/* Phone Status Bar */}
              <div className="px-4 py-1.5 bg-slate-100 text-slate-600 flex justify-between text-[10px] font-mono border-b">
                <span>09:41 AM</span>
                <span>BSNL 4G · 82%</span>
              </div>

              {/* View 1: SMS Interface */}
              {activeChannel === 'sms' && (
                <div className="flex-1 p-3 bg-slate-100 flex flex-col justify-between">
                  <div className="text-center py-1">
                    <span className="text-[10px] text-slate-500 font-semibold">
                      BZ-JALMTR (Govt DLT Gateway)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* Telugu SMS Bubble */}
                    <div className="bg-sky-600 text-white p-2.5 rounded-2xl rounded-tl-xs shadow-xs text-xs font-telugu leading-relaxed">
                      <div className="text-[10px] text-sky-200 font-mono mb-0.5">
                        [జల్ మిత్ర సమాచారం]
                      </div>
                      {alert.message_te}
                      <div className="text-[9px] text-sky-200 text-right mt-1">Now · SMS</div>
                    </div>

                    {/* English SMS Bubble */}
                    <div className="bg-white text-slate-800 p-2.5 rounded-2xl rounded-tl-xs shadow-xs text-xs border border-slate-200 leading-relaxed">
                      <div className="text-[10px] text-slate-400 font-mono mb-0.5">
                        [JalMitra Alert]
                      </div>
                      {alert.message_en}
                      <div className="text-[9px] text-slate-400 text-right mt-1">Now · SMS</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-full px-3 py-1.5 text-[10px] text-slate-400 border border-slate-200">
                    Reply STOP to unsubscribe
                  </div>
                </div>
              )}

              {/* View 2: IVRS Voice Call Interface */}
              {activeChannel === 'ivrs' && (
                <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-950 text-white p-4 flex flex-col items-center justify-between text-center">
                  <div className="mt-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-pulse">
                      <PhoneCall className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="text-sm font-bold mt-3">Grama Panchayat Jal Mitra</h4>
                    <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      {isPlayingAudio ? 'Speaking in Telugu...' : 'Automated Voice Broadcast'}
                    </p>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-white/10 text-xs font-telugu text-slate-200 leading-relaxed">
                    "{alert.message_te}"
                  </div>

                  <button
                    onClick={handleSimulateCall}
                    disabled={isPlayingAudio}
                    className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isPlayingAudio ? 'Voice Playing...' : 'Simulate Voice Call'}</span>
                  </button>
                </div>
              )}

              {/* View 3: In-App Web View */}
              {activeChannel === 'in_app' && (
                <div className="flex-1 p-3 bg-slate-50 flex flex-col justify-start">
                  <div className="text-xs font-bold text-slate-800 mb-2">Notification Center</div>
                  <div className="bg-white p-3 rounded-xl border border-sky-200 shadow-xs">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 mb-1">
                      <Bell className="w-3.5 h-3.5 text-sky-600" />
                      <span>Live Notification</span>
                    </div>
                    <div className="text-xs text-slate-800 font-medium">{alert.message_en}</div>
                    <div className="text-xs text-slate-600 font-telugu mt-1 pt-1 border-t border-slate-100">
                      {alert.message_te}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Phone Home Bar */}
            <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto mt-2"></div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
          Planned architecture integrates CDAC Mobile Seva / Telecom DLT Gateways without requiring paid API keys during prototype evaluation.
        </div>

      </div>
    </div>
  );
};
