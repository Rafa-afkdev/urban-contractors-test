import React from 'react';
import PendingAppointments from './components/pending-appointments';

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Citas Pendientes
        </h1>
      </div>
      <PendingAppointments/>
    </div>
  );
}
