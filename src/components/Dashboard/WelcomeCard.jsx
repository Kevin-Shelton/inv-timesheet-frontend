import React, { useEffect, useState } from 'react';
import { supabase, authHelpers } from "../../supabaseClient.js";

// Auto-import all images from assets directory
// This uses Vite's glob import feature to dynamically load all images
const importImages = () => {
  const images = import.meta.glob('../../assets/*.{png,jpg,jpeg,gif,svg,webp}', { 
    eager: true,
    as: 'url'
  });
  
  return Object.values(images);
};

const WelcomeCard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Load images on component mount
  useEffect(() => {
    try {
      const loadedImages = importImages();
      console.log('Loaded images:', loadedImages);
      setImages(loadedImages);
    } catch (err) {
      console.error('Error loading images:', err);
      setImages([]); // Fallback to empty array
    }
  }, []);

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    if (images.length <= 1) return; // Don't rotate if only one or no images

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % images.length
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user from Supabase Auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('Auth error:', authError);
          setError('Authentication failed');
          return;
        }

        if (!authUser) {
          setError('No user logged in');
          return;
        }

        setUser(authUser);

        // Try to get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError);
          // Continue with auth user data as fallback
        }

        if (profile) {
          setUserProfile(profile);
        } else {
          // Create fallback profile from auth data
          const fallbackProfile = {
            id: authUser.id,
            full_name: authUser.user_metadata?.full_name || 
                      authUser.user_metadata?.name || 
                      authUser.email?.split('@')[0] || 
                      'User',
            email: authUser.email,
            employee_type: 'Standard',
            organization_name: 'Your Organization'
          };
          setUserProfile(fallbackProfile);
        }

      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
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
    return 'User';
  };

  const getOrganization = () => {
    return userProfile?.organization_name || 
           userProfile?.campaign_id || 
           'Your Organization';
  };

  const isExemptEmployee = () => {
    return userProfile?.employee_type === 'Exempt' || 
           userProfile?.employee_type === 'Salaried';
  };

  if (loading) {
    return (
      <div className="welcome-card">
        <div className="welcome-content">
          <div className="welcome-text">
            <div className="loading-spinner">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p>Loading your profile...</p>
            </div>
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
            <h2>Hello!</h2>
            <p>Welcome to your timesheet dashboard</p>
            <div className="error-message">
              <p>⚠️ {error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="setup-btn primary"
              >
                Retry
              </button>
            </div>
          </div>
          {images.length > 0 && (
            <div className="welcome-image">
              <div className="image-carousel">
                <img 
                  src={images[currentImageIndex]} 
                  alt="Welcome illustration" 
                  className="employee-award-image"
                  onError={(e) => {
                    console.error('Image failed to load:', images[currentImageIndex]);
                    e.target.style.display = 'none';
                  }}
                />
                {images.length > 1 && (
                  <div className="image-indicators">
                    {images.map((_, index) => (
                      <div 
                        key={index}
                        className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-card">
      <div className="welcome-content">
        <div className="welcome-text">
          <h2>Hello {getFirstName()}</h2>
          <p>Here's what's happening at {getOrganization()}</p>
          
          {isExemptEmployee() && (
            <div className="user-badge">
              <span className="badge exempt">Management</span>
            </div>
          )}

          <div className="welcome-actions">
            <button className="setup-btn primary">
              View Timesheet
            </button>
            <button className="dismiss-btn secondary">
              Quick Clock In
            </button>
          </div>
        </div>

        {images.length > 0 && (
          <div className="welcome-image">
            <div className="image-carousel">
              <img 
                src={images[currentImageIndex]} 
                alt={`Welcome illustration ${currentImageIndex + 1}`}
                className="employee-award-image"
                onError={(e) => {
                  console.error('Image failed to load:', images[currentImageIndex]);
                  e.target.style.display = 'none';
                }}
              />
              {images.length > 1 && (
                <div className="image-indicators">
                  {images.map((_, index) => (
                    <div 
                      key={index}
                      className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
              <div className="image-counter">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
          </div>
        )}

        {images.length === 0 && (
          <div className="welcome-image">
            <div className="no-images-placeholder">
              <div className="placeholder-icon">🎨</div>
              <p>Add images to src/assets/ to see them here!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeCard;

