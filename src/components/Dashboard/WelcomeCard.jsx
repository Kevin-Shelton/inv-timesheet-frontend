import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const WelcomeCard = () => {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  // Sample images for rotation - Multiple path formats to test
  const sampleImages = [
    // Try different path formats
    './src/assets/employee-award-1.jpg',
    './src/assets/employee-award-2.jpg',
    '/src/assets/employee-award-1.jpg',
    '/src/assets/employee-award-2.jpg',
    'src/assets/employee-award-1.jpg',
    'src/assets/employee-award-2.jpg',
    // Also try some common fallback images
    'https://via.placeholder.com/120x120/667eea/ffffff?text=Award+1',
    'https://via.placeholder.com/120x120/764ba2/ffffff?text=Award+2',
    'https://via.placeholder.com/120x120/4f46e5/ffffff?text=Team+1',
    'https://via.placeholder.com/120x120/7c3aed/ffffff?text=Office+1'
  ];

  useEffect(() => {
    fetchUserData();
    fetchImages();
  }, []);

  // Set random image on component mount (session refresh)
  useEffect(() => {
    if (images.length > 0) {
      const randomIndex = Math.floor(Math.random() * images.length);
      setCurrentImageIndex(randomIndex);
      setDebugInfo(`Selected image ${randomIndex}: ${images[randomIndex]?.image_url}`);
      console.log('🖼️ WELCOME CARD DEBUG:', {
        totalImages: images.length,
        selectedIndex: randomIndex,
        selectedImage: images[randomIndex]?.image_url,
        allImages: images
      });
    }
  }, [images]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchImages = async () => {
    try {
      console.log('🔍 Attempting to fetch images from database...');
      
      // Try to fetch images from database first
      const { data: imageData, error } = await supabase
        .from('employee_images')
        .select('image_url, alt_text')
        .limit(10);

      if (error) {
        console.log('❌ Database error, using sample images:', error.message);
        setDebugInfo('Database unavailable, using sample images');
        setImages(sampleImages.map(url => ({ image_url: url, alt_text: 'Sample Image' })));
      } else if (imageData && imageData.length > 0) {
        console.log('✅ Found database images:', imageData);
        setDebugInfo(`Found ${imageData.length} database images`);
        setImages(imageData);
      } else {
        console.log('📁 No database images found, using sample images');
        setDebugInfo('No database images, using sample images');
        setImages(sampleImages.map(url => ({ image_url: url, alt_text: 'Sample Image' })));
      }
    } catch (error) {
      console.error('💥 Error fetching images:', error);
      setDebugInfo(`Error: ${error.message}`);
      // Use sample images as fallback
      setImages(sampleImages.map(url => ({ image_url: url, alt_text: 'Sample Image' })));
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTimesheet = () => {
    // Navigate to timesheet page
    window.location.href = '/timesheets';
  };

  const handleQuickClockIn = () => {
    // Handle quick clock in
    console.log('Quick clock in clicked');
  };

  const handleImageLoad = (e) => {
    console.log('✅ Image loaded successfully:', e.target.src);
  };

  const handleImageError = (e) => {
    console.log('❌ Image failed to load:', e.target.src);
    setDebugInfo(`Image failed: ${e.target.src}`);
    // Try to show a different image or hide this one
    e.target.style.display = 'none';
  };

  return (
    <div className="welcome-card">
      <div className="welcome-card-content">
        {/* Welcome content - No user avatar */}
        <div className="welcome-content">
          <div className="welcome-header">
            <h2>Hello, {user?.user_metadata?.full_name || 'Admin User'}! 👋</h2>
            <p className="welcome-subtitle">Welcome to the Invictus Internal Portal</p>
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
              <span>Role: {user?.user_metadata?.role || 'Standard'}</span>
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

          {/* Debug information */}
          <div style={{ 
            marginTop: '8px', 
            fontSize: '10px', 
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'monospace'
          }}>
            Debug: {debugInfo}
          </div>
        </div>
      </div>

      {/* Image container with debug info */}
      <div className="rotating-images-container" style={{
        border: '2px solid rgba(255,255,255,0.5)', // Make container more visible for debugging
        background: 'rgba(255,255,255,0.2)' // More visible background
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'white',
            fontSize: '12px'
          }}>
            Loading...
          </div>
        ) : images.length > 0 ? (
          <div className="rotating-image active">
            <img
              src={images[currentImageIndex]?.image_url}
              alt={images[currentImageIndex]?.alt_text || 'Sample Image'}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '10px'
              }}
            />
            {/* Debug overlay */}
            <div style={{
              position: 'absolute',
              bottom: '2px',
              left: '2px',
              right: '2px',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              fontSize: '8px',
              padding: '2px',
              borderRadius: '2px',
              wordBreak: 'break-all'
            }}>
              {images[currentImageIndex]?.image_url?.substring(0, 30)}...
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'white',
            fontSize: '12px',
            textAlign: 'center'
          }}>
            No Images
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeCard;

