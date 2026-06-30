import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

export default function Analytics() {
  const { companyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  
  // Filtro de data local
  const today = new Date();
  const localDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [dateFilter, setDateFilter] = useState(localDateStr);

  useEffect(() => {
    if (!companyId) return;
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Busca sessões da empresa numa data específica
        const res = await api.get(`/companies/${companyId}/sessions/?date=${dateFilter}`);
        setSessions(res.data.results || res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, [companyId, dateFilter]);

  // Cálculos do Dashboard
  const totalSessions = sessions.length;

  const totalsByMethod = sessions.reduce((acc, session) => {
    if (session.payments && Array.isArray(session.payments)) {
      session.payments.forEach(payment => {
        const methodName = payment.payment_method_name || 'Desconhecido';
        const amount = parseFloat(payment.amount) || 0;
        acc[methodName] = (acc[methodName] || 0) + amount;
      });
    }
    return acc;
  }, {});

  const totalAmount = Object.values(totalsByMethod).reduce((sum, val) => sum + val, 0);

  const totalRevenue = totalAmount > 0 ? totalAmount : sessions.reduce((acc, s) => {
    const paid = s.amount_paid != null ? Number(s.amount_paid) : Number(s.plan_price || 0);
    return acc + paid;
  }, 0);

  const finishedSessions = sessions.filter(s => s.status === 'finished').length;
  
  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl text-accent">Dashboard</h1>
        <input 
          type="date" 
          className="form-input w-40 text-sm p-1" 
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-secondary text-center mt-10">Calculando dados...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass-panel flex flex-col items-center justify-center p-4">
              <Users className="text-primary mb-2" size={32} />
              <span className="text-3xl font-bold">{totalSessions}</span>
              <span className="text-xs text-secondary mt-1">Crianças Hoje</span>
            </div>
            
            <div className="glass-panel flex flex-col items-center justify-center p-4">
              <DollarSign className="text-success mb-2" size={32} />
              <span className="text-3xl font-bold">R$ {totalRevenue.toFixed(2)}</span>
              <span className="text-xs text-secondary mt-1">Receita (Pagos)</span>
            </div>

            <div className="glass-panel flex flex-col items-center justify-center p-4">
              <TrendingUp className="text-accent mb-2" size={32} />
              <span className="text-3xl font-bold">{finishedSessions}</span>
              <span className="text-xs text-secondary mt-1">Sessões Finalizadas</span>
            </div>

            <div className="glass-panel flex flex-col items-center justify-center p-4">
              <Clock className="text-warning mb-2" size={32} />
              <span className="text-3xl font-bold">
                {sessions.filter(s => s.status === 'running').length}
              </span>
              <span className="text-xs text-secondary mt-1">Brincando Agora</span>
            </div>
          </div>

          {Object.keys(totalsByMethod).length > 0 && (
            <div className="glass-panel mb-8 flex flex-wrap gap-6 items-center">
              <div className="text-sm">
                <span className="text-secondary block mb-1">Total Recebido</span>
                <span className="text-xl font-bold text-accent">R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="w-px h-10 bg-slate-700 hidden sm:block mx-2"></div>
              {Object.entries(totalsByMethod).map(([method, total]) => (
                <div key={method} className="text-sm">
                  <span className="text-secondary block mb-1">{method}</span>
                  <span className="font-semibold text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
          )}

          <div className="glass-panel">
            <h2 className="text-lg mb-4 text-accent">Sessões Recentes</h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-secondary">Nenhuma sessão registrada nesta data.</p>
            ) : (
              <ul className="space-y-2">
                {sessions.slice(0, 5).map(s => (
                  <li key={s.id} className="flex justify-between items-center bg-slate-800 p-2 rounded text-sm">
                    <span>{s.child?.name}</span>
                    <span className="text-secondary">{s.status_label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
