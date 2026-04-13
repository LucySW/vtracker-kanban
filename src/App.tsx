import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import LoginPage from './components/Auth/LoginPage';
import Dashboard from './components/Dashboard/Dashboard';
import Board from './components/Kanban/Board';
import type { Project } from './lib/types';

import './styles/globals.css';
import './styles/layout.css';
import './styles/kanban.css';

export default function App() {
  const { session, loading, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Carregando...
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
        onToggleTheme={toggleTheme}
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
      onToggleTheme={toggleTheme}
      userEmail={user.email}
      onSignOut={signOut}
    />
  );
}
