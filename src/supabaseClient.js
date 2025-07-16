// Singleton Supabase Client
// This ensures only one instance of the Supabase client exists across the entire application

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

// Create singleton instance
let supabaseInstance = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'supabase.auth.token', // Consistent storage key
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    
    // Debug logging for development
    if (import.meta.env.DEV) {
      console.log('Supabase client initialized:', {
        url: supabaseUrl,
        hasKey: !!supabaseKey,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return supabaseInstance;
};

// Export the singleton instance as default
export const supabase = getSupabaseClient();

// Helper functions for common operations
export const authHelpers = {
  // Get current user session
  getCurrentSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('Error getting session:', error.message);
        return { session: null, error };
      }
      return { session, error: null };
    } catch (err) {
      console.error('Exception getting session:', err);
      return { session: null, error: err };
    }
  },

  // Get user profile from users table
  getUserProfile: async (email) => {
    try {
      if (!email) {
        return { profile: null, error: new Error('Email is required') };
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          employee_type,
          campaign_id,
          pay_rate_per_hour,
          is_active,
          campaigns(
            id,
            name
          )
        `)
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (error) {
        // Handle case where user doesn't exist in users table
        if (error.code === 'PGRST116') {
          console.warn('User not found in users table:', email);
          return { 
            profile: null, 
            error: new Error('User profile not found. Please contact your administrator.') 
          };
        }
        console.warn('Error fetching user profile:', error.message);
        return { profile: null, error };
      }

      return { profile, error: null };
    } catch (err) {
      console.error('Exception fetching user profile:', err);
      return { profile: null, error: err };
    }
  },

  // Create fallback profile from auth user
  createFallbackProfile: (authUser) => {
    if (!authUser) return null;

    const emailName = authUser.email ? authUser.email.split('@')[0] : 'User';
    const displayName = authUser.user_metadata?.full_name || 
                       authUser.user_metadata?.name || 
                       emailName;

    return {
      id: authUser.id,
      full_name: displayName,
      email: authUser.email,
      employee_type: 'Standard',
      campaign_id: null,
      pay_rate_per_hour: null,
      is_active: true,
      campaigns: null
    };
  },

  // Listen for auth state changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Export default
export default supabase;

