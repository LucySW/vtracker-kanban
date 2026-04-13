import { useState, useRef } from 'react';
import type { Project } from '../../lib/types';
import { useProjects } from '../../hooks/useProjects';
import { Sidebar } from '../Layout/Sidebar';
import { TopBar } from '../Layout/TopBar';

interface DashboardProps {
  userId: string;
  onSelectProject: (project: Project) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userEmail?: string;
  onSignOut: () => void;
}

export default function Dashboard({ userId, onSelectProject, userEmail, onSignOut }: DashboardProps) {
  const { projects, templates, loading, createProject, createProjectFromJson, deleteProject } = useProjects(userId);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    if (!newName.trim() || saving) return;
    setSaving(true);
    try {
      const project = await createProject(newName, newDesc, selectedTemplate || undefined);
      if (project) {
        setShowNewModal(false);
        setNewName('');
        setNewDesc('');
        setSelectedTemplate('');
        onSelectProject(project);
      }
    } catch (err) {
      console.error('[Dashboard] Error creating project:', err);
    } finally {
      setSaving(false);
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

  const getStatusColor = (index: number) => {
    const statuses = [
      { label: 'In Progress', classes: 'bg-primary/20 text-primary' },
      { label: 'Reviewing', classes: 'bg-secondary/20 text-secondary' },
      { label: 'Archived', classes: 'bg-tertiary/20 text-tertiary' },
    ];
    return statuses[index % statuses.length];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar activeView="projects" />

      <div className="flex flex-col flex-1 relative overflow-hidden">
        {/* TopBar */}
        <TopBar
          userEmail={userEmail}
          onSignOut={onSignOut}
          activeTab="projects"
        />

        {/* ===== Main Content ===== */}
        <main className="flex-1 overflow-y-auto p-8 bg-background">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-semibold tracking-tighter mb-2">Projects</h2>
                <p className="text-on-surface-variant text-lg leading-relaxed">Manage and oversee your production pipeline.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-surface-container-high text-on-surface-variant px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-surface-container-highest transition-all ghost-border"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>Import JSON</span>
                </button>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="bg-primary text-on-primary-container px-8 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg shadow-primary/10 hover:brightness-110 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined">add</span>
                  <span>Create New Project</span>
                </button>
              </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="flex flex-col items-center gap-4 text-on-surface-variant">
                  <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm font-medium">Loading projects...</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, i) => {
                  const status = getStatusColor(i);
                  return (
                    <div
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      className="group relative flex flex-col bg-surface-container-low rounded-2xl overflow-hidden ghost-border hover:bg-surface-container transition-all duration-300 cursor-pointer"
                    >
                      {/* Thumbnail area */}
                      <div className="aspect-video relative overflow-hidden bg-surface-container-high flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                        <span className="material-symbols-outlined text-5xl text-outline-variant/50 group-hover:scale-110 transition-transform duration-500">movie_filter</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-60" />
                        {/* Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                          className="absolute top-4 right-4 p-2 glass-panel rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                        {/* Status badge */}
                        <div className="absolute bottom-4 left-4">
                          <span className={`px-2 py-1 backdrop-blur-md text-[10px] font-bold rounded uppercase tracking-widest ${status.classes}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      {/* Card content */}
                      <div className="p-6">
                        <h3 className="text-xl font-medium mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">layers</span>
                            {project.description || 'Sem descrição'}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            {formatDate(project.updated_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add new project card */}
                <div
                  onClick={() => setShowNewModal(true)}
                  className="group relative flex flex-col items-center justify-center bg-transparent rounded-2xl border-2 border-dashed border-outline-variant/30 min-h-[300px] hover:border-primary/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-4 text-on-surface-variant group-hover:text-primary transition-colors">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">add</span>
                    </div>
                    <span className="font-medium">New Production</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ===== Mobile Bottom Nav ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/5 py-3 px-6 flex justify-around items-center z-50">
        <button className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="text-[10px] font-medium">Projects</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500">
          <span className="material-symbols-outlined">auto_awesome_motion</span>
          <span className="text-[10px] font-medium">Studio</span>
        </button>
        <div className="relative -top-6">
          <button
            onClick={() => setShowNewModal(true)}
            className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-xl"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        <button className="flex flex-col items-center gap-1 text-gray-500">
          <span className="material-symbols-outlined">video_library</span>
          <span className="text-[10px] font-medium">Library</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-gray-500">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>

      {/* ===== New Project Modal ===== */}
      {showNewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
          <div className="w-full max-w-lg glass-effect rounded-2xl ghost-border shadow-deep p-8 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <h2 className="text-2xl font-semibold tracking-tight mb-2">New Project</h2>
            <p className="text-on-surface-variant text-sm mb-8">Create a project and choose a template for the columns.</p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant ml-4">Project Name</label>
                <input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Institucional Video"
                  autoFocus
                  className="w-full h-12 bg-surface-container-lowest text-white px-6 rounded-full border-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant ml-4">Description (optional)</label>
                <input
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Brief project description"
                  className="w-full h-12 bg-surface-container-lowest text-white px-6 rounded-full border-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant ml-4">Template</label>
                <select
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                  className="w-full h-12 bg-surface-container-lowest text-white px-6 rounded-full border-none focus:ring-1 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
                >
                  <option value="">No template (empty)</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.description}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowNewModal(false)} disabled={saving} className="px-6 py-3 text-on-surface-variant hover:text-white rounded-full transition-colors font-medium">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="bg-primary text-on-primary-container px-8 py-3 rounded-full font-semibold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Import JSON Modal ===== */}
      {showImportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowImportModal(false)}>
          <div className="w-full max-w-lg glass-effect rounded-2xl ghost-border shadow-deep p-8 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Import Script (JSON)</h2>
            <p className="text-on-surface-variant text-sm mb-6">Select a <code className="text-primary">.json</code> file with the script format. Each scene becomes a Kanban column.</p>

            <pre className="bg-surface-container-lowest p-4 rounded-xl text-xs text-on-surface-variant leading-relaxed mb-6 overflow-auto max-h-48 ghost-border">
{`{
  "project_name": "Project Name",
  "scenes": [
    {
      "name": "Scene 1 - Opening",
      "script": "Script text...",
      "notes": "Notes (optional)"
    }
  ]
}`}
            </pre>

            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="w-full h-12 bg-surface-container-lowest text-white px-6 rounded-full border-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer" />

            <div className="flex justify-end mt-6">
              <button onClick={() => setShowImportModal(false)} className="px-6 py-3 text-on-surface-variant hover:text-white rounded-full transition-colors font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
