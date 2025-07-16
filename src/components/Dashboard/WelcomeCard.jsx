import React, { useEffect, useState } from 'react';
import { supabase, authHelpers } from "../../supabaseClient.js";

// Auto-import all images from assets directory
const importImages = () => {
  try {
    const images = import.meta.glob('../../assets/*.{png,jpg,jpeg,gif,svg,webp}', { 
      eager: true,
      as: 'url'
    });
    return Object.values(images);
  } catch (error) {
    console.log('No images found in assets directory');
    return [];
  }
};

// Get a random image for this session
const getSessionImage = (images) => {
  if (images.length === 0) return null;
  if (images.length === 1) return images[0];
  
  // Use a combination of timestamp and random for session-based selection
  const sessionSeed = Date.now() + Math.random();
  const index = Math.floor(sessionSeed % images.length);
  return images[index];
};

const WelcomeCard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authState, setAuthState] = useState('checking'); // 'checking', 'authenticated', 'unauthorized'
  const [images, setImages] = useState([]);
  const [sessionImage, setSessionImage] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  // Load images and select one for this session
  useEffect(() => {
    const loadedImages = importImages();
    console.log('Loaded images:', loadedImages);
    setImages(loadedImages);
    
    // Select a random image for this session
    const selectedImage = getSessionImage(loadedImages);
    setSessionImage(selectedImage);
    
    if (selectedImage) {
      console.log('Selected image for this session:', selectedImage);
    }
  }, []);

  // Authentication guard - redirect unauthorized users
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        setLoading(true);
        
        // Check if there's a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session || !session.user) {
          console.log('No valid session found - redirecting to login');
          setAuthState('unauthorized');
          
          // Redirect to login page after a brief delay
          setTimeout(() => {
            setRedirecting(true);
            // Replace with your actual login page URL
            window.location.href = '/login';
            // Alternative: If you're using React Router
            // navigate('/login');
          }, 2000);
          
          setLoading(false);
          return;
        }

        // Valid session found
        const authUser = session.user;
        setUser(authUser);
        setAuthState('authenticated');

        // Get user profile from database
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profile) {
            setUserProfile(profile);
          } else {
            // Create fallback profile from auth data
            const fallbackProfile = {
              id: authUser.id,
              full_name: authUser.user_metadata?.full_name || 
                        authUser.user_metadata?.name || 
                        authUser.email?.split('@')[0] || 
                        'Employee',
              email: authUser.email,
              employee_type: 'Standard',
              organization_name: 'Company'
            };
            setUserProfile(fallbackProfile);
          }
        } catch (profileErr) {
          console.log('Profile fetch error:', profileErr);
          // Continue with basic auth user data
        }

      } catch (err) {
        console.error('Authentication check failed:', err);
        setAuthState('unauthorized');
        
        // Redirect on error
        setTimeout(() => {
          setRedirecting(true);
          window.location.href = '/login';
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndRedirect();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out - redirecting to login');
          setUser(null);
          setUserProfile(null);
          setAuthState('unauthorized');
          
          // Immediate redirect on sign out
          window.location.href = '/login';
        } else if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setAuthState('authenticated');
          // Refresh to load user profile and get new session image
          window.location.reload();
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const getFirstName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ')[0];
    }
    if (user?.user_metadata?.name) {
      return user.user_metadata.name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Employee';
  };

  const getOrganization = () => {
    return userProfile?.organization_name || 
           userProfile?.campaign_id || 
           'Company Portal';
  };

  const isExemptEmployee = () => {
    return userProfile?.employee_type === 'Exempt' || 
           userProfile?.employee_type === 'Salaried';
  };

  const handleViewTimesheet = () => {
    // Navigate to timesheet page
    // Replace with your actual timesheet route
    console.log('Navigate to timesheet');
    // window.location.href = '/timesheet';
    // Or if using React Router: navigate('/timesheet');
  };

  const handleQuickClockIn = async () => {
    try {
      // Implement quick clock in functionality
      console.log('Quick clock in for user:', user?.id);
      
      // Example API call to clock in
      // const { data, error } = await supabase
      //   .from('timesheet_entries')
      //   .insert({
      //     user_id: user.id,
      //     clock_in_time: new Date().toISOString(),
      //     date: new Date().toISOString().split('T')[0]
      //   });
      
      alert('Clock in functionality - implement your logic here');
    } catch (error) {
      console.error('Clock in error:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="welcome-card">
        <div className="welcome-content">
          <div className="welcome-text">
            <div className="loading-spinner">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p>Verifying access...</p>
            </div>
          </div>
          {sessionImage && (
            <div className="welcome-image">
              <div className="session-image">
                <img 
                  src={sessionImage} 
                  alt="Company illustration" 
                  className="employee-award-image"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Unauthorized state - show access denied and redirect
  if (authState === 'unauthorized') {
    return (
      <div className="welcome-card unauthorized">
        <div className="welcome-content">
          <div className="welcome-text">
            <div className="access-denied">
              <div className="access-denied-icon">🔒</div>
              <h2>Access Restricted</h2>
              <p>This is an internal company portal. Please log in to continue.</p>
              
              {redirecting ? (
                <div className="redirecting-message">
                  <div className="loading-spinner">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p>Redirecting to login...</p>
                  </div>
                </div>
              ) : (
                <div className="redirect-countdown">
                  <p>Redirecting to login page...</p>
                </div>
              )}
            </div>
          </div>
          
          {sessionImage && (
            <div className="welcome-image">
              <div className="session-image">
                <img 
                  src={sessionImage} 
                  alt="Company illustration" 
                  className="employee-award-image"
                  style={{ opacity: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Authenticated state - normal welcome card
  return (
    <div className="welcome-card authenticated">
      <div className="welcome-content">
        <div className="welcome-text">
          <h2>Hello {getFirstName()}</h2>
          <p>Welcome to {getOrganization()}</p>
          
          {isExemptEmployee() && (
            <div className="user-badge">
              <span className="badge exempt">Management</span>
            </div>
          )}

          <div className="employee-info">
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
            {userProfile?.employee_type && (
              <div className="info-item">
                <span className="info-label">Role:</span>
                <span className="info-value">{userProfile.employee_type}</span>
              </div>
            )}
          </div>

          <div className="welcome-actions">
            <button 
              className="setup-btn primary"
              onClick={handleViewTimesheet}
            >
              View Timesheet
            </button>
            <button 
              className="dismiss-btn secondary"
              onClick={handleQuickClockIn}
            >
              Quick Clock In
            </button>
          </div>
        </div>

        {sessionImage ? (
          <div className="welcome-image">
            <div className="session-image">
              <img 
                src={sessionImage} 
                alt="Company illustration"
                className="employee-award-image"
                onError={(e) => {
                  console.error('Image failed to load:', sessionImage);
                  e.target.style.display = 'none';
                }}
              />
              {images.length > 1 && (
                <div className="image-info">
                  <span className="image-note">
                    Refresh for different image ({images.length} available)
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="welcome-image">
            <div className="no-images-placeholder">
              <div className="placeholder-icon">🏢</div>
              <p>Company Portal</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeCard;

