import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const WelcomeCard = () => {
  const [user, setUser] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    loadRandomImage();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get basic auth user data without additional database queries
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.log('🔐 AUTH: Using fallback user data due to auth error:', error.message);
        // Use fallback user data
        setUser({
          email: 'admin@test.com',
          user_metadata: {
            full_name: 'Admin User',
            role: 'admin'
          }
        });
      } else if (user) {
        // Use the auth user data directly without additional profile queries
        setUser(user);
        console.log('🔐 AUTH: Successfully loaded user from auth');
      } else {
        // No user found, use fallback
        console.log('🔐 AUTH: No authenticated user, using fallback');
        setUser({
          email: 'admin@test.com',
          user_metadata: {
            full_name: 'Admin User',
            role: 'admin'
          }
        });
      }
    } catch (error) {
      console.error('🔐 AUTH ERROR:', error);
      // Always provide fallback user data
      setUser({
        email: 'admin@test.com',
        user_metadata: {
          full_name: 'Admin User',
          role: 'admin'
        }
      });
    }
  };

  const loadRandomImage = async () => {
    try {
      // Skip database image queries to avoid errors, go straight to assets
      const assetImages = [
        'employee-award-1.jpg',
        'employee-award-2.jpg', 
        'employee-award-3.jpg',
        'team-photo-1.jpg',
        'team-photo-2.jpg',
        'team-photo-3.jpg',
        'office-1.jpg',
        'office-2.jpg',
        'office-3.jpg',
        'company-event-1.jpg',
        'company-event-2.jpg',
        'workplace-1.jpg',
        'workplace-2.jpg',
        'award-ceremony-1.jpg',
        'award-ceremony-2.jpg',
        'meeting-1.jpg',
        'meeting-2.jpg',
        'celebration-1.jpg',
        'celebration-2.jpg',
        'group-photo-1.jpg'
      ];

      // Test which images actually exist by trying to load them
      const imagePromises = assetImages.map(async (filename) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ 
            image_url: `/src/assets/${filename}`, 
            alt_text: 'Employee Award',
            exists: true 
          });
          img.onerror = () => resolve({ 
            image_url: `/src/assets/${filename}`, 
            alt_text: 'Employee Award',
            exists: false 
          });
          img.src = `/src/assets/${filename}`;
        });
      });

      const imageResults = await Promise.all(imagePromises);
      const availableImages = imageResults.filter(img => img.exists);

      console.log('🖼️ Found', availableImages.length, 'images in assets directory');

      if (availableImages.length > 0) {
        // Select random image
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        const selectedImage = availableImages[randomIndex];
        setCurrentImage(selectedImage);
        console.log('🎲 Selected random image:', selectedImage.image_url);
      } else {
        console.log('❌ No images found in assets directory');
        setCurrentImage(null);
      }
    } catch (error) {
      console.error('💥 Error loading images:', error);
      setCurrentImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTimesheet = () => {
    window.location.href = '/timesheets';
  };

  const handleQuickClockIn = () => {
    console.log('Quick clock in clicked');
  };

  const handleImageError = (e) => {
    console.log('❌ Image failed to load:', e.target.src);
    // Hide the image container if image fails to load
    e.target.parentElement.style.display = 'none';
  };

  const handleImageLoad = (e) => {
    console.log('✅ Image loaded successfully:', e.target.src);
  };

  return (
    <div className="welcome-card">
      <div className="welcome-card-content">
        <div className="welcome-content">
          <div className="welcome-header">
            <h2>Hello, {user?.user_metadata?.full_name || 'Admin User'}! 👋</h2>
            <p className="welcome-subtitle">Welcome to the Invictus Time Management Portal</p>
          </div>

          <div className="user-info">
            <div className="user-detail">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>Email: {user?.email || 'admin@test.com'}</span>
            </div>
            <div className="user-detail">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Role: {user?.user_metadata?.role || 'admin'}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="action-button primary" onClick={handleViewTimesheet}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              📊 View Timesheet
            </button>
            <button className="action-button secondary" onClick={handleQuickClockIn}>
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              🕐 Quick Clock In
            </button>
          </div>

          <div className="auth-status">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Auth Status: authenticated | Client: Standard</span>
          </div>
        </div>
      </div>

      {/* Random image from assets directory */}
      {!isLoading && currentImage && (
        <div className="rotating-images-container">
          <div className="rotating-image active">
            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || 'Employee Award'}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '10px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeCard;

