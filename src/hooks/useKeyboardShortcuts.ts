import { useEffect } from 'react';
import { useSimulatorStore } from '../store/useSimulatorStore';

export function useKeyboardShortcuts() {
  const { phase, start, pause, reset } = useSimulatorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'p':
          e.preventDefault();
          if (phase === 'RUNNING') pause();
          else start();
          break;
        case 'r':
          e.preventDefault();
          reset();
          break;
        case 'l':
          e.preventDefault();
          // Focus the log input
          const logInput = document.querySelector('input[placeholder="Añadir nota clínica (ej. pupilas isocóricas...)"]') as HTMLInputElement;
          if (logInput) {
             const RightSidebarTabs = logInput.closest('.w-full')?.parentElement;
             // Might need to switch tab if not visible, but for now just focus if available
             logInput.focus();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, start, pause, reset]);
}
