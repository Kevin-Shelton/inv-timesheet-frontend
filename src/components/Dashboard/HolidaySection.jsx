// src/components/Dashboard/HolidaySection.jsx

export default function HolidaySection() {
  return (
    <div className="dashboard-page holiday-section p-6 bg-white shadow rounded-xl w-full md:w-1/2">
      <h2 className="text-base font-semibold text-gray-900 uppercase tracking-wide mb-2">
        Upcoming Holidays and Time Off
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Add your holiday calendar for reminders and overtime calculations.
      </p>
      <div className="flex gap-2">
        <button className="text-sm font-medium text-blue-600 hover:underline">
          Set up Holidays
        </button>
        <button className="text-sm text-gray-500 hover:underline">
          No, thanks
        </button>
      </div>
    </div>
  );
}
