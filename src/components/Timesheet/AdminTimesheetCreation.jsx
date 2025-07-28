import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const AdminTimesheetCreation = ({ onClose, onSuccess }) => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    targetUserId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 1,
    activityId: '',
    projectId: '',
    campaignId: '',
    description: '',
    location: 'office'
  });

  // Dropdown data
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    if (isAdmin()) {
      fetchDropdownData();
    }
  }, []);

  const fetchDropdownData = async () => {
    try {
      console.log('📝 ADMIN TIMESHEET: Fetching dropdown data...');

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, email, department, role')
        .eq('is_active', true)
        .order('full_name');

      if (usersError) throw usersError;

      // Fetch activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activities')
        .select('id, name, description')
        .eq('is_active', true)
        .order('name');

      if (activitiesError) throw activitiesError;

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, description, status')
        .in('status', ['active', 'in_progress'])
        .order('name');

      if (projectsError) throw projectsError;

      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, description, status')
        .in('status', ['active', 'in_progress'])
        .order('name');

      if (campaignsError) throw campaignsError;

      setUsers(usersData || []);
      setActivities(activitiesData || []);
      setProjects(projectsData || []);
      setCampaigns(campaignsData || []);

      console.log('📝 ADMIN TIMESHEET: Loaded data:', {
        users: usersData?.length,
        activities: activitiesData?.length,
        projects: projectsData?.length,
        campaigns: campaignsData?.length
      });

    } catch (error) {
      console.error('📝 ADMIN TIMESHEET ERROR:', error);
      setError(`Failed to load form data: ${error.message}`);
    }
  };

  const calculateHours = () => {
    if (!formData.startTime || !formData.endTime) return 0;
    
    const start = new Date(`2000-01-01T${formData.startTime}:00`);
    const end = new Date(`2000-01-01T${formData.endTime}:00`);
    
    if (end <= start) return 0;
    
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    const breakHours = parseFloat(formData.breakDuration) || 0;
    
    return Math.max(0, diffHours - breakHours);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin()) {
      setError('Only administrators can create timesheets for other users.');
      return;
    }

    if (!formData.targetUserId) {
      setError('Please select a user.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const workedHours = calculateHours();
      
      if (workedHours <= 0) {
        setError('Invalid time range. End time must be after start time.');
        return;
      }

      console.log('📝 ADMIN TIMESHEET: Creating timesheet entry...');

      // Create the timesheet entry
      const timesheetEntry = {
        user_id: formData.targetUserId,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        hours_worked: workedHours,
        break_duration: parseFloat(formData.breakDuration) || 0,
        activity_id: formData.activityId || null,
        project_id: formData.projectId || null,
        campaign_id: formData.campaignId || null,
        description: formData.description || null,
        location: formData.location,
        status: 'pending', // Admin-created entries still need approval
        created_by_admin: true,
        admin_user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newEntry, error: insertError } = await supabase
        .from('timesheet_entries')
        .insert([timesheetEntry])
        .select()
        .single();

      if (insertError) throw insertError;

      console.log('📝 ADMIN TIMESHEET: Entry created:', newEntry.id);

      // Log the admin action for audit trail
      await logAdminAction({
        action: 'create_timesheet',
        target_user_id: formData.targetUserId,
        timesheet_entry_id: newEntry.id,
        details: {
          date: formData.date,
          hours: workedHours,
          activity_id: formData.activityId,
          project_id: formData.projectId,
          campaign_id: formData.campaignId
        }
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess && onSuccess(newEntry);
        onClose && onClose();
      }, 2000);

    } catch (error) {
      console.error('📝 ADMIN TIMESHEET ERROR:', error);
      setError(`Failed to create timesheet: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const logAdminAction = async (actionData) => {
    try {
      const auditEntry = {
        admin_user_id: user.id,
        action: actionData.action,
        target_user_id: actionData.target_user_id,
        timesheet_entry_id: actionData.timesheet_entry_id,
        details: actionData.details,
        timestamp: new Date().toISOString()
      };

      const { error: auditError } = await supabase
        .from('admin_audit_log')
        .insert([auditEntry]);

      if (auditError) {
        console.error('📝 AUDIT LOG ERROR:', auditError);
        // Don't fail the main operation if audit logging fails
      } else {
        console.log('📝 AUDIT LOG: Action logged successfully');
      }
    } catch (error) {
      console.error('📝 AUDIT LOG ERROR:', error);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="admin-timesheet-creation">
        <div className="access-denied">
          <h3>Access Denied</h3>
          <p>Only administrators can create timesheets for other users.</p>
          <button onClick={onClose} className="close-button">Close</button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="admin-timesheet-creation">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h3>Timesheet Created Successfully</h3>
          <p>The timesheet entry has been created and is pending approval.</p>
          <div className="success-details">
            <p><strong>Hours:</strong> {calculateHours().toFixed(2)}h</p>
            <p><strong>Date:</strong> {formData.date}</p>
            <p><strong>Status:</strong> Pending Approval</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-timesheet-creation">
      <div className="form-header">
        <h3>Create Timesheet for User</h3>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="timesheet-form">
        {/* User Selection */}
        <div className="form-group">
          <label htmlFor="targetUserId">Select User *</label>
          <select
            id="targetUserId"
            name="targetUserId"
            value={formData.targetUserId}
            onChange={handleInputChange}
            required
            className="form-select"
          >
            <option value="">Choose a user...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.email}) - {user.department}
              </option>
            ))}
          </select>
        </div>

        {/* Date and Time */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="startTime">Start Time *</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="endTime">End Time *</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
        </div>

        {/* Break Duration and Calculated Hours */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="breakDuration">Break Duration (hours)</label>
            <input
              type="number"
              id="breakDuration"
              name="breakDuration"
              value={formData.breakDuration}
              onChange={handleInputChange}
              min="0"
              max="8"
              step="0.25"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Calculated Hours</label>
            <div className="calculated-hours">
              {calculateHours().toFixed(2)}h
            </div>
          </div>
        </div>

        {/* Activity, Project, Campaign */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="activityId">Activity</label>
            <select
              id="activityId"
              name="activityId"
              value={formData.activityId}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select activity...</option>
              {activities.map(activity => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="projectId">Project</label>
            <select
              id="projectId"
              name="projectId"
              value={formData.projectId}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.status})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="campaignId">Campaign</label>
            <select
              id="campaignId"
              name="campaignId"
              value={formData.campaignId}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select campaign...</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name} ({campaign.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="office">Office</option>
            <option value="remote">Remote</option>
            <option value="client_site">Client Site</option>
            <option value="field">Field Work</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Optional description of work performed..."
            rows="3"
            className="form-textarea"
          />
        </div>

        {/* Admin Notice */}
        <div className="admin-notice">
          <p><strong>Admin Notice:</strong> This timesheet will be created on behalf of the selected user and will be marked as admin-created for audit purposes. The entry will still require approval through the normal workflow.</p>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onClose} 
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading || !formData.targetUserId}
          >
            {loading ? 'Creating...' : 'Create Timesheet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminTimesheetCreation;

