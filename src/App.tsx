import React from 'react';
import { MonitorDisplay } from './components/MonitorDisplay';
import { AlarmBanner } from './components/AlarmBanner';
import { InterventionPanel } from './components/InterventionPanel';

export default function App() {
  return (
    <div className="flex flex-col h-screen max-h-screen bg-black text-zinc-100 overflow-hidden font-sans selection:bg-emerald-500/30">
      <AlarmBanner />
      <MonitorDisplay />
      <InterventionPanel />
    </div>
  );
}
