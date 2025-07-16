import React, { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';
import "./DashboardNamespaced.css";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function WelcomeCard() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user session
    const getCurrentUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          
          // Get user profile from users table
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('full_name, employee_type, campaign_id, campaigns(name)')
            .eq('email', session.user.email)
            .single();

          if (profileError) {
            console.warn('Could not fetch user profile:', profileError);
            // Use email as fallback
            setUserProfile({ 
              full_name: session.user.email.split('@')[0],
              employee_type: 'Standard'
            });
          } else {
            setUserProfile(profile);
          }
        }
      } catch (err) {
        console.error('Error in getCurrentUser:', err);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          getCurrentUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Get display name
  const getDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ')[0]; // First name only
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Get organization name
  const getOrganization = () => {
    if (userProfile?.campaigns?.name) {
      return userProfile.campaigns.name;
    }
    return 'Your Organization';
  };

  if (loading) {
    return (
      <div className="welcome-card">
        <div className="welcome-content">
          <h2>Loading...</h2>
          <p>Getting your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-card">
      <div className="welcome-content">
        <div className="welcome-text">
          <h2>Hello {getDisplayName()}</h2>
          <p>Here's what's happening at {getOrganization()}</p>
          
          {userProfile?.employee_type === 'Exempt' && (
            <div className="user-badge">
              <span className="badge exempt">Management</span>
            </div>
          )}
          
          <div className="welcome-actions">
            <button className="setup-btn primary">
              View Dashboard
            </button>
            <button className="dismiss-btn secondary">
              Quick Actions
            </button>
          </div>
        </div>
        
        <div className="welcome-image">
          <img 
            src="/best-employee.png" 
            alt="Best Employee Award" 
            className="employee-award-image"
          />
        </div>
      </div>
    </div>
  );
}

