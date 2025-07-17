import React, { useState } from 'react';

const DashboardHeader = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    timeframe: 'Day',
    locations: 'All locations',
    groups: 'All groups',
    schedules: 'All schedules'
  });

  const dropdownOptions = {
    timeframe: ['Day', 'Week', 'Month'],
    locations: ['All locations', 'Main Office', 'Remote', 'Branch A', 'Branch B'],
    groups: ['All groups', 'Development', 'Marketing', 'Sales', 'Support', 'Management'],
    schedules: ['All schedules', 'Full-time', 'Part-time', 'Contract', 'Intern']
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const selectOption = (dropdown, option) => {
    setSelectedFilters(prev => ({
      ...prev,
      [dropdown]: option
    }));
    setActiveDropdown(null);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.dropdown-container')) {
      setActiveDropdown(null);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const DropdownButton = ({ type, label, options }) => (
    <div className="dropdown-container">
      <button 
        className={`dropdown-button ${activeDropdown === type ? 'active' : ''} ${type === 'timeframe' ? 'primary' : 'secondary'}`}
        onClick={() => toggleDropdown(type)}
      >
        <span className="dropdown-label">{selectedFilters[type]}</span>
        <svg 
          className={`dropdown-arrow ${activeDropdown === type ? 'rotated' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="currentColor"
        >
          <path d="M3 4.5L6 7.5L9 4.5H3Z"/>
        </svg>
      </button>
      
      {activeDropdown === type && (
        <div className="dropdown-menu">
          {options.map((option, index) => (
            <button
              key={index}
              className={`dropdown-option ${selectedFilters[type] === option ? 'selected' : ''}`}
              onClick={() => selectOption(type, option)}
            >
              {option}
              {selectedFilters[type] === option && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="check-icon">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="dashboard-header">
      {/* Top Navigation Bar */}
      <div className="dashboard-nav">
        <div className="nav-left">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        
        <div className="nav-right">
          <button className="organization-button">
            Organization
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M3 4.5L6 7.5L9 4.5H3Z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="dashboard-filters">
        <div className="filters-left">
          {/* Timeframe Buttons */}
          <div className="timeframe-group">
            <DropdownButton 
              type="timeframe" 
              label="Timeframe" 
              options={dropdownOptions.timeframe} 
            />
          </div>
        </div>

        <div className="filters-right">
          {/* Filter Dropdowns */}
          <div className="filter-group">
            <DropdownButton 
              type="locations" 
              label="Locations" 
              options={dropdownOptions.locations} 
            />
            <DropdownButton 
              type="groups" 
              label="Groups" 
              options={dropdownOptions.groups} 
            />
            <DropdownButton 
              type="schedules" 
              label="Schedules" 
              options={dropdownOptions.schedules} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

