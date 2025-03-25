
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Default values for development (these will be overridden by environment variables if available)
const defaultSupabaseUrl = 'https://your-project-id.supabase.co';
const defaultSupabaseAnonKey = 'your-anon-key';

// Supabase client with type support - with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

// Ensure we have values before creating the client
if (!supabaseUrl || supabaseUrl === 'https://your-project-id.supabase.co') {
  console.warn('Supabase URL not configured properly. Please set VITE_SUPABASE_URL in your environment variables.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.warn('Supabase Anon Key not configured properly. Please set VITE_SUPABASE_ANON_KEY in your environment variables.');
}

// Create and export the Supabase client
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
