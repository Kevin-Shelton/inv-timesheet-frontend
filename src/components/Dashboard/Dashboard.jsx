import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import HolidaySection from './HolidaySection';
import WeeklyChart from './WeeklyChart';
import ActivityRing from './ActivityRing';
import ProjectsChart from './ProjectsChart';
import WhoIsInOutPanel from './WhoIsInOutPanel';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
          // Get user profile with role and other details
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
    );
  }

  // Show error state
  if (error) {
    return (
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
    );
  }

  // Check if user is admin (for future admin panel integration)
  const isAdmin = user?.role === 'admin' || user?.role === 'administrator';

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      {/* Dashboard Header */}
      <div>
        <DashboardHeader user={user} />
      </div>

      {/* Admin Notice (if admin user) */}
      {isAdmin && (
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '8px',
          padding: '12px 16px',
          margin: '16px 24px',
          fontSize: '14px',
          color: '#92400E'
        }}>
          <strong>👑 Admin User Detected:</strong> Admin panel will be available after completing the overtime system setup.
          <br />
          <small>User: {user?.full_name} ({user?.email}) - Role: {user?.role?.toUpperCase()}</small>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div style={{ display: 'flex', gap: '24px', padding: '24px' }}>
        {/* Main Content Area */}
        <div style={{ flex: 1 }}>
          {/* Top Row: Welcome Card + Holiday Section */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <WelcomeCard user={user} />
            </div>
            <div style={{ flex: 1 }}>
              <HolidaySection user={user} />
            </div>
          </div>

          {/* Middle Row: Weekly Chart (Full Width) */}
          <div style={{ marginBottom: '24px' }}>
            <WeeklyChart user={user} />
          </div>

          {/* Bottom Row: Activity Ring + Projects Chart */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <ActivityRing user={user} />
            </div>
            <div style={{ flex: 1 }}>
              <ProjectsChart user={user} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: '300px' }}>
          <WhoIsInOutPanel user={user} />
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

