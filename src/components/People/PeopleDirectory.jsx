import React, { useState, useEffect } from 'react';
import './people-directory.css';
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building,
  Shield,
  Eye,
  EyeOff,
  Save,
  X,
  Check,
  AlertCircle,
  UserPlus,
  Settings,
  MoreVertical,
  Download,
  Upload,
  ChevronDown,
  Tag
} from 'lucide-react';

// Safe import with fallback
let supabaseApi;
try {
  supabaseApi = require('../../supabaseClient.js').supabaseApi;
} catch (error) {
  console.warn('Could not import supabaseClient, using fallback data');
  supabaseApi = null;
}

// Error Boundary for PeopleDirectory
class PeopleDirectoryErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PeopleDirectory Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="people-directory">
          <div className="directory-header">
            <div className="header-content">
              <div className="header-title">
                <h1><Users size={32} />People Directory</h1>
                <p>Manage your team members and their information</p>
              </div>
            </div>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#ef4444', marginBottom: '8px' }}>Error Loading People Directory</h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              There was an error loading the people directory. Please refresh the page or contact support.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const PeopleDirectory = () => {
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form state for add/edit
  const [formData, setFormData] = useState({
    full_name: '',
    display_name: '',
    email: '',
    phone_number: '',
    job_title: '',
    department: '',
    manager_id: '',
    employment_type: 'full_time',
    work_schedule_group_id: '',
    employment_status: 'active',
    expected_weekly_hours: 40,
    hourly_rate: '',
    billable_rate: '',
    is_billable: false,
    location: '',
    time_zone: 'America/New_York',
    profile_picture: '',
    pto_balance: 0,
    sick_balance: 0,
    assigned_campaigns: []
  });

  // View mode state
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Custom dropdown states
  const [customValues, setCustomValues] = useState({
    departments: [],
    roles: [],
    employment_types: [],
    employment_statuses: [],
    time_zones: []
  });

  // Safe API calls with fallbacks
  const safeApiCall = async (apiFunction, fallbackData = []) => {
    try {
      if (!supabaseApi) {
        return fallbackData;
      }
      return await apiFunction();
    } catch (error) {
      console.error('API call failed:', error);
      return fallbackData;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadPeople(),
          loadCurrentUser(),
          loadCampaigns()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to load initial data');
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    filterPeople();
  }, [people, searchTerm, departmentFilter, statusFilter, employmentTypeFilter]);

  const loadCurrentUser = async () => {
    try {
      if (!supabaseApi) return;
      
      const user = await supabaseApi.getCurrentUser();
      if (user) {
        const userInfo = await supabaseApi.getEmployeeInfo(user.id);
        setCurrentUser(userInfo);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      // Don't set error state for user loading failure
    }
  };

  const loadCampaigns = async () => {
    const fallbackCampaigns = [
      { id: '1', name: 'Website Redesign', client_name: 'Acme Corp' },
      { id: '2', name: 'Mobile App', client_name: 'TechStart Inc' },
      { id: '3', name: 'Brand Identity', client_name: 'Creative Co' },
      { id: '4', name: 'E-commerce Platform', client_name: 'Retail Plus' }
    ];

    const campaignData = await safeApiCall(
      () => supabaseApi.getCampaigns(),
      fallbackCampaigns
    );
    
    setCampaigns(campaignData);
  };

  const loadPeople = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fallback data for demo
      const fallbackPeople = [
        {
          id: '1',
          full_name: 'John Doe',
          display_name: 'Johnny',
          email: 'john.doe@company.com',
          phone_number: '+1 (555) 123-4567',
          job_title: 'Senior Developer',
          department: 'Engineering',
          employment_type: 'full_time',
          employment_status: 'active',
          expected_weekly_hours: 40,
          hourly_rate: 75.00,
          billable_rate: 125.00,
          is_billable: true,
          location: 'New York, NY',
          time_zone: 'America/New_York',
          profile_picture: null,
          pto_balance: 15,
          sick_balance: 8,
          assigned_campaigns: ['1', '2']
        },
        {
          id: '2',
          full_name: 'Jane Smith',
          display_name: 'Jane',
          email: 'jane.smith@company.com',
          phone_number: '+1 (555) 234-5678',
          job_title: 'Project Manager',
          department: 'Operations',
          employment_type: 'full_time',
          employment_status: 'active',
          expected_weekly_hours: 40,
          hourly_rate: 65.00,
          billable_rate: 110.00,
          is_billable: true,
          location: 'San Francisco, CA',
          time_zone: 'America/Los_Angeles',
          profile_picture: null,
          pto_balance: 12,
          sick_balance: 5,
          assigned_campaigns: ['1', '3']
        },
        {
          id: '3',
          full_name: 'Mike Johnson',
          display_name: 'Mike',
          email: 'mike.johnson@company.com',
          phone_number: '+1 (555) 345-6789',
          job_title: 'Designer',
          department: 'Design',
          employment_type: 'contract',
          employment_status: 'active',
          expected_weekly_hours: 30,
          hourly_rate: 55.00,
          billable_rate: 95.00,
          is_billable: true,
          location: 'Austin, TX',
          time_zone: 'America/Chicago',
          profile_picture: null,
          pto_balance: 0,
          sick_balance: 0,
          assigned_campaigns: ['2', '4']
        }
      ];

      const peopleData = await safeApiCall(
        () => supabaseApi.getUsers(),
        fallbackPeople
      );

      // Ensure data has required fields
      const processedPeople = peopleData.map(person => ({
        ...person,
        assigned_campaigns: person.assigned_campaigns || [],
        employment_status: person.employment_status || 'active',
        employment_type: person.employment_type || 'full_time'
      }));

      setPeople(processedPeople);
    } catch (error) {
      console.error('Error loading people:', error);
      setError('Failed to load people data');
    } finally {
      setLoading(false);
    }
  };

  const filterPeople = () => {
    let filtered = [...people];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(person =>
        person.full_name?.toLowerCase().includes(term) ||
        person.email?.toLowerCase().includes(term) ||
        person.job_title?.toLowerCase().includes(term) ||
        person.department?.toLowerCase().includes(term)
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(person => person.department === departmentFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(person => person.employment_status === statusFilter);
    }

    // Employment type filter
    if (employmentTypeFilter !== 'all') {
      filtered = filtered.filter(person => person.employment_type === employmentTypeFilter);
    }

    setFilteredPeople(filtered);
  };

  // Safe rendering with null checks
  if (loading) {
    return (
      <div className="people-directory">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading people directory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="people-directory">
        <div className="directory-header">
          <div className="header-content">
            <div className="header-title">
              <h1><Users size={32} />People Directory</h1>
              <p>Manage your team members and their information</p>
            </div>
          </div>
        </div>
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={loadPeople} className="btn btn-secondary" style={{ marginLeft: '12px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="people-directory">
      <div className="directory-header">
        <div className="header-content">
          <div className="header-title">
            <h1><Users size={32} />People Directory</h1>
            <p>Manage your team members and their information</p>
          </div>
          <div className="header-actions">
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                <div className="grid-icon"></div>
                Cards
              </button>
              <button 
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <div className="list-icon"></div>
                Table
              </button>
            </div>
            <button 
              className={`sensitive-toggle ${showSensitiveData ? 'active' : ''}`}
              onClick={() => setShowSensitiveData(!showSensitiveData)}
            >
              {showSensitiveData ? <EyeOff size={16} /> : <Eye size={16} />}
              {showSensitiveData ? 'Hide' : 'Show'} Sensitive Data
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Add Person
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="directory-filters">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Operations">Operations</option>
            <option value="Design">Design</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="terminated">Terminated</option>
          </select>
          <select
            value={employmentTypeFilter}
            onChange={(e) => setEmploymentTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="intern">Intern</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {filteredPeople.length === 0 ? (
        <div className="empty-state">
          <Users size={64} />
          <h3>No People Found</h3>
          <p>No team members match your current filters. Try adjusting your search criteria.</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Add First Person
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="people-grid">
              {filteredPeople.map((person) => (
                <PersonCard 
                  key={person.id} 
                  person={person} 
                  campaigns={campaigns}
                  showSensitiveData={showSensitiveData}
                  onEdit={(person) => {
                    setSelectedPerson(person);
                    setFormData({...person});
                    setShowEditModal(true);
                  }}
                  onDelete={(person) => {
                    setSelectedPerson(person);
                    setShowDeleteConfirm(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="people-table-container">
              <PeopleTable 
                people={filteredPeople}
                campaigns={campaigns}
                showSensitiveData={showSensitiveData}
                onEdit={(person) => {
                  setSelectedPerson(person);
                  setFormData({...person});
                  setShowEditModal(true);
                }}
                onDelete={(person) => {
                  setSelectedPerson(person);
                  setShowDeleteConfirm(true);
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Modals would go here - simplified for production safety */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Person</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Add person functionality will be available soon.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simplified PersonCard component for production safety
const PersonCard = ({ person, campaigns, showSensitiveData, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#F59E0B';
      case 'terminated': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getAssignedCampaigns = () => {
    if (!person.assigned_campaigns || !Array.isArray(person.assigned_campaigns)) {
      return [];
    }
    return campaigns.filter(campaign => 
      person.assigned_campaigns.includes(campaign.id)
    );
  };

  const assignedCampaigns = getAssignedCampaigns();

  return (
    <div className="person-card">
      <div className="card-header">
        <div className="person-avatar">
          {person.profile_picture ? (
            <img src={person.profile_picture} alt={person.full_name} />
          ) : (
            <div className="avatar-placeholder">
              {person.full_name ? person.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
          )}
          <div 
            className="status-indicator" 
            style={{ backgroundColor: getStatusColor(person.employment_status) }}
          ></div>
        </div>
        <div className="person-info">
          <h3>{person.full_name || 'Unknown'}</h3>
          <p className="job-title">{person.job_title || 'No title'}</p>
          <p className="department">{person.department || 'No department'}</p>
        </div>
        <div className="card-actions">
          <button className="action-btn" onClick={() => onEdit(person)} title="Edit">
            <Edit size={16} />
          </button>
          <button className="action-btn danger" onClick={() => onDelete(person)} title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="contact-info">
          <div className="contact-item">
            <Mail size={16} />
            <span>{person.email || 'No email'}</span>
          </div>
          {person.phone_number && (
            <div className="contact-item">
              <Phone size={16} />
              <span>{person.phone_number}</span>
            </div>
          )}
          {person.location && (
            <div className="contact-item">
              <MapPin size={16} />
              <span>{person.location}</span>
            </div>
          )}
        </div>

        {assignedCampaigns.length > 0 && (
          <div className="campaign-assignments">
            <div className="campaigns-label">
              <Tag size={12} />
              Campaigns
            </div>
            <div className="campaign-tags">
              {assignedCampaigns.slice(0, 3).map((campaign) => (
                <span key={campaign.id} className="campaign-tag-small">
                  {campaign.name}
                </span>
              ))}
              {assignedCampaigns.length > 3 && (
                <span className="campaign-tag-small more">
                  +{assignedCampaigns.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="employment-info">
          <div className="info-row">
            <span className="label">Type</span>
            <span className="value">{person.employment_type?.replace('_', ' ') || 'Unknown'}</span>
          </div>
          <div className="info-row">
            <span className="label">Hours/Week</span>
            <span className="value">{person.expected_weekly_hours || 0}h</span>
          </div>
          {showSensitiveData && (
            <>
              <div className="info-row">
                <span className="label">Hourly Rate</span>
                <span className="value">${person.hourly_rate || 0}/hr</span>
              </div>
              <div className="info-row">
                <span className="label">PTO Balance</span>
                <span className="value">{person.pto_balance || 0} days</span>
              </div>
            </>
          )}
          <div className="info-row">
            <span className="label">Status</span>
            <span 
              className="value status-badge" 
              style={{ color: getStatusColor(person.employment_status) }}
            >
              {person.employment_status || 'unknown'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified PeopleTable component for production safety
const PeopleTable = ({ people, campaigns, showSensitiveData, onEdit, onDelete }) => {
  return (
    <table className="people-table">
      <thead>
        <tr>
          <th>Employee</th>
          <th>Contact</th>
          <th>Employment</th>
          <th>Campaigns</th>
          {showSensitiveData && <th>Rates</th>}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr key={person.id}>
            <td>
              <div className="employee-cell">
                <div className="employee-avatar">
                  {person.profile_picture ? (
                    <img src={person.profile_picture} alt={person.full_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {person.full_name ? person.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="employee-name">{person.full_name || 'Unknown'}</div>
                  <div className="employee-title">{person.job_title || 'No title'}</div>
                </div>
              </div>
            </td>
            <td>
              <div className="contact-cell">
                <div>{person.email || 'No email'}</div>
                <div>{person.phone_number || 'No phone'}</div>
              </div>
            </td>
            <td>
              <div className="employment-cell">
                <div>{person.employment_type?.replace('_', ' ') || 'Unknown'}</div>
                <div className="location">{person.location || 'No location'}</div>
              </div>
            </td>
            <td>
              <div className="campaigns-cell">
                {person.assigned_campaigns && person.assigned_campaigns.length > 0 ? (
                  <div className="campaign-tags-table">
                    {campaigns
                      .filter(campaign => person.assigned_campaigns.includes(campaign.id))
                      .slice(0, 2)
                      .map((campaign) => (
                        <span key={campaign.id} className="campaign-tag-small">
                          {campaign.name}
                        </span>
                      ))}
                    {person.assigned_campaigns.length > 2 && (
                      <span className="campaign-tag-small more">
                        +{person.assigned_campaigns.length - 2}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="no-campaigns">No campaigns</span>
                )}
              </div>
            </td>
            {showSensitiveData && (
              <td>
                <div className="rates-cell">
                  <div>${person.hourly_rate || 0}/hr</div>
                  <div>Billable: ${person.billable_rate || 0}/hr</div>
                </div>
              </td>
            )}
            <td>
              <div className="table-actions">
                <button className="action-btn" onClick={() => onEdit(person)} title="Edit">
                  <Edit size={16} />
                </button>
                <button className="action-btn danger" onClick={() => onDelete(person)} title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

// Export with Error Boundary wrapper
const PeopleDirectoryWithErrorBoundary = () => (
  <PeopleDirectoryErrorBoundary>
    <PeopleDirectory />
  </PeopleDirectoryErrorBoundary>
);

export default PeopleDirectoryWithErrorBoundary;

