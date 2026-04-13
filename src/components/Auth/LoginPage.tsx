import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';

export default function LoginPage({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="hero-content">
          {/* O logo será puxado da pasta public/logo.png */}
          <div className="logo-placeholder">
            <img src="/logo.png" alt="Romsoft" onError={(e) => e.currentTarget.style.display = 'none'} />
            <h2>ROMSOFT</h2>
          </div>
          <h1>Workflow <span className="highlight">Hub</span></h1>
          <p className="hero-subtitle">
            A plataforma definitiva para organizar o fluxo de produção de vídeos, automatizar gerações com IA e gerenciar roteiros em tempo real.
          </p>
          <ul className="hero-features">
            <li><span>🎬</span> Kanban Interativo Avançado</li>
            <li><span>🤖</span> Geração de Vídeos IA Integrada</li>
            <li><span>⚡</span> Sincronização em Tempo Real</li>
          </ul>
        </div>
      </div>
      
      <div className="landing-auth">
        <div className="auth-container-modern">
          <div className="auth-header-modern">
            <h2>Bem-vindo de volta</h2>
            <p>Faça login na sua conta para continuar</p>
          </div>
          <div className="auth-card-modern">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: { brand: '#3b82f6', brandAccent: '#2563eb' },
                    radii: { borderRadiusButton: '12px', inputBorderRadius: '12px' },
                  },
                },
              }}
              providers={['google']}
              redirectTo={window.location.origin}
              theme={theme}
              localization={{
                variables: {
                  sign_in: { email_label: 'Endereço de Email', password_label: 'Senha', button_label: 'Entrar no Hub', link_text: 'Já tem conta? Entre' },
                  sign_up: { email_label: 'Endereço de Email', password_label: 'Senha', button_label: 'Criar conta', link_text: 'Não tem conta? Cadastre-se' },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
