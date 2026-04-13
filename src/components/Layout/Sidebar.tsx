interface SidebarProps {
  activeView?: 'projects';
  onSignOut?: () => void;
  userEmail?: string;
}

export function Sidebar({ activeView = 'projects', onSignOut, userEmail }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col h-full w-64 bg-surface-container-low py-8 px-4 gap-2 shadow-[20px_0_80px_rgba(0,0,0,0.4)] z-50">
      {/* Branding */}
      <div className="mb-10 px-4">
        <h1 className="text-xl font-bold text-gradient-primary">VTracker</h1>
        <p className="text-xs text-gray-500 font-medium tracking-wide">Hub de Produção</p>
      </div>

      {/* Navigation — only functional items */}
      <nav className="flex flex-col gap-2 flex-grow">
        <button
          className={`flex items-center gap-3 px-4 py-3 rounded-full font-medium tracking-wide transition-all duration-300 w-full text-left ${
            activeView === 'projects'
              ? 'bg-surface-container-highest text-primary'
              : 'text-gray-500 hover:text-gray-200 hover:bg-[#1a1a1a] hover:translate-x-1'
          }`}
        >
          <span className="material-symbols-outlined">grid_view</span>
          <span>Projetos</span>
        </button>
      </nav>

      {/* Bottom — user info + sign out */}
      <div className="mt-auto flex flex-col gap-2 pt-6 border-t border-outline-variant/10">
        {userEmail && (
          <div className="px-4 py-2">
            <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
          </div>
        )}
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 text-gray-500 px-4 py-3 hover:text-error hover:bg-error/10 rounded-full transition-all duration-300 w-full"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Sair</span>
          </button>
        )}
      </div>
    </aside>
  );
}
