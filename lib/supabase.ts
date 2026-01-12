
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Check .env file.');
}

// Create client with optimized settings
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Persist session in localStorage
        persistSession: true,
        // Auto refresh tokens before expiry
        autoRefreshToken: true,
        // Detect session from URL (for OAuth redirects)
        detectSessionInUrl: true,
        // Storage key for session
        storageKey: 'ck_auth_session',
    },
    // Global fetch options
    global: {
        headers: {
            'x-client-info': 'costkitchen-admin',
        },
    },
});

// Helper to check if session is valid
export const isAuthenticated = async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
};

// Helper to get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
    // Try session first (local/fast)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;

    // Fallback to getUser (network/safe)
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
};
