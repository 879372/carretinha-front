import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Play, Pause, Square, CheckCircle, Trash2 } from 'lucide-react';
import { useTimer, formatTime } from '../hooks/useTimer';

function SessionCard({ session, onAction, onAddTime }) {
  const { remaining } = useTimer(session);
  const isExpired = remaining === 0;
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={`glass-panel session-card ${session.status} ${isExpired && session.status !== 'finished' ? 'animate-pulse border-danger' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-semibold">{session.child?.name}</h3>
          {session.child?.guardian_name && (
            <div className="text-xs text-secondary opacity-75 mb-1">
              Resp: {session.child.guardian_name}
            </div>
          )}
          <span className="text-sm text-secondary">{session.plan_label}</span>
        </div>
        <div className={`timer-display ${isExpired ? 'text-danger' : 'text-primary'}`}>
          {formatTime(remaining)}
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        {confirmDelete ? (
          <div className="flex items-center gap-2 w-full justify-end">
            <span className="text-sm text-danger font-semibold mr-2">Excluir sessão?</span>
            <button className="btn bg-slate-700 text-white px-3 py-1 text-sm" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </button>
            <button className="btn btn-danger px-3 py-1 text-sm" onClick={() => onAction(session.id, 'delete')}>
              Confirmar
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              {session.status === 'waiting' && (
                <button className="btn btn-primary btn-icon" onClick={() => onAction(session.id, 'start')}>
                  <Play size={20} />
                </button>
              )}
              {session.status === 'running' && (
                <button className="btn btn-accent btn-icon" onClick={() => onAction(session.id, 'pause')}>
                  <Pause size={20} />
                </button>
              )}
              {session.status === 'paused' && (
                <button className="btn btn-success btn-icon" onClick={() => onAction(session.id, 'resume')}>
                  <Play size={20} />
                </button>
              )}
              {session.status !== 'finished' && (
                <button className="btn btn-danger btn-icon" onClick={() => onAction(session.id, 'finish')}>
                  <Square size={20} />
                </button>
              )}
              {isExpired && session.status !== 'finished' && (
                <button className="btn btn-warning px-3 text-sm font-bold" onClick={() => onAddTime(session.id)}>
                  + Tempo
                </button>
              )}
            </div>
            
            {session.status === 'finished' && (
              <span className="text-sm text-secondary flex items-center gap-1">
                <CheckCircle size={16} /> Finalizado
              </span>
            )}
            <button 
              className="btn btn-icon text-secondary hover:text-danger hover:bg-slate-800 transition-colors ml-auto" 
              onClick={() => setConfirmDelete(true)}
              title="Excluir sessão"
            >
              <Trash2 size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { companyId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSessionId, setModalSessionId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");

  const handleOpenAddTime = async (id) => {
    console.log("handleOpenAddTime called for id:", id);
    setModalSessionId(id);
    if (plans.length === 0 || paymentMethods.length === 0) {
      try {
        console.log("Fetching plans and methods...");
        const [resP, resM] = await Promise.all([
          api.get(`/companies/${companyId}/plans/`),
          api.get(`/companies/${companyId}/payment-methods/`)
        ]);
        console.log("Fetched!");
        const fetchedPlans = resP.data.results || resP.data;
        const fetchedMethods = resM.data.results || resM.data;
        setPlans(fetchedPlans);
        setPaymentMethods(fetchedMethods);
        if (fetchedPlans.length > 0) setSelectedPlan(fetchedPlans[0].id);
        if (fetchedMethods.length > 0) setSelectedPayment(fetchedMethods[0].id);
      } catch (e) {
        console.error("Erro ao carregar opções:", e);
      }
    }
    console.log("Opening modal...");
    setIsModalOpen(true);
  };

  const submitAddTime = async () => {
    if (!selectedPlan) return;
    try {
      await api.post(`/companies/${companyId}/sessions/${modalSessionId}/add_time/`, {
        plan: selectedPlan,
        payment_method: selectedPayment
      });
      setIsModalOpen(false);
      fetchSessions();
    } catch(e) {
      alert("Erro ao adicionar tempo.");
    }
  };

  const fetchSessions = async () => {
    if (!companyId) return;
    try {
      const res = await api.get(`/companies/${companyId}/sessions/`);
      setSessions(res.data.results || res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 60000);
    return () => clearInterval(interval);
  }, [companyId]);

  const handleAction = async (id, action) => {
    if (action === 'delete') {
      try {
        await api.delete(`/companies/${companyId}/sessions/${id}/`);
        fetchSessions();
        return;
      } catch (error) {
        console.error("Erro ao excluir sessão:", error);
        return;
      }
    }

    try {
      await api.post(`/companies/${companyId}/sessions/${id}/${action}/`);
      fetchSessions();
    } catch (error) {
      alert("Erro ao realizar ação");
    }
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.status === 'finished' && b.status !== 'finished') return 1;
    if (a.status !== 'finished' && b.status === 'finished') return -1;
    return a.remaining_seconds - b.remaining_seconds;
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl text-accent">Sessões Ativas</h1>
      {loading ? (
        <p>Carregando...</p>
      ) : sortedSessions.length === 0 ? (
        <p className="text-secondary">Nenhuma criança no momento.</p>
      ) : (
        sortedSessions.map(s => <SessionCard key={s.id} session={s} onAction={handleAction} onAddTime={handleOpenAddTime} />)
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel w-full max-w-sm">
            <h2 className="text-xl text-accent mb-4">Adicionar Tempo</h2>
            
            <div className="form-group">
              <label className="form-label">Escolha o Plano Extra</label>
              <select className="form-select" value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — R$ {p.price}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Forma de Pagamento</label>
              <select className="form-select" value={selectedPayment} onChange={e => setSelectedPayment(e.target.value)}>
                {paymentMethods.map(pm => (
                  <option key={pm.id} value={pm.id}>{pm.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mt-6">
              <button className="btn bg-slate-700 text-white flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</button>
              <button className="btn btn-primary flex-1" onClick={submitAddTime}>Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
