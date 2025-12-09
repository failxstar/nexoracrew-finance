import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// ⚠️ ACTION REQUIRED: PASTE YOUR SUPABASE CREDENTIALS HERE
// ------------------------------------------------------------------

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Helper to check if properly configured
export const isSupabaseConfigured = () => {
    return SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0 && !SUPABASE_URL.includes('YOUR_PROJECT_ID');
};

// Create client with Realtime enabled
export const supabase = createClient(SUPABASE_URL || 'https://placeholder.supabase.co', SUPABASE_KEY || 'placeholder', {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
});