import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

// Updated: Campaign filter with database integration - v2.0
const DashboardHeader = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('All campaigns');
  const [selectedPeriod, setSelectedPeriod] = useState('Day');

  // Fetch campaigns from database
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('id, name, status')
          .eq('status', 'active')
          .order('name');

        if (error) {
          console.error('Error fetching campaigns:', error);
          return;
        }

        setCampaigns(data || []);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    };

    fetchCampaigns();
  }, []);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  const selectCampaign = (campaignName) => {
    setSelectedCampaign(campaignName);
    closeDropdowns();
  };

  const selectPeriod = (period) => {
    setSelectedPeriod(period);
    closeDropdowns();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dashboard-header-dropdown')) {
        closeDropdowns();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="dashboard-header">
      {/* NO DUPLICATE TITLE - header shows only filters */}
      
      {/* Horizontal dropdown filters - Campaign moved next to time period */}
      <div className="dashboard-filters">
        {/* Time Period Dropdown */}
        <div className="dashboard-header-dropdown">
          <button 
            className="dropdown-trigger active"
            onClick={() => toggleDropdown('period')}
          >
            {selectedPeriod}
            <span className={`dropdown-arrow ${activeDropdown === 'period' ? 'open' : ''}`}>▼</span>
          </button>
          {activeDropdown === 'period' && (
            <div className="dropdown-menu">
              <div 
                className={`dropdown-item ${selectedPeriod === 'Day' ? 'active' : ''}`}
                onClick={() => selectPeriod('Day')}
              >
                Day
              </div>
              <div 
                className={`dropdown-item ${selectedPeriod === 'Week' ? 'active' : ''}`}
                onClick={() => selectPeriod('Week')}
              >
                Week
              </div>
              <div 
                className={`dropdown-item ${selectedPeriod === 'Month' ? 'active' : ''}`}
                onClick={() => selectPeriod('Month')}
              >
                Month
              </div>
            </div>
          )}
        </div>

        {/* Campaign Dropdown - positioned next to time period */}
        <div className="dashboard-header-dropdown">
          <button 
            className="dropdown-trigger"
            onClick={() => toggleDropdown('campaign')}
          >
            {selectedCampaign}
            <span className={`dropdown-arrow ${activeDropdown === 'campaign' ? 'open' : ''}`}>▼</span>
          </button>
          {activeDropdown === 'campaign' && (
            <div className="dropdown-menu">
              <div 
                className={`dropdown-item ${selectedCampaign === 'All campaigns' ? 'active' : ''}`}
                onClick={() => selectCampaign('All campaigns')}
              >
                All campaigns
              </div>
              {campaigns.map((campaign) => (
                <div 
                  key={campaign.id}
                  className={`dropdown-item ${selectedCampaign === campaign.name ? 'active' : ''}`}
                  onClick={() => selectCampaign(campaign.name)}
                >
                  {campaign.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Locations Dropdown */}
        <div className="dashboard-header-dropdown">
          <button 
            className="dropdown-trigger"
            onClick={() => toggleDropdown('locations')}
          >
            All locations
            <span className={`dropdown-arrow ${activeDropdown === 'locations' ? 'open' : ''}`}>▼</span>
          </button>
          {activeDropdown === 'locations' && (
            <div className="dropdown-menu">
              <div className="dropdown-item">All locations</div>
              <div className="dropdown-item">New York</div>
              <div className="dropdown-item">Los Angeles</div>
              <div className="dropdown-item">Chicago</div>
            </div>
          )}
        </div>

        {/* Groups Dropdown */}
        <div className="dashboard-header-dropdown">
          <button 
            className="dropdown-trigger"
            onClick={() => toggleDropdown('groups')}
          >
            All groups
            <span className={`dropdown-arrow ${activeDropdown === 'groups' ? 'open' : ''}`}>▼</span>
          </button>
          {activeDropdown === 'groups' && (
            <div className="dropdown-menu">
              <div className="dropdown-item">All groups</div>
              <div className="dropdown-item">Development</div>
              <div className="dropdown-item">Design</div>
              <div className="dropdown-item">Marketing</div>
            </div>
          )}
        </div>

        {/* Schedules Dropdown */}
        <div className="dashboard-header-dropdown">
          <button 
            className="dropdown-trigger"
            onClick={() => toggleDropdown('schedules')}
          >
            All schedules
            <span className={`dropdown-arrow ${activeDropdown === 'schedules' ? 'open' : ''}`}>▼</span>
          </button>
          {activeDropdown === 'schedules' && (
            <div className="dropdown-menu">
              <div className="dropdown-item">All schedules</div>
              <div className="dropdown-item">Full-time</div>
              <div className="dropdown-item">Part-time</div>
              <div className="dropdown-item">Contract</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

