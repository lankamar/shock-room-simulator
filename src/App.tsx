import React from 'react';
import { MonitorDisplay } from './components/MonitorDisplay';
import { AlarmBanner } from './components/AlarmBanner';
import { InterventionPanel } from './components/InterventionPanel';
import { RightSidebar } from './components/RightSidebar';
import { TopNavigationBar } from './components/TopNavigationBar';
import { useSimulatorStore } from './store/useSimulatorStore';
import { useIECAlarm } from './hooks/useIECAlarm';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  const { currentVitals, isRunning, isAudioEnabled } = useSimulatorStore();
  const alarms = currentVitals?.activeAlarms || [];

  const alarmState = useIECAlarm(alarms, isRunning, isAudioEnabled);
  useKeyboardShortcuts();

  return (
    <div className="flex flex-col min-h-screen lg:h-screen lg:max-h-screen bg-black text-zinc-100 overflow-y-auto lg:overflow-hidden font-sans selection:bg-emerald-500/30">
      <TopNavigationBar />
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 min-w-0">
        <div className="flex flex-col flex-1 min-w-0">
          <AlarmBanner alarmState={alarmState} />
          <MonitorDisplay alarmState={alarmState} />
          <InterventionPanel />
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}
