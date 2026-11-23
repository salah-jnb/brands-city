import { createClient } from '@supabase/supabase-js';

// L'URL du projet et la clé "publishable" sont publiques par conception (elles sont
// visibles dans le navigateur de tout site Supabase) : la sécurité repose sur la RLS.
// Les variables d'environnement, si définies, ont priorité (autre projet, staging...).
// Ne JAMAIS mettre la clé "secret" / service_role dans le frontend.
const DEFAULT_SUPABASE_URL = 'https://gwzwtutemavnuekrldea.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_wNdWAjVxXQ8BEjecvoqBmQ_xrLWqOVj';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || DEFAULT_SUPABASE_KEY;

export const SUPABASE_URL = supabaseUrl;
export const STORAGE_BUCKET = 'shoes';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
