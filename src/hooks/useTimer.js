import { useState, useEffect } from 'react';

// Hook para manter o tempo atualizado a cada segundo na interface
export function useTimer(session) {
  const [elapsed, setElapsed] = useState(session.elapsed_seconds || 0);
  const [remaining, setRemaining] = useState(session.remaining_seconds || 0);

  useEffect(() => {
    // Atualiza base inicial
    setElapsed(session.elapsed_seconds);
    setRemaining(session.remaining_seconds);

    // Se estiver rodando, incrementa a cada segundo
    if (session.status === 'running') {
      const interval = setInterval(() => {
        setElapsed(prev => prev + 1);
        setRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session.status, session.elapsed_seconds, session.remaining_seconds]);

  return { elapsed, remaining };
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
