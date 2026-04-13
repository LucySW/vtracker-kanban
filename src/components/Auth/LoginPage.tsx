import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ theme }: { theme: 'light' | 'dark' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Conta criada! Cheque seu e-mail para confirmar.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro de autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com Google');
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-hero">
        <div className="hero-content">
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
        <div className="auth-container-modern auth-custom">
          <div className="auth-header-modern">
            <h2>{isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}</h2>
            <p>{isLogin ? 'Faça login na sua conta para continuar' : 'Preencha seus dados para começar'}</p>
          </div>
          <div className="auth-card-modern">
            <button className="btn-google" onClick={handleGoogleLogin}>
              <img src="https://www.google.com/favicon.ico" alt="Google" />
              Continuar com Google
            </button>
            
            <div className="auth-divider"><span>ou continue com email</span></div>

            {error && <div className="auth-alert auth-error">{error}</div>}
            {msg && <div className="auth-alert auth-success">{msg}</div>}

            <form onSubmit={handleEmailAuth} className="custom-auth-form">
              <div className="form-group">
                <label htmlFor="email">Endereço de Email</label>
                <input 
                  id="email" 
                  name="email"
                  type="email" 
                  autoComplete="username"
                  required
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="Seu email address"
                  className="input modern-input"
                />
              </div>
              
              <div className="form-group relative-group">
                <label htmlFor="password">Senha</label>
                <div className="password-wrapper">
                  <input 
                    id="password" 
                    name="password"
                    type={showPassword ? 'text' : 'password'} 
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="Sua senha"
                    className="input modern-input pr-10"
                  />
                  <button type="button" className="btn-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full modern-btn" disabled={loading}>
                {loading ? 'Aguarde...' : (isLogin ? 'Entrar no Hub' : 'Criar conta')}
              </button>
            </form>

            <div className="auth-footer">
              <button className="link-button" onClick={() => { setIsLogin(!isLogin); setError(''); setMsg(''); }}>
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
