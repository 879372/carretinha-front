import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MessageCircle, BarChart3 } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="lp-container">
      {/* Header */}
      <header className="lp-header">
        <div className="lp-logo">
          <div className="lp-logo-icon">
            <Clock size={18} />
          </div>
          Playground Time
        </div>
        <a 
          href="https://wa.me/5584986276144?text=Olá! Gostaria de testar o sistema Playground Time." 
          target="_blank" 
          rel="noopener noreferrer"
          className="lp-btn-primary" 
          style={{ padding: '0.5rem 1.5rem', fontSize: '1rem', display: 'inline-block' }}
        >
          Começar
        </a>
      </header>

      {/* Hero Section */}
      <main className="lp-hero">
        <div className="lp-glow-1"></div>
        <div className="lp-glow-2"></div>

        <div>
          <h1 className="lp-hero-title">
            O controle <span className="gradient-text">perfeito</span> para o seu parquinho.
          </h1>
          <p className="lp-hero-desc">
            Gerencie o tempo das crianças, acompanhe os pagamentos e avise os pais automaticamente pelo WhatsApp. Tudo em um único sistema inteligente e em tempo real.
          </p>
          <div className="lp-buttons">
            <a 
              href="https://wa.me/5584986276144?text=Olá! Gostaria de criar uma conta para minha empresa no Playground Time." 
              target="_blank" 
              rel="noopener noreferrer"
              className="lp-btn-primary"
              style={{ display: 'inline-block', textAlign: 'center' }}
            >
              Criar Minha Empresa
            </a>
            <a 
              href="https://wa.me/5584986276144?text=Olá! Quero falar com o setor de vendas do Playground Time." 
              target="_blank" 
              rel="noopener noreferrer"
              className="lp-btn-outline"
              style={{ display: 'inline-block', textAlign: 'center' }}
            >
              Falar com Vendas
            </a>
          </div>
        </div>

        <div className="lp-image-wrapper">
          <div className="lp-badge lp-badge-1">
            <div className="lp-badge-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981' }}>
              <MessageCircle size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>WhatsApp Enviado</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>Avisar Pais: OK</p>
            </div>
          </div>

          <div className="lp-badge lp-badge-2">
            <div className="lp-badge-icon" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#EAB308' }}>
              <Clock size={20} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>Tempo Expirado</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>Adicionar +Tempo</p>
            </div>
          </div>

          <img 
            src="/hero.png" 
            alt="Playground Dashboard Interface" 
            className="lp-image"
          />
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="lp-features">
        <div className="lp-features-header">
          <h2 className="lp-features-title">Tudo o que você precisa</h2>
          <p className="lp-features-desc">Nossa plataforma foi construída pensando na rotina caótica de quem administra um espaço infantil.</p>
        </div>

        <div className="lp-features-grid">
          <div className="lp-feature-card">
            <div className="lp-feature-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6' }}>
              <Clock size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Cronômetro Inteligente</h3>
            <p style={{ color: '#94A3B8', lineHeight: 1.5 }}>Acompanhe dezenas de crianças ao mesmo tempo sem se perder. Cores vibrantes indicam quem está jogando, pausado ou com tempo esgotado.</p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-icon" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981' }}>
              <MessageCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>WhatsApp Automático</h3>
            <p style={{ color: '#94A3B8', lineHeight: 1.5 }}>Chega de gritar o nome da criança! O sistema envia um link privado para o WhatsApp do responsável acompanhar o tempo em tempo real.</p>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-icon" style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#EAB308' }}>
              <BarChart3 size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard Financeiro</h3>
            <p style={{ color: '#94A3B8', lineHeight: 1.5 }}>Saiba exatamente quanto entrou no dia via Pix, Cartão ou Dinheiro. Controle total do faturamento de forma clara e objetiva.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-logo" style={{ fontSize: '1rem' }}>
          <Clock size={18} color="#3B82F6" />
          <span style={{ color: 'white' }}>Playground Time</span>
        </div>
        <p style={{ margin: 0 }}>© 2026 Playground Time SaaS. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
