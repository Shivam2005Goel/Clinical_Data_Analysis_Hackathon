import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY || '';

export const supabase = supabaseUrl && supabaseKey && supabaseUrl !== 'YOUR_SUPABASE_PROJECT_URL_HERE'
  ? createClient(supabaseUrl, supabaseKey)
  : null;