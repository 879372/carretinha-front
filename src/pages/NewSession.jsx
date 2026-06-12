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
    payment_method: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    const fetchData = async () => {
      try {
        const [resPlans, resMethods] = await Promise.all([
          api.get(`/companies/${companyId}/plans/`),
          api.get(`/companies/${companyId}/payment-methods/`)
        ]);
        const plansData = resPlans.data.results || resPlans.data;
        const methodsData = resMethods.data.results || resMethods.data;
        
        setPlans(plansData);
        setPaymentMethods(methodsData);
        
        if (plansData.length > 0) {
          setFormData(prev => ({ ...prev, plan: plansData[0].id }));
        }
        if (methodsData.length > 0) {
          setFormData(prev => ({ ...prev, payment_method: methodsData[0].id }));
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
      await api.post(`/companies/${companyId}/sessions/`, formData);
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
            required 
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
            required 
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
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Pagamento</label>
          <select 
            className="form-select"
            value={formData.payment_method}
            onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
            required
          >
            {paymentMethods.map(pm => (
              <option key={pm.id} value={pm.id}>{pm.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
          {loading ? 'Criando...' : 'Iniciar Diversão'}
        </button>
      </form>
    </div>
  );
}
