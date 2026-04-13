import React from 'react';

interface TopBarProps {
  userEmail?: string;
  onSignOut: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function TopBar({ userEmail, onSignOut, theme, onToggleTheme }: TopBarProps) {
  return (
    <header className="w-full sticky top-0 z-30 bg-slate-50/60 dark:bg-zinc-950/60 backdrop-blur-xl flex items-center justify-between px-8 py-4 shadow-sm dark:shadow-none">
      <div className="flex items-center gap-8">
        <div className="relative group">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <span className="material-symbols-outlined text-lg">search</span>
          </span>
          <input 
            className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all text-on-surface" 
            placeholder="Search projects..." 
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleTheme}
          className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-full transition-all active:scale-95"
          title="Toggle Theme"
        >
          <span className="material-symbols-outlined">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
        <button className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-full transition-all active:scale-95">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50 rounded-full transition-all active:scale-95">
          <span className="material-symbols-outlined">settings</span>
        </button>

        <div className="relative group ml-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-highest cursor-pointer active:scale-95 transition-transform flex items-center justify-center font-bold text-on-surface">
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
          </div>
          {/* Simple Dropdown on Hover/Focus */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container rounded-xl shadow-xl border border-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="p-4 border-b border-white/5">
              <p className="text-sm font-semibold truncate text-on-surface">{userEmail}</p>
            </div>
            <div className="p-2">
              <button 
                onClick={onSignOut}
                className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
