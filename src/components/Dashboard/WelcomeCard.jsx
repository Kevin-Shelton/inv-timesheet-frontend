import React from 'react';
import { Mail, User, Clock } from 'lucide-react';

const WelcomeCard = ({ user }) => {
  // Mock user data if not provided
  const userData = user || {
    name: 'Admin User',
    email: 'admin@test.com',
    role: 'Standard',
    avatar: null
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="welcome-card">
      <div className="welcome-card-content">
        {/* User Image */}
        <div className="welcome-card-image">
          {userData.avatar ? (
            <img 
              src={userData.avatar} 
              alt={`${userData.name} avatar`}
              className="welcome-card-avatar"
            />
          ) : (
            <div className="welcome-card-image-placeholder">
              <User size={48} />
            </div>
          )}
        </div>

        {/* Welcome Text Content */}
        <div className="welcome-card-text">
          {/* Header */}
          <div className="welcome-card-header">
            <h1 className="welcome-card-title">
              Hello, {userData.name}! 👋
            </h1>
            <p className="welcome-card-subtitle">
              Welcome to the Invictus Internal Portal
            </p>
          </div>

          {/* User Info */}
          <div className="welcome-card-info">
            <div className="welcome-card-info-item">
              <Mail className="welcome-card-info-icon" />
              <span>Email: {userData.email}</span>
            </div>
            <div className="welcome-card-info-item">
              <User className="welcome-card-info-icon" />
              <span>Role: {userData.role}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="welcome-card-actions">
            <button className="welcome-card-button primary">
              📊 View Timesheet
            </button>
            <button className="welcome-card-button secondary">
              🕐 Quick Clock In
            </button>
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="welcome-card-status">
        <Clock className="welcome-card-info-icon" />
        <span>Auth Status: authenticated | Client: Standard</span>
      </div>
    </div>
  );
};

export default WelcomeCard;

