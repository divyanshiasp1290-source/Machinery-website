import { createClient } from '@supabase/supabase-js';

// Production / Configured project fallback (ensures immediate connectivity without requiring dev server reboot)
const FALLBACK_SUPABASE_URL = 'https://uceidpwcbozoeubawufz.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZWlkcHdjYm96b2V1YmF3dWZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NjI3MTQsImV4cCI6MjEwNTAzODcxNH0.UaCeuomS4oT9w9nEbDZq4RXVBkb7p5g1xf7Ws0kISKY';

const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '';
const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '';

export const supabaseUrl = envUrl || FALLBACK_SUPABASE_URL;
export const supabaseAnonKey = envKey || FALLBACK_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref') && 
  !supabaseAnonKey.includes('your-anon-public-key')
);

if (!isSupabaseConfigured) {
  console.info(
    '%c[FORGE 3D - Supabase Setup]%c Please add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local',
    'color: #f97316; font-weight: bold;',
    'color: inherit;'
  );
}

// Create Supabase client instance (using safe fallback values to prevent initialization crashes if keys are pending)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'forge3d_supabase_auth_token'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);
