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
  const [payments, setPayments] = useState([]);
  const [customDuration, setCustomDuration] = useState("");
  const [customPrice, setCustomPrice] = useState("");

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
        const fetchedPlans = (resP.data.results || resP.data).filter(p => p.is_active !== false);
        const fetchedMethods = resM.data.results || resM.data;
        setPlans(fetchedPlans);
        setPaymentMethods(fetchedMethods);
        if (fetchedPlans.length > 0) setSelectedPlan(fetchedPlans[0].id);
        if (fetchedMethods.length > 0) setPayments([{ payment_method: fetchedMethods[0].id, amount: '' }]);
      } catch (e) {
        console.error("Erro ao carregar opções:", e);
      }
    } else {
      if (paymentMethods.length > 0) setPayments([{ payment_method: paymentMethods[0].id, amount: '' }]);
    }
    console.log("Opening modal...");
    setIsModalOpen(true);
  };

  const submitAddTime = async () => {
    if (!selectedPlan) return;
    
    const payload = {};
    const paymentsPayload = [...payments];
    if (paymentsPayload.length === 1 && !paymentsPayload[0].amount) {
      const totalPrice = selectedPlan === 'other' ? customPrice : plans.find(p => p.id === selectedPlan)?.price;
      paymentsPayload[0].amount = totalPrice || 0;
    }
    payload.payments = paymentsPayload;

    if (selectedPlan === 'other') {
      payload.custom_duration_minutes = customDuration;
      payload.custom_price = customPrice;
    } else {
      payload.plan = selectedPlan;
    }

    try {
      await api.post(`/companies/${companyId}/sessions/${modalSessionId}/add_time/`, payload);
      setIsModalOpen(false);
      setCustomDuration("");
      setCustomPrice("");
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

  const sortedSessions = [...sessions]
    .filter(s => s.status !== 'finished')
    .sort((a, b) => {
      return a.remaining_seconds - b.remaining_seconds;
    });

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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl text-accent">Sessões Ativas</h1>
      </div>

      <div className="glass-panel mb-6 flex flex-wrap gap-6 items-center">
        <div className="text-sm">
          <span className="text-secondary block mb-1">Total Recebido</span>
          <span className="text-xl font-bold text-accent">R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
        </div>
        {Object.keys(totalsByMethod).length > 0 && (
          <div className="w-px h-10 bg-slate-700 hidden sm:block mx-2"></div>
        )}
        {Object.entries(totalsByMethod).map(([method, total]) => (
          <div key={method} className="text-sm">
            <span className="text-secondary block mb-1">{method}</span>
            <span className="font-semibold text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
        ))}
      </div>
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
                <option value="other">Outro (Personalizado)</option>
              </select>
            </div>

            {selectedPlan === 'other' && (
              <div className="form-group flex gap-4 mt-2">
                <div className="flex-1">
                  <label className="form-label">Tempo (minutos)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    min="1"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="form-label">Valor (R$)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    required 
                    min="0"
                    step="0.01"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label mb-0">Pagamento</label>
                <button type="button" className="text-sm text-accent hover:underline" onClick={() => {
                  if (paymentMethods.length > 0) {
                    setPayments([...payments, { payment_method: paymentMethods[0].id, amount: '' }]);
                  }
                }}>+ Dividir pagamento</button>
              </div>
              {payments.map((p, index) => (
                <div key={index} className="flex gap-2 mb-2 items-center">
                  <select 
                    className="form-select flex-1"
                    value={p.payment_method}
                    onChange={(e) => {
                      const newP = [...payments];
                      newP[index].payment_method = e.target.value;
                      setPayments(newP);
                    }}
                    required
                  >
                    {paymentMethods.map(pm => (
                      <option key={pm.id} value={pm.id}>{pm.name}</option>
                    ))}
                  </select>
                  <input 
                    type="number" 
                    className="form-input w-24" 
                    placeholder="Valor"
                    min="0"
                    step="0.01"
                    required={payments.length > 1}
                    value={p.amount}
                    onChange={(e) => {
                      const newP = [...payments];
                      newP[index].amount = e.target.value;
                      setPayments(newP);
                    }}
                  />
                  {payments.length > 1 && (
                    <button type="button" className="text-danger font-bold px-2" onClick={() => {
                      setPayments(payments.filter((_, i) => i !== index));
                    }}>X</button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <button className="btn bg-slate-700 text-white flex-1" onClick={() => {
                setIsModalOpen(false);
                setCustomDuration("");
                setCustomPrice("");
              }}>Cancelar</button>
              <button className="btn btn-primary flex-1" onClick={submitAddTime}>Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
