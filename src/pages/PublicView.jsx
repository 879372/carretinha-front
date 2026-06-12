import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useTimer, formatTime } from '../hooks/useTimer';

export default function PublicView() {
  const { companyId, token } = useParams();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!companyId || !token) return;

    const fetchSession = async () => {
      try {
        const res = await api.get(`/companies/${companyId}/sessions/public/${token}/`);
        setSession(res.data);
      } catch (e) {
        setError(true);
      }
    };
    fetchSession();

    // WebSocket para atualizações em tempo real sem sobrecarregar o servidor
    const wsUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('http', 'ws').replace('/api', '') 
      : 'ws://localhost:8001';
      
    const ws = new WebSocket(`${wsUrl}/ws/session/${token}/`);
    
    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      if (parsed.type === 'tick' || parsed.type === 'update') {
        setSession(parsed.data);
      }
    };

    return () => {
      ws.close();
    };
  }, [companyId, token]);

  if (error) {
    return <div className="p-4 text-center text-danger">Link inválido ou expirado.</div>;
  }

  if (!session) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      {session.company_logo ? (
        <img 
          src={session.company_logo} 
          alt={session.company_name} 
          style={{ height: '80px', maxWidth: '200px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          className="rounded-lg p-2 mb-4" 
        />
      ) : (
        <h1 className="text-3xl text-accent mb-2">{session.company_name || 'Playground'}</h1>
      )}
      <p className="text-secondary mb-8">Acompanhe o tempo de brincadeira!</p>

      <div className="glass-panel w-full max-w-sm">
        <h2 className="text-2xl mb-1">{session.child?.name}</h2>
        <p className="text-sm text-secondary mb-6">{session.plan_label}</p>

        <TimerDisplay session={session} />

        <div className="mt-6 text-sm">
          Status atual: <strong className="text-accent">{session.status_label}</strong>
        </div>
      </div>
    </div>
  );
}

function TimerDisplay({ session }) {
  const { remaining } = useTimer(session);
  const isExpired = remaining === 0;

  return (
    <div className={`timer-display text-5xl py-4 ${isExpired ? 'text-danger animate-pulse' : 'text-primary'}`}>
      {formatTime(remaining)}
      {isExpired && session.status !== 'finished' && (
        <div className="text-sm mt-2">O tempo acabou! Venha buscar.</div>
      )}
    </div>
  );
}
