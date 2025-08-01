
/* Full corrected WeeklyChart.jsx with break_duration conversion */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../hooks/useAuth';

const WeeklyChart = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekRange, setWeekRange] = useState('');
  const [totals, setTotals] = useState({
    totalWorked: 0,
    totalBreaks: 0,
    totalOvertime: 0,
    activeUsers: 0,
    avgPerUser: 0
  });
  const [viewMode, setViewMode] = useState('personal'); // 'personal' or 'organization'

  useEffect(() => {
    if (user) {
      fetchWeeklyData();
    }
  }, [user, viewMode]);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 WEEKLY CHART: Fetching data for', viewMode, 'view');

      const { data: recentData, error: fetchError } = await supabase
        .from('timesheet_entries')
        .select(`
          date,
          hours_worked,
          total_hours,
          regular_hours,
          break_duration,
          overtime_hours,
          status,
          user_id,
          users!timesheet_entries_user_id_fkey (
            id,
            full_name,
            role,
            manager_id
          )
        `)
        .order('date', { ascending: false })
        .limit(300);

      if (fetchError) {
        throw new Error(`Failed to fetch timesheet data: ${fetchError.message}`);
      }

      if (!recentData || recentData.length === 0) {
        setChartData([]);
        setWeekRange('No data available');
        setTotals({
          totalWorked: 0,
          totalBreaks: 0,
          totalOvertime: 0,
          activeUsers: 0,
          avgPerUser: 0
        });
        return;
      }

      const latestDate = new Date(recentData[0].date);
      const weekStart = new Date(latestDate);
      weekStart.setDate(latestDate.getDate() - latestDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      let weekData = recentData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });

      if (viewMode === 'personal' && user?.role !== 'admin') {
        weekData = weekData.filter(entry => entry.user_id === user.id);
      } else if (viewMode === 'organization' && user?.role === 'admin') {
        // Admin sees all data
      } else if (user?.role === 'campaign_lead' || user?.role === 'manager') {
        weekData = weekData.filter(entry =>
          entry.user_id === user.id ||
          entry.users?.manager_id === user.id
        );
      }

      const convertBreakDuration = (interval) => {
        if (!interval || typeof interval !== 'string') return 0;
        const [h, m, s] = interval.split(':').map(Number);
        return (h || 0) + ((m || 0) / 60) + ((s || 0) / 3600);
      };

      const calculateHours = (entry) =>
        entry.hours_worked || entry.total_hours || entry.regular_hours || 0;

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dailyData = [];

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);

        const dayEntries = weekData.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.toDateString() === currentDate.toDateString();
        });

        const dayData = {
          day: days[i],
          date: currentDate.toISOString().split('T')[0],
          shortDay: days[i].substring(0, 3),
          workedHours: 0,
          breakHours: 0,
          overtimeHours: 0,
          userCount: 0,
          entries: dayEntries
        };

        const uniqueUsers = new Set();
        dayEntries.forEach(entry => {
          const hours = calculateHours(entry);
          if (hours > 0) {
            dayData.workedHours += hours;
            dayData.breakHours += convertBreakDuration(entry.break_duration);
            dayData.overtimeHours += entry.overtime_hours || 0;
            uniqueUsers.add(entry.user_id);
          }
        });

        dayData.userCount = uniqueUsers.size;
        dailyData.push(dayData);
      }

      const uniqueUsersWeek = new Set();
      let totalWorked = 0;
      let totalBreaks = 0;
      let totalOvertime = 0;

      weekData.forEach(entry => {
        const hours = calculateHours(entry);
        if (hours > 0) {
          totalWorked += hours;
          totalBreaks += convertBreakDuration(entry.break_duration);
          totalOvertime += entry.overtime_hours || 0;
          uniqueUsersWeek.add(entry.user_id);
        }
      });

      const activeUsers = uniqueUsersWeek.size;
      const avgPerUser = activeUsers > 0 ? totalWorked / activeUsers : 0;

      const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      };

      setChartData(dailyData);
      setWeekRange(`${formatDate(weekStart)} - ${formatDate(weekEnd)}`);
      setTotals({
        totalWorked: Math.round(totalWorked * 10) / 10,
        totalBreaks: Math.round(totalBreaks * 10) / 10,
        totalOvertime: Math.round(totalOvertime * 10) / 10,
        activeUsers,
        avgPerUser: Math.round(avgPerUser * 10) / 10
      });

    } catch (error) {
      console.error('📊 WEEKLY CHART: Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return <div className="weekly-chart-container">{/* Chart rendering here */}</div>;
};

export default WeeklyChart;
