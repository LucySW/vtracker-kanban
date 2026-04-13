import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/Auth/LoginPage';
import Dashboard from './components/Dashboard/Dashboard';
import Board from './components/Kanban/Board';
import type { Project } from './lib/types';

import './styles/globals.css';

export default function App() {
  const { session, loading, user, signOut } = useAuth();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Dark-only theme
  const theme = 'dark' as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-on-surface-variant text-sm font-medium tracking-wide">Initializing VTracker...</span>
        </div>
      </div>
    );
  }

  if (!session || !user) {
    return <LoginPage theme={theme} />;
  }

  if (currentProject) {
    return (
      <Board
        project={currentProject}
        onBack={() => setCurrentProject(null)}
        theme={theme}
        onToggleTheme={() => {}}
        userEmail={user.email}
        userId={user.id}
        onSignOut={signOut}
      />
    );
  }

  return (
    <Dashboard
      userId={user.id}
      onSelectProject={setCurrentProject}
      theme={theme}
      onToggleTheme={() => {}}
      userEmail={user.email}
      onSignOut={signOut}
    />
  );
}
