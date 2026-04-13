interface TopBarProps {
  userEmail?: string;
  onSignOut: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  title?: string;
  onBack?: () => void;
}

export function TopBar({ userEmail, onSignOut, activeTab = 'projects', onTabChange, title, onBack }: TopBarProps) {
  const tabs = [
    { id: 'projects', label: 'Projects' },
    { id: 'studio', label: 'Studio' },
    { id: 'review', label: 'Review' },
  ];

  return (
    <header className="flex justify-between items-center px-6 py-3 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl z-40 sticky top-0">
      <div className="flex items-center gap-8">
        {/* Mobile brand */}
        {onBack ? (
          <button onClick={onBack} className="flex items-center gap-2 text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-medium">{title || 'Back'}</span>
          </button>
        ) : (
          <span className="text-lg font-semibold tracking-tighter text-white block md:hidden">VTracker</span>
        )}

        {/* Desktop tabs */}
        <nav className="hidden md:flex gap-6 items-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`font-['Inter'] text-sm tracking-tight transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-primary font-medium border-b border-primary pb-1'
                  : 'text-gray-400 font-normal hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden sm:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 material-symbols-outlined text-sm">search</span>
          <input
            className="bg-surface-container-lowest rounded-lg pl-9 pr-4 py-1.5 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-primary/40 border-none text-white placeholder:text-zinc-600"
            placeholder="Search"
            type="text"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:bg-surface-container-highest rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-gray-400 hover:bg-surface-container-highest rounded-full transition-colors">
            <span className="material-symbols-outlined">help</span>
          </button>

          {/* User avatar with dropdown */}
          <div className="relative group ml-2">
            <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden flex items-center justify-center text-on-surface font-bold text-sm cursor-pointer">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container rounded-xl shadow-xl border border-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
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
      </div>
    </header>
  );
}
