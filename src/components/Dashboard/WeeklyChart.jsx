// src/components/Dashboard/WeeklyChart.jsx
import React from 'react';

export default function WeeklyChart() {
  const chartData = [30, 60, 50, 80, 20, 40, 70]; // sample %

  return (
    <div className="dashboard-page weekly-chart p-6 bg-white shadow rounded-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-gray-900 uppercase tracking-wide">
          Tracked Hours
        </h2>
        <a href="#" className="text-sm text-blue-600 hover:underline">
          Go to timesheets
        </a>
      </div>

      <div className="flex items-end justify-between h-48 px-2 border-t border-gray-200 pt-4">
        {chartData.map((height, idx) => (
          <div key={idx} className="flex flex-col items-center w-full">
            <div
              className="w-6 bg-gray-300 rounded-t"
              style={{ height: `${height}%` }}
            />
            <span className="text-xs mt-2 text-gray-500">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
