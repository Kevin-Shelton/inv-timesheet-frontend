import React, { useEffect, useState } from "react";
import { supabase, authHelpers } from "../../supabaseClient.js";
import bestEmployeeImage from "../assets/20-BestWorker.png"; // Import from assets
import "./DashboardNamespaced.css";

export default function WelcomeCard() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Get current user session and profile
    const getCurrentUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current session
        const { session, error: sessionError } = await authHelpers.getCurrentSession();
        
        if (sessionError) {
          console.warn('Session error:', sessionError.message);
          if (mounted) {
            setError('Unable to get user session');
            setLoading(false);
          }
          return;
        }

        if (!session?.user) {
          if (mounted) {
            setUser(null);
            setUserProfile(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUser(session.user);
        }

        // Try to get user profile from database
        const { profile, error: profileError } = await authHelpers.getUserProfile(session.user.email);

        if (mounted) {
          if (profileError) {
            console.warn('Profile fetch error:', profileError.message);
            // Create fallback profile from auth user
            const fallbackProfile = authHelpers.createFallbackProfile(session.user);
            setUserProfile(fallbackProfile);
            setError(null); // Don't show error for missing profile, use fallback
          } else {
            setUserProfile(profile);
            setError(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in getCurrentUser:', err);
        if (mounted) {
          setError('Failed to load user information');
          setLoading(false);
        }
      }
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = authHelpers.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          // Refetch profile for new user
          const { profile } = await authHelpers.getUserProfile(session.user.email);
          setUserProfile(profile || authHelpers.createFallbackProfile(session.user));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Get display name (first name only)
  const getDisplayName = () => {
    if (userProfile?.full_name) {
      const firstName = userProfile.full_name.split(' ')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
    if (user?.user_metadata?.full_name) {
      const firstName = user.user_metadata.full_name.split(' ')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
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

  // Get user role display
  const getUserRole = () => {
    if (userProfile?.employee_type === 'Exempt') {
      return 'Management';
    }
    return null;
  };

  if (loading) {
    return (
      <div className="welcome-card">
        <div className="welcome-content">
          <div className="welcome-text">
            <h2>Loading...</h2>
            <p>Getting your information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="welcome-card">
        <div className="welcome-content">
          <div className="welcome-text">
            <h2>Welcome</h2>
            <p>{error}</p>
            <div className="welcome-actions">
              <button 
                className="setup-btn primary"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="welcome-card">
        <div className="welcome-content">
          <div className="welcome-text">
            <h2>Welcome</h2>
            <p>Please sign in to access your dashboard</p>
            <div className="welcome-actions">
              <button 
                className="setup-btn primary"
                onClick={() => {
                  // Redirect to login or trigger auth flow
                  console.log('Redirect to login');
                }}
              >
                Sign In
              </button>
            </div>
          </div>
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
          
          {getUserRole() && (
            <div className="user-badge">
              <span className="badge exempt">{getUserRole()}</span>
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
            src={bestEmployeeImage} 
            alt="Best Employee Award" 
            className="employee-award-image"
            onError={(e) => {
              // Hide image if it fails to load
              console.warn('Failed to load best employee image');
              e.target.style.display = 'none';
            }}
            onLoad={() => {
              console.log('Best employee image loaded successfully');
            }}
          />
        </div>
      </div>
    </div>
  );
}

