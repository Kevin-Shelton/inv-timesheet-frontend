import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, CalendarDays, MapPin, Users, Clock } from 'lucide-react';
import { supabase } from '@/supabaseClient';

const DashboardHeader = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [timeframe, setTimeframe] = useState('Day');
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('All campaigns');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('All locations');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('All groups');
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState('All schedules');

  const dropdownRefs = useRef({});

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data, error } = await supabase
          .from('campaigns')
          .select('id, name')
          .eq('is_active', true);
        
        if (data) {
          setCampaigns(data);
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    };

    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, name')
          .eq('is_active', true);
        
        if (data) {
          setLocations(data);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };

    const fetchGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('id, name')
          .eq('is_active', true);
        
        if (data) {
          setGroups(data);
        }
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };

    const fetchSchedules = async () => {
      try {
        const { data, error } = await supabase
          .from('schedules')
          .select('id, name')
          .eq('is_active', true);
        
        if (data) {
          setSchedules(data);
        }
      } catch (err) {
        console.error('Error fetching schedules:', err);
      }
    };

    fetchCampaigns();
    fetchLocations();
    fetchGroups();
    fetchSchedules();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && dropdownRefs.current[activeDropdown] && 
          !dropdownRefs.current[activeDropdown].contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const handleSelect = (type, value) => {
    switch (type) {
      case 'timeframe':
        setTimeframe(value);
        break;
      case 'campaign':
        setSelectedCampaign(value);
        break;
      case 'location':
        setSelectedLocation(value);
        break;
      case 'group':
        setSelectedGroup(value);
        break;
      case 'schedule':
        setSelectedSchedule(value);
        break;
    }
    setActiveDropdown(null);
  };

  const DropdownButton = ({ name, value, icon: Icon, options, type }) => (
    <div className="filter-dropdown" ref={el => dropdownRefs.current[name] = el}>
      <button
        className={`filter-button ${activeDropdown === name ? 'active' : ''}`}
        onClick={() => toggleDropdown(name)}
      >
        <Icon className="filter-icon" size={16} />
        <span className="filter-text">{value}</span>
        <ChevronDown className={`filter-chevron ${activeDropdown === name ? 'rotated' : ''}`} size={16} />
      </button>
      
      {activeDropdown === name && (
        <div className="filter-menu">
          <div className="filter-menu-content">
            {options.map((option) => (
              <button
                key={option.value || option}
                className="filter-menu-item"
                onClick={() => handleSelect(type, option.value || option)}
              >
                {option.label || option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const timeframeOptions = ['Day', 'Week', 'Month'];
  const campaignOptions = ['All campaigns', ...campaigns.map(c => c.name)];
  const locationOptions = ['All locations', ...locations.map(l => l.name)];
  const groupOptions = ['All groups', ...groups.map(g => g.name)];
  const scheduleOptions = ['All schedules', ...schedules.map(s => s.name)];

  return (
    <div className="dashboard-header-filters">
      <DropdownButton
        name="timeframe"
        value={timeframe}
        icon={CalendarDays}
        options={timeframeOptions}
        type="timeframe"
      />
      
      <DropdownButton
        name="campaign"
        value={selectedCampaign}
        icon={Users}
        options={campaignOptions}
        type="campaign"
      />
      
      <DropdownButton
        name="location"
        value={selectedLocation}
        icon={MapPin}
        options={locationOptions}
        type="location"
      />
      
      <DropdownButton
        name="group"
        value={selectedGroup}
        icon={Users}
        options={groupOptions}
        type="group"
      />
      
      <DropdownButton
        name="schedule"
        value={selectedSchedule}
        icon={Clock}
        options={scheduleOptions}
        type="schedule"
      />
    </div>
  );
};

export default DashboardHeader;

