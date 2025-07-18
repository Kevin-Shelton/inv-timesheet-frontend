import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const WelcomeCard = () => {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Sample images for rotation (replace with your actual image URLs)
  const sampleImages = [
    '/images/employee-award-1.jpg',
    '/images/employee-award-2.jpg',
    '/images/employee-award-3.jpg',
    '/images/team-photo-1.jpg',
    '/images/team-photo-2.jpg',
    '/images/office-1.jpg',
    '/images/office-2.jpg'
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
      // Try to fetch images from database first
      const { data: imageData, error } = await supabase
        .from('employee_images')
        .select('image_url, alt_text')
        .limit(10);

      if (error) {
        console.log('No employee images table, using sample images');
        setImages(sampleImages.map(url => ({ image_url: url, alt_text: 'Employee Award' })));
      } else if (imageData && imageData.length > 0) {
        setImages(imageData);
      } else {
        // Fallback to sample images
        setImages(sampleImages.map(url => ({ image_url: url, alt_text: 'Employee Award' })));
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      // Use sample images as fallback
      setImages(sampleImages.map(url => ({ image_url: url, alt_text: 'Employee Award' })));
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
        </div>
      </div>

      {/* Single random image in bottom right corner - No controllers */}
      {!isLoading && images.length > 0 && (
        <div className="rotating-images-container">
          <div className="rotating-image active">
            <img
              src={images[currentImageIndex]?.image_url}
              alt={images[currentImageIndex]?.alt_text || 'Employee Award'}
              onError={(e) => {
                // Hide broken images
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeCard;

