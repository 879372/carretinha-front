import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export default function NewSession() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [formData, setFormData] = useState({
    child_name: '',
    guardian_name: '',
    guardian_whatsapp: '',
    plan: '',
    custom_duration_minutes: '',
    custom_price: ''
  });

  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    const fetchData = async () => {
      try {
        const [resPlans, resMethods] = await Promise.all([
          api.get(`/companies/${companyId}/plans/`),
          api.get(`/companies/${companyId}/payment-methods/`)
        ]);
        const plansData = (resPlans.data.results || resPlans.data).filter(p => p.is_active !== false);
        const methodsData = resMethods.data.results || resMethods.data;
        
        setPlans(plansData);
        setPaymentMethods(methodsData);
        
        if (plansData.length > 0) {
          setFormData(prev => ({ ...prev, plan: plansData[0].id }));
        }
        if (methodsData.length > 0) {
          setPayments([{ payment_method: methodsData[0].id, amount: '' }]);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações da empresa:", error);
      }
    };
    fetchData();
  }, [companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      
      const paymentsPayload = [...payments];
      if (paymentsPayload.length === 1 && !paymentsPayload[0].amount) {
        const totalPrice = payload.plan === 'other' ? payload.custom_price : plans.find(p => p.id === payload.plan)?.price;
        paymentsPayload[0].amount = totalPrice || 0;
      }
      payload.payments = paymentsPayload;

      if (payload.plan === 'other') {
        delete payload.plan;
      } else {
        delete payload.custom_duration_minutes;
        delete payload.custom_price;
      }
      await api.post(`/companies/${companyId}/sessions/`, payload);
      navigate(`/${companyId}/`);
    } catch (error) {
      console.error(error);
      alert('Erro ao criar sessão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel">
      <h1 className="mb-4 text-2xl text-accent">Nova Criança</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nome da Criança</label>
          <input 
            type="text" 
            className="form-input" 
            required 
            value={formData.child_name}
            onChange={(e) => setFormData({...formData, child_name: e.target.value})}
          />
        </div>
        


        <div className="form-group">
          <label className="form-label">Nome do Responsável</label>
          <input 
            type="text" 
            className="form-input" 
            value={formData.guardian_name}
            onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label className="form-label">WhatsApp</label>
          <input 
            type="tel" 
            className="form-input" 
            placeholder="11999999999"
            value={formData.guardian_whatsapp}
            onChange={(e) => setFormData({...formData, guardian_whatsapp: e.target.value})}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Plano</label>
          <select 
            className="form-select"
            value={formData.plan}
            onChange={(e) => setFormData({...formData, plan: e.target.value})}
            required
          >
            {plans.map(p => (
              <option key={p.id} value={p.id}>{p.name} — R$ {p.price}</option>
            ))}
            <option value="other">Outro (Personalizado)</option>
          </select>
        </div>

        {formData.plan === 'other' && (
          <div className="form-group flex gap-4">
            <div className="flex-1">
              <label className="form-label">Tempo (minutos)</label>
              <input 
                type="number" 
                className="form-input" 
                required 
                min="1"
                value={formData.custom_duration_minutes}
                onChange={(e) => setFormData({...formData, custom_duration_minutes: e.target.value})}
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
                value={formData.custom_price}
                onChange={(e) => setFormData({...formData, custom_price: e.target.value})}
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

        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? 'Criando...' : 'Iniciar Diversão'}
        </button>
      </form>
    </div>
  );
}
