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
  const [authState, setAuthState] = useState('checking'); // 'checking', 'authenticated', 'guest'
  const [images, setImages] = useState([]);
  const [sessionImage, setSessionImage] = useState(null);
  const [authError, setAuthError] = useState(null);

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

  // FIXED: Authentication check without infinite loops
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setAuthError(null);
        
        console.log('Checking authentication...');
        
        // Check if there's a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.log('Session error:', sessionError.message);
          setAuthError(`Session error: ${sessionError.message}`);
          setAuthState('guest');
          setLoading(false);
          return;
        }

        if (!session || !session.user) {
          console.log('No active session found');
          setAuthState('guest');
          setLoading(false);
          return;
        }

        // Valid session found
        console.log('Valid session found for user:', session.user.email);
        const authUser = session.user;
        setUser(authUser);
        setAuthState('authenticated');

        // Try to get user profile from database
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profile) {
            console.log('User profile loaded:', profile.full_name);
            setUserProfile(profile);
          } else {
            console.log('No profile found, creating fallback');
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
          setAuthError(`Profile error: ${profileErr.message}`);
          // Continue with basic auth user data
        }

      } catch (err) {
        console.error('Authentication check failed:', err);
        setAuthError(`Auth check failed: ${err.message}`);
        setAuthState('guest');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // FIXED: Listen for auth state changes WITHOUT automatic redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out');
          setUser(null);
          setUserProfile(null);
          setAuthState('guest');
          // REMOVED: Automatic redirect that was causing loops
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.email);
          setUser(session.user);
          setAuthState('authenticated');
          // REMOVED: window.location.reload() that was causing loops
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
    console.log('Navigate to timesheet');
    // window.location.href = '/timesheet';
    alert('Timesheet navigation - implement your routing here');
  };

  const handleQuickClockIn = async () => {
    try {
      console.log('Quick clock in for user:', user?.id);
      alert('Clock in functionality - implement your logic here');
    } catch (error) {
      console.error('Clock in error:', error);
    }
  };

  const handleLogin = () => {
    // SAFE: Manual login trigger without automatic redirects
    console.log('Manual login requested');
    alert('Please implement your login flow here - no automatic redirects');
    // window.location.href = '/login'; // Only when user clicks
  };

  // Loading state
  if (loading) {
    return (
      <div className="welcome-card">
        <div className="welcome-content">
          <div className="welcome-text">
            <div className="loading-spinner">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p>Loading dashboard...</p>
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

  // FIXED: Guest state without automatic redirects
  if (authState === 'guest') {
    return (
      <div className="welcome-card guest">
        <div className="welcome-content">
          <div className="welcome-text">
            <h2>Authentication Required</h2>
            <p>Please log in to access the company portal</p>
            
            {authError && (
              <div className="error-details">
                <p><strong>Debug Info:</strong> {authError}</p>
              </div>
            )}
            
            <div className="auth-actions">
              <button 
                className="setup-btn primary"
                onClick={handleLogin}
              >
                Go to Login
              </button>
              <button 
                className="dismiss-btn secondary"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>

          {sessionImage && (
            <div className="welcome-image">
              <div className="session-image">
                <img 
                  src={sessionImage} 
                  alt="Company illustration" 
                  className="employee-award-image"
                  style={{ opacity: 0.7 }}
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

