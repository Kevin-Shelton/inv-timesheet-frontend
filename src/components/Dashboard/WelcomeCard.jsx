import React, { useState, useEffect } from 'react';
import { supabase } from "../../supabaseClient.js";

const WelcomeCard = () => {
  const [user, setUser] = useState(null);
  const [authState, setAuthState] = useState('loading'); // 'loading', 'authenticated'
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);

  // Load images from assets directory
  useEffect(() => {
    const loadImages = async () => {
      try {
        // Use Vite's glob import to get all images from assets
        const imageModules = import.meta.glob('../../assets/*.{png,jpg,jpeg,gif,svg,webp}', { eager: true });
        const imageList = Object.keys(imageModules).map(path => imageModules[path].default || imageModules[path]);
        
        console.log('Loaded images:', imageList);
        setImages(imageList);
        
        // Select a random image for this session
        if (imageList.length > 0) {
          const sessionImage = getSessionImage(imageList);
          setSelectedImage(sessionImage);
          console.log('Selected image for this session:', sessionImage);
        }
      } catch (error) {
        console.error('Error loading images:', error);
        setImages([]);
      }
    };

    loadImages();
  }, []);

  // Session-based image selection (changes only on refresh/new session)
  const getSessionImage = (imageList) => {
    if (imageList.length === 0) return null;
    if (imageList.length === 1) return imageList[0];
    
    // Use a combination of timestamp and random for session-based selection
    const sessionSeed = Date.now() + Math.random();
    const index = Math.floor(sessionSeed % imageList.length);
    return imageList[index];
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 WELCOME CARD: Checking authentication...');
      
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ WELCOME CARD: Session error:', sessionError);
          setError('Session error: ' + sessionError.message);
          // Don't set auth state here - let ProtectedRoute handle redirects
          return;
        }

        if (!session || !session.user) {
          console.log('❌ WELCOME CARD: No active session found');
          // Don't set auth state here - let ProtectedRoute handle redirects
          // If we're here, ProtectedRoute should redirect us
          return;
        }

        console.log('✅ WELCOME CARD: Valid session found for user:', session.user.email);
        
        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.warn('⚠️ WELCOME CARD: Profile fetch error:', profileError);
          // Use basic user info from session if profile not found
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email,
            role: 'Standard'
          });
        } else {
          console.log('✅ WELCOME CARD: Profile loaded:', profile);
          setUser(profile);
        }
        
        setAuthState('authenticated');
        
      } catch (error) {
        console.error('❌ WELCOME CARD: Auth check error:', error);
        setError('Authentication check failed: ' + error.message);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 WELCOME CARD: Auth state changed:', event, session?.user?.email || 'no user');
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setAuthState('loading'); // Let ProtectedRoute handle the redirect
      } else if (event === 'SIGNED_IN' && session) {
        // Refresh the component when user signs in
        checkAuth();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Handle timesheet navigation
  const handleViewTimesheet = () => {
    console.log('📊 WELCOME CARD: Navigating to timesheet...');
    try {
      // Use window.location for now - update with your actual timesheet route
      window.location.href = '/timesheet';
    } catch (error) {
      console.error('❌ WELCOME CARD: Timesheet navigation error:', error);
    }
  };

  // Handle quick clock in
  const handleQuickClockIn = async () => {
    console.log('⏰ WELCOME CARD: Quick clock in...');
    try {
      // Implement your clock in logic here
      // For now, just show a message
      alert('Clock in functionality - implement with your timesheet API');
    } catch (error) {
      console.error('❌ WELCOME CARD: Clock in error:', error);
    }
  };

  // Loading state - show while checking auth
  if (authState === 'loading') {
    return (
      <div className="welcome-card">
        <div className="welcome-card-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // If we reach here and authState is not 'authenticated', 
  // it means ProtectedRoute should have redirected but didn't
  // Show a minimal loading state and let ProtectedRoute handle it
  if (authState !== 'authenticated' || !user) {
    return (
      <div className="welcome-card">
        <div className="welcome-card-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Verifying access...</p>
            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Authenticated state - Show welcome message
  return (
    <div className="welcome-card">
      <div className="welcome-card-content">
        {/* Image Section */}
        {selectedImage && (
          <div className="welcome-image-container">
            <div className="session-image">
              <img 
                src={selectedImage} 
                alt="Company Portal" 
                className="employee-award-image"
                title={`Company portal image (${images.length} available - refresh for different image)`}
              />
              {images.length > 1 && (
                <div className="image-info">
                  <div className="image-note">
                    Refresh for different image ({images.length} available)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No images fallback */}
        {!selectedImage && (
          <div className="welcome-image-container">
            <div className="no-images-placeholder">
              <div className="placeholder-icon">🏢</div>
              <p>Company Portal<br />Add images to assets folder</p>
            </div>
          </div>
        )}

        {/* Welcome Content */}
        <div className="welcome-content">
          <div className="welcome-header">
            <h2>Hello, {user?.full_name || user?.email || 'Team Member'}! 👋</h2>
            <p className="welcome-subtitle">Welcome to the Invictus Internal Portal</p>
          </div>

          {/* User Info */}
          <div className="user-info">
            <div className="user-detail">
              <span className="label">📧 Email:</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="user-detail">
              <span className="label">👔 Role:</span>
              <span className="value">{user?.role || 'Standard'}</span>
              {user?.employee_type === 'Exempt' && (
                <span className="management-badge">Management</span>
              )}
            </div>
            {user?.campaign_id && (
              <div className="user-detail">
                <span className="label">🎯 Campaign:</span>
                <span className="value">Campaign {user.campaign_id}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button 
              onClick={handleViewTimesheet}
              className="action-button primary"
            >
              📊 View Timesheet
            </button>
            <button 
              onClick={handleQuickClockIn}
              className="action-button secondary"
            >
              ⏰ Quick Clock In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;

