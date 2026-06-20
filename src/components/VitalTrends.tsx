import React from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function VitalTrends() {
  const { vitalRecords } = useSimulatorStore();

  const data = vitalRecords.map(record => ({
    time: Math.floor(record.time / 1000), // convert to seconds for easier display
    hr: record.vitals.ecg?.hr || 0,
    spo2: record.vitals.spo2?.value || 0,
    sys: record.vitals.nibp?.systolic || 0,
    dia: record.vitals.nibp?.diastolic || 0,
    map: record.vitals.nibp?.mean || 0,
  }));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-[#090910] to-[#040409] font-sans p-4 overflow-y-auto scrollbar-thin">
      
      {data.length < 2 ? (
        <div className="h-full flex items-center justify-center text-center text-zinc-600 text-xs italic">
          Recopilando datos de tendencias vitales...
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* HR & SpO2 Chart */}
          <div className="h-[200px] w-full">
            <h3 className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">FC & SpO2</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" tickFormatter={formatTime} stroke="#52525b" fontSize={10} tickMargin={8} />
                <YAxis stroke="#52525b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: '11px' }}
                  labelFormatter={(v) => `Tiempo: ${formatTime(v as number)}`}
                />
                <Line type="monotone" dataKey="hr" name="FC" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="spo2" name="SpO2" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Blood Pressure Chart */}
          <div className="h-[200px] w-full">
            <h3 className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest">Presión Arterial</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" tickFormatter={formatTime} stroke="#52525b" fontSize={10} tickMargin={8} />
                <YAxis stroke="#52525b" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: '11px' }}
                  labelFormatter={(v) => `Tiempo: ${formatTime(v as number)}`}
                />
                <Line type="monotone" dataKey="sys" name="SIS" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="dia" name="DIA" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="map" name="PAM" stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}
    </div>
  );
}
