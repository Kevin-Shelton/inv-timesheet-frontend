import React from "react";
import UpcomingHolidays from "./UpcomingHolidays";
import TrackedHours from "./TrackedHours";
import Activities from "./Activities";
import WhoIsInOutPanel from "./WhoIsInOutPanel";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      {/* Row 1: Greeting and Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <HelloPanel />
        <UpcomingHolidays />
      </div>

      {/* Row 2: Tracked Hours */}
      <TrackedHours />

      {/* Row 3: Activities and Who's In/Out */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Activities />
        <WhoIsInOutPanel />
      </div>
    </div>
  );
}
