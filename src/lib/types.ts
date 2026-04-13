export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  template_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  project_id: string;
  name: string;
  position: number;
  color?: string;
  script_text?: string;
  created_at: string;
}

export interface Card {
  id: string;
  column_id: string;
  project_id: string;
  user_id: string;
  position: number;
  platform?: string;
  task_id?: string;
  prompt?: string;
  video_url?: string;
  thumbnail_url?: string;
  reference_image_url?: string;
  status: string;
  model_name?: string;
  aspect_ratio?: string;
  duration?: string;
  notes?: string;
  tags?: string[];
  raw_request?: Record<string, unknown>;
  raw_response?: Record<string, unknown>;
  rotation?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description?: string;
  columns_config: { name: string; color?: string; script_text?: string }[];
  is_global: boolean;
  user_id?: string;
  created_at: string;
}

export interface ImportedScene {
  name: string;
  script: string;
  notes?: string;
  duration?: string;
}

export interface ImportedProject {
  project_name: string;
  scenes: ImportedScene[];
}
