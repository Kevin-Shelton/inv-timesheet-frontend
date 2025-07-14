// src/components/Dashboard/WelcomeCard.jsx
import React from 'react'

export default function WelcomeCard() {
  return (
    <div className="dashboard-page card p-6 rounded-2xl shadow-md bg-white text-gray-800 w-full">
      <h2 className="text-xl font-semibold mb-2">Welcome Back</h2>
      <p className="text-sm text-gray-600">
        Let’s get started with your day. Your timesheet is up to date.
      </p>
    </div>
  )
}
