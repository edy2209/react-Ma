import React from 'react';
import Sidebar from './Sidebar';

const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-6 w-full">
        <h1 className="text-2xl font-bold">Ini dashboard atasan</h1>
        <p>Gunakan menu di sidebar untuk navigasi.</p>
      </div>
    </div>
  );
};

export default Dashboard;