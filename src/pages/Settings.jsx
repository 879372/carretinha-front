import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

export default function Settings() {
  const { companyId } = useParams();
  
  const [company, setCompany] = useState(null);
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newPlan, setNewPlan] = useState({ name: '', duration_minutes: '', price: '' });
  const [newMethod, setNewMethod] = useState({ name: '' });

  const fetchData = async () => {
    try {
      setLoading(true);
      const resCompany = await api.get(`/companies/${companyId}/`);
      setCompany(resCompany.data);

      const resPlans = await api.get(`/companies/${companyId}/plans/`);
      setPlans(resPlans.data.results || resPlans.data);

      const resMethods = await api.get(`/companies/${companyId}/payment-methods/`);
      setPaymentMethods(resMethods.data.results || resMethods.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 404) {
        alert("Empresa não encontrada no sistema.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) fetchData();
  }, [companyId]);

  const handleUpdateCompany = async () => {
    try {
      const formData = new FormData();
      formData.append('name', company.name);
      if (company.phone) formData.append('phone', company.phone);
      if (company.whatsapp_instance) formData.append('whatsapp_instance', company.whatsapp_instance);
      
      // If there's a new file selected
      if (company.new_logo) {
        formData.append('logo', company.new_logo);
      }

      await api.patch(`/companies/${companyId}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Empresa atualizada!");
      fetchData(); // reload to get new logo URL
    } catch(e) { alert("Erro ao atualizar."); }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/companies/${companyId}/plans/`, newPlan);
      setNewPlan({ name: '', duration_minutes: '', price: '' });
      fetchData();
    } catch(e) { alert("Erro ao criar plano"); }
  };

  const handleAddMethod = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/companies/${companyId}/payment-methods/`, newMethod);
      setNewMethod({ name: '' });
      fetchData();
    } catch(e) { alert("Erro ao criar forma de pagamento"); }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Excluir plano?")) return;
    try {
      await api.delete(`/companies/${companyId}/plans/${id}/`);
      fetchData();
    } catch(e) { alert("Erro ao deletar"); }
  }

  const handleDeleteMethod = async (id) => {
    if (!window.confirm("Excluir forma de pagamento?")) return;
    try {
      await api.delete(`/companies/${companyId}/payment-methods/${id}/`);
      fetchData();
    } catch(e) { alert("Erro ao deletar"); }
  }

  if (loading) return <p className="text-center mt-10">Carregando configurações...</p>;
  if (!company) return <p className="text-center mt-10 text-danger">Empresa "{companyId}" não encontrada.</p>;

  return (
    <div className="glass-panel pb-20">
      <h1 className="text-2xl text-accent mb-6">Configurações</h1>

      <div className="mb-8 p-4 border border-slate-700 rounded-lg">
        <h2 className="text-xl mb-4">Dados da Empresa</h2>
        
        {company.logo && (
          <div className="mb-4 text-center">
            <img 
              src={company.logo} 
              alt="Logo da Empresa" 
              style={{ maxHeight: '100px', maxWidth: '300px', width: '100%', objectFit: 'contain', background: 'rgba(255,255,255,0.1)' }}
              className="rounded p-1 inline-block" 
            />
          </div>
        )}

        <div className="flex flex-col gap-4 mb-4">
          <div className="form-group mb-0">
            <label className="form-label">Nome da Empresa</label>
            <input 
              className="form-input w-full" 
              value={company.name} 
              onChange={(e) => setCompany({...company, name: e.target.value})} 
            />
          </div>
          
          <div className="form-group mb-0">
            <label className="form-label">Telefone de Contato</label>
            <input 
              className="form-input w-full" 
              placeholder="(00) 00000-0000"
              value={company.phone || ''} 
              onChange={(e) => setCompany({...company, phone: e.target.value})} 
            />
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Instância WhatsApp (Evolution API)</label>
            <input 
              className="form-input w-full" 
              placeholder="ex: empresa_matriz_1"
              value={company.whatsapp_instance || ''} 
              onChange={(e) => setCompany({...company, whatsapp_instance: e.target.value})} 
            />
          </div>

          <div className="form-group mb-0">
            <label className="form-label">Logo da Empresa</label>
            <input 
              type="file"
              accept="image/*"
              className="form-input w-full bg-slate-800 text-sm" 
              onChange={(e) => setCompany({...company, new_logo: e.target.files[0]})} 
            />
          </div>
        </div>

        <button className="btn btn-primary w-full" onClick={handleUpdateCompany}>Salvar Configurações</button>
      </div>

      <div className="mb-8 p-4 border border-slate-700 rounded-lg">
        <h2 className="text-xl mb-4">Planos</h2>
        <ul className="mb-4">
          {plans.map(p => (
            <li key={p.id} className="flex justify-between items-center mb-2 bg-slate-800 p-2 rounded">
              <span>{p.name} - R$ {p.price} ({p.duration_minutes} min)</span>
              <button className="text-danger text-xl font-bold px-2 hover:bg-slate-700 rounded" onClick={() => handleDeletePlan(p.id)}>&times;</button>
            </li>
          ))}
          {plans.length === 0 && <p className="text-secondary text-sm">Nenhum plano cadastrado.</p>}
        </ul>
        <form className="flex gap-2 flex-wrap" onSubmit={handleAddPlan}>
          <input className="form-input flex-1 min-w-[150px]" placeholder="Nome do plano" required value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} />
          <input className="form-input w-24" type="number" placeholder="Minutos" required value={newPlan.duration_minutes} onChange={e => setNewPlan({...newPlan, duration_minutes: e.target.value})} />
          <input className="form-input w-24" type="number" step="0.01" placeholder="R$" required value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} />
          <button className="btn btn-success" type="submit">Add Plano</button>
        </form>
      </div>

      <div className="p-4 border border-slate-700 rounded-lg">
        <h2 className="text-xl mb-4">Formas de Pagamento</h2>
        <ul className="mb-4">
          {paymentMethods.map(pm => (
            <li key={pm.id} className="flex justify-between items-center mb-2 bg-slate-800 p-2 rounded">
              <span>{pm.name}</span>
              <button className="text-danger text-xl font-bold px-2 hover:bg-slate-700 rounded" onClick={() => handleDeleteMethod(pm.id)}>&times;</button>
            </li>
          ))}
          {paymentMethods.length === 0 && <p className="text-secondary text-sm">Nenhuma forma de pagamento cadastrada.</p>}
        </ul>
        <form className="flex gap-2" onSubmit={handleAddMethod}>
          <input className="form-input flex-1" placeholder="Nova forma (ex: Pix)" required value={newMethod.name} onChange={e => setNewMethod({...newMethod, name: e.target.value})} />
          <button className="btn btn-success" type="submit">Add Forma</button>
        </form>
      </div>
    </div>
  );
}
