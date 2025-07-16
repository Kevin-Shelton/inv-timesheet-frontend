// BULLETPROOF SINGLETON SUPABASE CLIENT
// This prevents multiple GoTrueClient instances completely

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

// Global singleton instance
let supabaseInstance = null;
let isInitialized = false;

// Prevent multiple initialization
const initializeSupabase = () => {
  if (isInitialized && supabaseInstance) {
    console.log('♻️ SINGLETON: Returning existing Supabase instance');
    return supabaseInstance;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ SUPABASE CONFIG ERROR: Missing URL or Anon Key');
    console.log('URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
    throw new Error('Supabase configuration missing');
  }

  console.log('🚀 SINGLETON: Creating single Supabase client instance');
  
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Use a consistent storage key
        storageKey: 'sb-auth-token',
        // Prevent multiple auth instances
        persistSession: true,
        detectSessionInUrl: true,
        // Consistent auth settings
        autoRefreshToken: true,
        flowType: 'pkce'
      },
      // Consistent global settings
      global: {
        headers: {
          'X-Client-Info': 'timesheet-portal-singleton'
        }
      }
    });

    isInitialized = true;
    console.log('✅ SINGLETON: Supabase client initialized successfully');
    
    // Add auth state listener once
    supabaseInstance.auth.onAuthStateChange((event, session) => {
      console.log('🔐 SINGLETON AUTH:', event, session?.user?.email || 'no user');
    });

    return supabaseInstance;
    
  } catch (error) {
    console.error('❌ SINGLETON ERROR: Failed to create Supabase client:', error);
    throw error;
  }
};

// Export the singleton instance
export const supabase = initializeSupabase();

// Prevent any other components from creating new instances
export const createSupabaseClient = () => {
  console.warn('⚠️ SINGLETON WARNING: Use the exported "supabase" instance instead of creating new clients');
  return supabase;
};

// Helper functions that use the singleton
export const authHelpers = {
  // Get current user safely
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.log('🔐 AUTH: No current user -', error.message);
        return null;
      }
      console.log('🔐 AUTH: Current user -', user?.email);
      return user;
    } catch (err) {
      console.error('❌ AUTH ERROR:', err);
      return null;
    }
  },

  // Get current session safely
  getCurrentSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.log('🔐 SESSION: No active session -', error.message);
        return null;
      }
      console.log('🔐 SESSION:', session ? `Active for ${session.user.email}` : 'None');
      return session;
    } catch (err) {
      console.error('❌ SESSION ERROR:', err);
      return null;
    }
  },

  // Sign out safely
  signOut: async () => {
    try {
      console.log('🔐 SIGNOUT: Signing out user...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ SIGNOUT ERROR:', error);
        return false;
      }
      console.log('✅ SIGNOUT: User signed out successfully');
      return true;
    } catch (err) {
      console.error('❌ SIGNOUT ERROR:', err);
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const session = await authHelpers.getCurrentSession();
    return !!session?.user;
  }
};

// Database helpers that use the singleton
export const dbHelpers = {
  // Get user profile safely
  getUserProfile: async (userId) => {
    try {
      console.log('📊 DB: Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('📊 DB: No user profile found -', error.message);
        return null;
      }

      console.log('📊 DB: User profile loaded -', data.full_name);
      return data;
    } catch (err) {
      console.error('❌ DB ERROR:', err);
      return null;
    }
  },

  // Get user statuses safely
  getUserStatuses: async () => {
    try {
      console.log('📊 DB: Fetching user statuses...');
      const { data, error } = await supabase
        .from('current_user_status')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.log('📊 DB: Error fetching user statuses -', error.message);
        return [];
      }

      console.log('📊 DB: Fetched user statuses:', data?.length || 0, 'records');
      return data || [];
    } catch (err) {
      console.error('❌ DB ERROR:', err);
      return [];
    }
  },

  // Get holidays safely
  getHolidays: async () => {
    try {
      console.log('📊 DB: Fetching holidays...');
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.log('📊 DB: Error fetching holidays -', error.message);
        return [];
      }

      console.log('📊 DB: Fetched holidays:', data?.length || 0, 'records');
      return data || [];
    } catch (err) {
      console.error('❌ DB ERROR:', err);
      return [];
    }
  }
};

// Prevent window-level multiple instances
if (typeof window !== 'undefined') {
  if (window.__SUPABASE_SINGLETON__) {
    console.warn('⚠️ SINGLETON: Multiple singleton attempts detected');
  } else {
    window.__SUPABASE_SINGLETON__ = supabase;
    console.log('✅ SINGLETON: Registered global singleton');
  }
}

// Development debugging
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 DEV: Supabase singleton loaded');
  console.log('🔧 DEV: URL configured:', !!supabaseUrl);
  console.log('🔧 DEV: Key configured:', !!supabaseAnonKey);
}

// Export default for convenience
export default supabase;

