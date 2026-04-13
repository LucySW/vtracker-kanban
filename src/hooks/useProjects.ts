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
    if (!userId) return null;

    const { data: project, error } = await supabase
      .from('projects')
      .insert({ name, description, user_id: userId, template_id: templateId })
      .select()
      .single();

    if (error || !project) return null;

    // Create columns from template
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        const columns = template.columns_config.map((col: { name: string; color?: string; script_text?: string }, idx: number) => ({
          project_id: project.id,
          name: col.name,
          position: idx,
          color: col.color || null,
          script_text: col.script_text || null,
        }));
        await supabase.from('columns').insert(columns);
      }
    }

    await fetchProjects();
    return project;
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
