import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, CalendarDays, MapPin, Users, Clock, Search, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Updated: Corrected import path using alias

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

  // Updated: Campaign filter with database integration - v2.0
  // positioned next to time period
  // NO DUPLICATE TITLE - header shows only filters

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('is_active', true); // Assuming an is_active column

      if (error) {
        console.error('Error fetching campaigns:', error.message);
      } else {
        setCampaigns([{ id: null, name: 'All campaigns' }, ...data]);
      }
    };

    const fetchLocations = async () => {
      // Mock data for locations, replace with actual Supabase fetch
      const mockLocations = [
        { id: 1, name: 'New York Office' },
        { id: 2, name: 'Remote' },
        { id: 3, name: 'London Office' },
      ];
      setLocations([{ id: null, name: 'All locations' }, ...mockLocations]);
    };

    const fetchGroups = async () => {
      // Mock data for groups, replace with actual Supabase fetch
      const mockGroups = [
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Design' },
        { id: 3, name: 'Marketing' },
      ];
      setGroups([{ id: null, name: 'All groups' }, ...mockGroups]);
    };

    const fetchSchedules = async () => {
      // Mock data for schedules, replace with actual Supabase fetch
      const mockSchedules = [
        { id: 1, name: 'Full-time' },
        { id: 2, name: 'Part-time' },
        { id: 3, name: 'Flexible' },
      ];
      setSchedules([{ id: null, name: 'All schedules' }, ...mockSchedules]);
    };

    fetchCampaigns();
    fetchLocations();
    fetchGroups();
    fetchSchedules();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && dropdownRefs.current[activeDropdown] && !dropdownRefs.current[activeDropdown].contains(event.target)) {
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

  const handleTimeframeSelect = (option) => {
    setTimeframe(option);
    setActiveDropdown(null);
  };

  const handleCampaignSelect = (campaign) => {
    setSelectedCampaign(campaign.name);
    setActiveDropdown(null);
    // Implement filtering logic based on selected campaign
    console.log('Selected Campaign:', campaign.name);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location.name);
    setActiveDropdown(null);
    // Implement filtering logic based on selected location
    console.log('Selected Location:', location.name);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group.name);
    setActiveDropdown(null);
    // Implement filtering logic based on selected group
    console.log('Selected Group:', group.name);
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule.name);
    setActiveDropdown(null);
    // Implement filtering logic based on selected schedule
    console.log('Selected Schedule:', schedule.name);
  };

  const renderDropdown = (name, selectedValue, options, onSelect) => (
    <div className="relative" ref={el => dropdownRefs.current[name] = el}>
      <button
        className={`flex items-center px-4 py-2 rounded-md transition-all duration-200
          ${activeDropdown === name ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
        onClick={() => toggleDropdown(name)}
      >
        {selectedValue}
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${activeDropdown === name ? 'rotate-180' : ''}`} />
      </button>
      {activeDropdown === name && (
        <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option, index) => (
              <a
                key={index}
                href="#"
                className={`flex items-center px-4 py-2 text-sm ${selectedValue === option.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={(e) => { e.preventDefault(); onSelect(option); }}
              >
                {option.name}
                {selectedValue === option.name && (
                  <svg className="ml-auto h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="dashboard-header bg-white p-4 shadow-sm flex flex-wrap items-center justify-between space-y-2 md:space-y-0">
      <div className="flex flex-wrap items-center space-x-2 md:space-x-4">
        {renderDropdown('timeframe', timeframe, [
          { name: 'Day' }, { name: 'Week' }, { name: 'Month' }
        ], handleTimeframeSelect)}

        {renderDropdown('campaign', selectedCampaign, campaigns, handleCampaignSelect)}

        {renderDropdown('location', selectedLocation, locations, handleLocationSelect)}

        {renderDropdown('group', selectedGroup, groups, handleGroupSelect)}

        {renderDropdown('schedule', selectedSchedule, schedules, handleScheduleSelect)}
      </div>

      <div className="flex items-center space-x-4">
        {/* Add any other header elements here, e.g., user profile, notifications */}
      </div>
    </header>
  );
};

export default DashboardHeader;
