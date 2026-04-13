import { useState, useRef } from 'react';
import type { Project } from '../../lib/types';
import { useProjects } from '../../hooks/useProjects';

interface DashboardProps {
  userId: string;
  onSelectProject: (project: Project) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userEmail?: string;
  onSignOut: () => void;
}

export default function Dashboard({ userId, onSelectProject, theme, onToggleTheme, userEmail, onSignOut }: DashboardProps) {
  const { projects, templates, loading, createProject, createProjectFromJson, deleteProject } = useProjects(userId);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const project = await createProject(newName, newDesc, selectedTemplate || undefined);
    if (project) {
      setShowNewModal(false);
      setNewName('');
      setNewDesc('');
      setSelectedTemplate('');
      onSelectProject(project);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const project = await createProjectFromJson(json);
      if (project) {
        setShowImportModal(false);
        onSelectProject(project);
      }
    } catch {
      alert('JSON inválido. Verifique o formato do arquivo.');
    }
  };

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="topbar-left">
          <span className="topbar-title">🎬 VTracker</span>
        </div>
        <div className="topbar-right">
          <button className="btn-icon theme-toggle" onClick={onToggleTheme}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          {userEmail && <div className="user-avatar">{userEmail.charAt(0).toUpperCase()}</div>}
          <button className="btn-icon" onClick={onSignOut} title="Sair">⏻</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>Meus Projetos</h2>
          <div className="dashboard-actions">
            <button className="btn btn-ghost" onClick={() => setShowImportModal(true)}>📄 Importar JSON</button>
            <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>+ Novo Projeto</button>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><p>Carregando...</p></div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎬</div>
            <h3>Nenhum projeto ainda</h3>
            <p>Crie seu primeiro projeto ou importe um roteiro em JSON.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <div key={project.id} className="project-card" onClick={() => onSelectProject(project)}>
                <button className="btn-icon card-delete delete-btn" onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}>🗑</button>
                <h3>{project.name}</h3>
                <p className="desc">{project.description || 'Sem descrição'}</p>
                <div className="meta">
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Novo Projeto</h2>
            <p>Crie um projeto e escolha um template para as colunas.</p>
            <div className="form-group">
              <label>Nome do Projeto</label>
              <input className="input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Vídeo Institucional" autoFocus />
            </div>
            <div className="form-group">
              <label>Descrição (opcional)</label>
              <input className="input" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Breve descrição do projeto" />
            </div>
            <div className="form-group">
              <label>Template</label>
              <select className="input" value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                <option value="">Sem template (vazio)</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name} — {t.description}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowNewModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCreate}>Criar Projeto</button>
            </div>
          </div>
        </div>
      )}

      {/* Import JSON Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>Importar Roteiro (JSON)</h2>
            <p>Selecione um arquivo <code>.json</code> com o formato do roteiro. Cada cena vira uma coluna no Kanban.</p>
            <pre style={{ background: 'var(--bg-primary)', padding: 12, borderRadius: 8, fontSize: '0.75rem', marginBottom: 16, lineHeight: 1.5, overflow: 'auto', maxHeight: 200 }}>
{`{
  "project_name": "Nome do Projeto",
  "scenes": [
    {
      "name": "Cena 1 - Abertura",
      "script": "Texto do roteiro...",
      "notes": "Observações (opcional)"
    }
  ]
}`}
            </pre>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="input" />
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowImportModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
