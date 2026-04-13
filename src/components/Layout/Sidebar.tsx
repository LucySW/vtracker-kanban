interface SidebarProps {
  activeView?: 'projects' | 'templates' | 'library' | 'settings';
  onNavigate?: (view: string) => void;
}

export function Sidebar({ activeView = 'projects', onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'projects', icon: 'grid_view', label: 'Projects' },
    { id: 'templates', icon: 'auto_awesome_motion', label: 'Templates' },
    { id: 'library', icon: 'video_library', label: 'Library' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="hidden md:flex flex-col h-full w-64 bg-surface-container-low py-8 px-4 gap-2 shadow-[20px_0_80px_rgba(0,0,0,0.4)] z-50">
      {/* Branding */}
      <div className="mb-10 px-4">
        <h1 className="text-xl font-bold text-gradient-primary">The Studio</h1>
        <p className="text-xs text-gray-500 font-medium tracking-wide">Production Hub</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-grow">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate?.(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-full font-medium tracking-wide transition-all duration-300 w-full text-left ${
              activeView === item.id
                ? 'bg-surface-container-highest text-primary'
                : 'text-gray-500 hover:text-gray-200 hover:bg-[#1a1a1a] hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto flex flex-col gap-2 pt-6">
        <button className="w-full bg-gradient-to-r from-primary to-primary-dim text-on-primary-container font-semibold py-3 px-4 rounded-full mb-6 hover:opacity-90 active:scale-[0.98] transition-all">
          Render Video
        </button>
        <button className="flex items-center gap-3 text-gray-500 px-4 py-3 hover:text-gray-200 hover:bg-[#1a1a1a] rounded-full transition-all duration-300 w-full">
          <span className="material-symbols-outlined">contact_support</span>
          <span>Support</span>
        </button>
        <button className="flex items-center gap-3 text-gray-500 px-4 py-3 hover:text-gray-200 hover:bg-[#1a1a1a] rounded-full transition-all duration-300 w-full">
          <span className="material-symbols-outlined">person</span>
          <span>Account</span>
        </button>
      </div>
    </aside>
  );
}
