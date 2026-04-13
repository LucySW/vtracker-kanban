interface TopBarProps {
  title: string;
  onBack?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userEmail?: string;
  onSignOut: () => void;
}

export default function TopBar({ title, onBack, theme, onToggleTheme, userEmail, onSignOut }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        {onBack && (
          <button className="btn-icon back-btn" onClick={onBack} title="Voltar">←</button>
        )}
        <span className="topbar-title">{title}</span>
      </div>
      <div className="topbar-right">
        <button className="btn-icon theme-toggle" onClick={onToggleTheme} title="Alternar tema">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {userEmail && (
          <div className="user-avatar" title={userEmail}>
            {userEmail.charAt(0).toUpperCase()}
          </div>
        )}
        <button className="btn-icon" onClick={onSignOut} title="Sair">⏻</button>
      </div>
    </header>
  );
}
