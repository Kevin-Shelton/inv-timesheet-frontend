import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import ActivityRing from './ActivityRing';
import ProjectsChart from './ProjectsChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  // Load user data and profile
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Get authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          throw authError;
        }

        if (authUser) {
          // Get user profile with role and other details_
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select(`
              id,
              full_name,
              email,
              role,
              employment_type,
              is_exempt,
              pay_type,
              status,
              department,
              job_title,
              hire_date
            `)
            .eq('id', authUser.id)
            .single();

          if (profileError) {
            console.error('Error loading user profile:', profileError);
            // Set basic user data if profile fetch fails
            setUser({
              id: authUser.id,
              email: authUser.email,
              full_name: authUser.user_metadata?.full_name || 'User',
              role: 'employee' // Default role
            });
          } else {
            setUser({
              ...authUser,
              ...profile
            });
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'SIGNED_IN' && session?.user) {
          loadUserData();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          backgroundColor: '#F9FAFB'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #FB923C',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="dashboard-container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          backgroundColor: '#FEF2F2'
        }}>
          <div style={{ textAlign: 'center', color: '#DC2626' }}>
            <h3>Error Loading Dashboard</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#DC2626',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'administrator';

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <DashboardHeader user={user} />
      </div>

      {/* Tab Navigation (if admin) */}
      {isAdmin && (
        <div className="dashboard-tabs" style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'flex',
            gap: '32px'
          }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '16px 0',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === 'overview' ? '#FB923C' : '#6B7280',
                borderBottom: activeTab === 'overview' ? '2px solid #FB923C' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                padding: '16px 0',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === 'admin' ? '#FB923C' : '#6B7280',
                borderBottom: activeTab === 'admin' ? '2px solid #FB923C' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              Admin Panel
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* Overview Tab (Default) */}
        {(!isAdmin || activeTab === 'overview') && (
          <>
            {/* Main Content Area */}
            <div className="dashboard-main">
              {/* Top Row: Welcome Card + Holiday Section */}
              <div className="dashboard-row">
                <div className="dashboard-col welcome">
                  <WelcomeCard user={user} />
                </div>
                <div className="dashboard-col holidays">
                  <HolidaySection user={user} />
                </div>
              </div>

              {/* Middle Row: Weekly Chart (Full Width) */}
              <div className="dashboard-row">
                <div className="dashboard-col wide">
                  <WeeklyChart user={user} />
                </div>
              </div>

              {/* Bottom Row: Activity Ring + Projects Chart */}
              <div className="dashboard-row">
                <div className="dashboard-col activity">
                  <ActivityRing user={user} />
                </div>
                <div className="dashboard-col activity">
                  <ProjectsChart user={user} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="dashboard-sidebar">
              <WhoIsInOutPanel user={user} />
            </div>
          </>
        )}

        {/* Admin Tab (Admin Only) */}
        {isAdmin && activeTab === 'admin' && (
          <div className="admin-content" style={{
            width: '100%',
            padding: '24px',
            backgroundColor: '#F9FAFB',
            minHeight: 'calc(100vh - 200px)'
          }}>
            {/* Admin Header */}
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <h1 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827'
              }}>
                Administrative Panel
              </h1>
              <p style={{
                margin: 0,
                color: '#6B7280',
                fontSize: '14px'
              }}>
                Manage overtime settings, employee types, and system configuration
              </p>
              
              {/* Admin User Info */}
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                backgroundColor: '#FEF3C7',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#92400E'
              }}>
                👑 Logged in as: {user?.full_name} ({user?.email}) - {user?.role?.toUpperCase()}
              </div>
            </div>


          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .dashboard-tabs button:hover {
          color: #FB923C !important;
        }
        
        .admin-content {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

