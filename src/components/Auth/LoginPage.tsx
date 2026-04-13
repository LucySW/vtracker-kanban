import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginPage(_props: { theme: 'light' | 'dark' }) {
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
    <div className="flex min-h-screen bg-surface text-on-surface overflow-hidden">
      {/* ===== Left Section: Branding & Impact ===== */}
      <section className="hidden md:flex flex-1 flex-col justify-center px-16 lg:px-24 bg-surface-container-low relative overflow-hidden">
        {/* Decorative atmospheric blurs */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse-glow" />
          <div className="absolute bottom-12 right-12 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10 space-y-8">
          {/* Feature badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest ghost-border">
            <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Now featuring Script-Sync</span>
          </div>

          {/* Hero Title */}
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1] text-white">
              VTracker <span className="text-primary-dim">Workflow Hub</span>
            </h1>
            <p className="text-lg lg:text-xl text-on-surface-variant max-w-xl leading-relaxed">
              A plataforma definitiva para produção de vídeos, geração com IA e sincronização de roteiros em tempo real. Orquestre sua visão criativa com precisão.
            </p>
          </div>

          {/* Feature list */}
          <div className="grid gap-6 pt-8">
            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <span className="material-symbols-outlined text-primary">view_kanban</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Kanban Interativo Avançado</h3>
                <p className="text-on-surface-variant text-sm">Visualize seu pipeline de produção com rastreamento dinâmico de status.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <span className="material-symbols-outlined text-secondary">movie_edit</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Geração de Vídeos IA Integrada</h3>
                <p className="text-on-surface-variant text-sm">Gere b-roll e concept art instantaneamente com motores neurais.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                <span className="material-symbols-outlined text-primary-fixed-dim">sync_alt</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Sincronização em Tempo Real</h3>
                <p className="text-on-surface-variant text-sm">Mantenha teleprompter, dailies e equipe editorial em perfeito alinhamento.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Right Section: Login Interface ===== */}
      <section className="flex-1 flex items-center justify-center bg-surface p-8 relative">
        {/* Mobile decorative blur */}
        <div className="absolute inset-0 md:hidden overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/30 blur-[160px] rounded-full" />
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md glass-effect p-8 lg:p-12 rounded-2xl ghost-border shadow-deep relative overflow-hidden group">
          {/* Top gradient highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-dim/40 to-transparent" />

          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">
              {isLogin ? 'Bem-vindo de volta' : 'Criar nova conta'}
            </h2>
            <p className="text-on-surface-variant text-sm">
              {isLogin ? 'Faça login na sua conta para continuar' : 'Preencha seus dados para começar'}
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Auth */}
            <button
              onClick={handleGoogleLogin}
              className="w-full h-14 flex items-center justify-center gap-3 bg-white text-on-primary-fixed rounded-full font-semibold hover:bg-zinc-200 transition-all duration-300 active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar com Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-grow h-[1px] bg-outline-variant/20" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-600">Ou entre com e-mail</span>
              <div className="flex-grow h-[1px] bg-outline-variant/20" />
            </div>

            {/* Alerts */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm text-center">
                {error}
              </div>
            )}
            {msg && (
              <div className="px-4 py-3 rounded-xl bg-tertiary/10 border border-tertiary/20 text-tertiary text-sm text-center">
                {msg}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant ml-4">
                  Endereço de Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nome@exemplo.com"
                  className="w-full h-14 bg-surface-container-lowest text-white px-6 rounded-full border-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">
                    Senha
                  </label>
                  {isLogin && (
                    <button type="button" className="text-[10px] uppercase font-bold tracking-widest text-primary hover:text-white transition-colors">
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-14 bg-surface-container-lowest text-white px-6 pr-14 rounded-full border-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Primary Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary-container text-on-primary-container font-bold text-lg rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar conta')}
              </button>
            </form>

            {/* Toggle Login/Register */}
            <div className="text-center pt-2">
              <span className="text-on-surface-variant text-sm">
                {isLogin ? 'Não tem uma conta? ' : 'Já tem uma conta? '}
              </span>
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); setMsg(''); }}
                className="text-white font-bold text-sm hover:text-primary transition-colors"
              >
                {isLogin ? 'Criar conta' : 'Entrar'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="fixed bottom-0 w-full py-6 px-8 bg-surface-container-lowest flex flex-col md:flex-row justify-between items-center gap-4 border-t border-outline-variant/10 z-40">
        <div className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold">© 2024 VTRACKER DIGITAL. TODOS OS DIREITOS RESERVADOS.</div>
        <div className="flex gap-8">
          <a className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold hover:text-primary transition-colors" href="#">Termos de Uso</a>
          <a className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold hover:text-primary transition-colors" href="#">Política de Privacidade</a>
          <a className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold hover:text-primary transition-colors" href="#">Status do Sistema</a>
        </div>
      </footer>

      {/* ===== Header ===== */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-8 h-20 bg-gradient-to-b from-zinc-900 to-transparent pointer-events-none">
        <div className="text-2xl font-black tracking-tighter text-white uppercase pointer-events-auto">VTRACKER</div>
        <div className="flex gap-4 pointer-events-auto">
          <span className="text-zinc-500 font-medium text-sm tracking-widest uppercase">Status: Online</span>
        </div>
      </header>
    </div>
  );
}
