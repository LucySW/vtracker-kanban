-- ============================================================
-- VTracker v2 — Schema Completo
-- ============================================================

-- 1. PROJETOS
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COLUNAS (customizáveis por projeto)
CREATE TABLE IF NOT EXISTS columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  color TEXT,
  script_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CARDS (vídeos/gerações)
CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  position INT NOT NULL DEFAULT 0,
  
  platform TEXT,
  task_id TEXT,
  prompt TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  reference_image_url TEXT,
  status TEXT DEFAULT 'draft',
  model_name TEXT,
  aspect_ratio TEXT,
  duration TEXT,
  rotation NUMERIC,
  
  notes TEXT,
  tags TEXT[],
  raw_request JSONB,
  raw_response JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TEMPLATES DE PROJETO
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  columns_config JSONB NOT NULL DEFAULT '[]',
  is_global BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UNIQUE constraint para evitar duplicatas de task_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_cards_task_platform 
  ON cards(task_id, platform) 
  WHERE task_id IS NOT NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_columns_project ON columns(project_id);
CREATE INDEX IF NOT EXISTS idx_cards_column ON cards(column_id);
CREATE INDEX IF NOT EXISTS idx_cards_project ON cards(project_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS projects_updated ON projects;
CREATE TRIGGER projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS cards_updated ON cards;
CREATE TRIGGER cards_updated BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- RLS (Row Level Security) — cada user vê apenas seus dados
-- ============================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

-- Projects: user owns
DROP POLICY IF EXISTS "Users manage own projects" ON projects;
CREATE POLICY "Users manage own projects" ON projects FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Columns: user owns via project
DROP POLICY IF EXISTS "Users manage own columns" ON columns;
CREATE POLICY "Users manage own columns" ON columns FOR ALL TO authenticated
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Cards: user owns
DROP POLICY IF EXISTS "Users manage own cards" ON cards;
CREATE POLICY "Users manage own cards" ON cards FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Templates: global or owned
DROP POLICY IF EXISTS "Users see global templates" ON project_templates;
CREATE POLICY "Users see global templates" ON project_templates FOR SELECT TO authenticated
  USING (is_global = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own templates" ON project_templates;
CREATE POLICY "Users insert own templates" ON project_templates FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE cards;
ALTER PUBLICATION supabase_realtime ADD TABLE columns;

-- ============================================================
-- Dados iniciais: Templates padrão
-- ============================================================
INSERT INTO project_templates (name, description, columns_config, is_global) VALUES
  ('Vídeo Curta (Cenas)', 'Colunas por cena numerada', '[{"name":"Cena 1"},{"name":"Cena 2"},{"name":"Cena 3"},{"name":"Cena 4"}]', true),
  ('Treinamento (Módulos)', 'Colunas por módulo de treinamento', '[{"name":"Módulo 1 - Introdução"},{"name":"Módulo 2 - Fundamentos"},{"name":"Módulo 3 - Prática"},{"name":"Módulo 4 - Avaliação"}]', true),
  ('Comercial de TV', 'Estrutura clássica de comercial', '[{"name":"Hook (0-5s)"},{"name":"Problema (5-15s)"},{"name":"Solução (15-25s)"},{"name":"CTA (25-30s)"}]', true),
  ('Documentário', 'Estrutura narrativa longa', '[{"name":"Abertura"},{"name":"Contexto"},{"name":"Desenvolvimento"},{"name":"Clímax"},{"name":"Conclusão"}]', true),
  ('Timeline (Tempos)', 'Colunas por segmento de tempo', '[{"name":"00:00 - 00:30"},{"name":"00:30 - 01:00"},{"name":"01:00 - 01:30"},{"name":"01:30 - 02:00"}]', true),
  ('Livre', 'Projeto vazio sem colunas', '[]', true)
ON CONFLICT DO NOTHING;
