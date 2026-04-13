import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: As variáveis de ambiente na Vercel falharam em injetar repetidas vezes.
// Como a Anon Key do Supabase é pública (safe to expose no frontend, desde que o RLS
// esteja ativado no banco), vamos hardcodar aqui para garantir que o app funcione.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rfjsqxntwbyexfbgabzn.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jsa4hkOCAFSNBc5mdsxWKQ_soxZ3LV7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
