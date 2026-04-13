import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';

export default function LoginPage({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🎬 VTracker</h1>
          <p>Gerencie seus vídeos de IA em um Kanban inteligente</p>
        </div>
        <div className="auth-card">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: { brand: '#3b82f6', brandAccent: '#2563eb' },
                  radii: { borderRadiusButton: '8px', inputBorderRadius: '8px' },
                },
              },
            }}
            providers={['google']}
            theme={theme}
            localization={{
              variables: {
                sign_in: { email_label: 'Email', password_label: 'Senha', button_label: 'Entrar', link_text: 'Já tem conta? Entre' },
                sign_up: { email_label: 'Email', password_label: 'Senha', button_label: 'Criar conta', link_text: 'Não tem conta? Cadastre-se' },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
