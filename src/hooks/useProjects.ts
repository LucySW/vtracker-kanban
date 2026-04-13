import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Project, ProjectTemplate } from '../lib/types';

export function useProjects(userId?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (!error && data) setProjects(data);
    setLoading(false);
  }, [userId]);

  const fetchTemplates = useCallback(async () => {
    const { data } = await supabase
      .from('project_templates')
      .select('*')
      .or(`is_global.eq.true,user_id.eq.${userId}`);

    if (data) setTemplates(data);
  }, [userId]);

  useEffect(() => {
    fetchProjects();
    fetchTemplates();
  }, [fetchProjects, fetchTemplates]);

  const createProject = async (name: string, description: string, templateId?: string) => {
    if (!userId) {
      console.error('[useProjects] createProject called without userId!');
      return null;
    }

    try {
      console.log(`[useProjects] Creating project: ${name}, template: ${templateId}`);
      // Remove template_id from insert if it's undefined to avoid uuid casting errors
      const projectData: any = { name, description, user_id: userId };
      if (templateId) projectData.template_id = templateId;

      const { data: project, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error('[useProjects] Supabase insertion error:', error);
        alert('Erro ao criar projeto: ' + error.message);
        return null;
      }
      if (!project) {
        console.error('[useProjects] Supabase returned no project data');
        return null;
      }

      console.log('[useProjects] Project created successfully! ID:', project.id);

      // Create columns from template
      if (templateId) {
        console.log('[useProjects] Applying template columns...');
        const template = templates.find(t => t.id === templateId);
        if (template) {
          const columns = template.columns_config.map((col: { name: string; color?: string; script_text?: string }, idx: number) => ({
            project_id: project.id,
            name: col.name,
            position: idx,
            color: col.color || null,
            script_text: col.script_text || null,
          }));
          const { error: colErr } = await supabase.from('columns').insert(columns);
          if (colErr) console.error('[useProjects] Error inserting columns:', colErr);
        } else {
          console.warn('[useProjects] Selected template not found in state:', templateId);
        }
      }

      await fetchProjects();
      return project;
    } catch (err: any) {
      console.error('[useProjects] Unhandled exception in createProject:', err);
      alert('Erro inesperado de rede/conexão: ' + err.message);
      return null;
    }
  };

  const createProjectFromJson = async (jsonData: { project_name: string; scenes: { name: string; script: string; notes?: string }[] }) => {
    if (!userId) return null;

    const { data: project, error } = await supabase
      .from('projects')
      .insert({ name: jsonData.project_name, user_id: userId, description: 'Importado via JSON' })
      .select()
      .single();

    if (error || !project) return null;

    const columns = jsonData.scenes.map((scene, idx) => ({
      project_id: project.id,
      name: scene.name,
      position: idx,
      script_text: scene.script,
    }));

    await supabase.from('columns').insert(columns);
    await fetchProjects();
    return project;
  };

  const deleteProject = async (projectId: string) => {
    await supabase.from('projects').delete().eq('id', projectId);
    await fetchProjects();
  };

  return { projects, templates, loading, createProject, createProjectFromJson, deleteProject, refetch: fetchProjects };
}
