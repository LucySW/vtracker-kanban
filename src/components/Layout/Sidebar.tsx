import React from 'react';
import { NavLink } from 'react-router-dom';

export function Sidebar() {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r-0 bg-slate-50 dark:bg-zinc-950 flex flex-col p-4 gap-2 z-40">
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full signature-texture flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>movie_filter</span>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tighter text-violet-600 dark:text-violet-400">VTracker</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Studio Edition</p>
        </div>
      </div>
      <nav className="space-y-1">
        <NavLink to="/" end className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-full font-medium text-sm transition-colors ${isActive ? 'text-violet-600 dark:text-violet-400 bg-slate-200/50 dark:bg-zinc-800/50' : 'text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>movie_filter</span>
          Projects
        </NavLink>
        {/* Placeholder Nav items, we can route them later */}
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors font-medium text-sm">
          <span className="material-symbols-outlined">dashboard</span>
          Dashboard
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors font-medium text-sm">
          <span className="material-symbols-outlined">view_timeline</span>
          Timeline
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors font-medium text-sm">
          <span className="material-symbols-outlined">inventory_2</span>
          Assets
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors font-medium text-sm">
          <span className="material-symbols-outlined">group</span>
          Team
        </button>
      </nav>
      <div className="mt-auto pt-4 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors font-medium text-sm">
          <span className="material-symbols-outlined">help</span>
          Help
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors font-medium text-sm">
          <span className="material-symbols-outlined">archive</span>
          Archive
        </button>
      </div>
    </aside>
  );
}
