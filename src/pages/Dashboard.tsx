import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Avatar from '../components/Avatar';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="flex items-center space-x-4 mb-8">
        <Avatar userId={user?.uid || 'guest'} size={48} />
        <div>
          <div className="font-bold text-xl">Welcome, {user?.displayName || user?.email || 'Guest'}!</div>
          <div className="text-gray-400 text-sm">Dashboard</div>
        </div>
      </div>
      <div className="bg-white/10 rounded-2xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Your Stats</h2>
        <ul className="list-disc pl-6 text-gray-200">
          <li>Games Played: <span className="font-bold">0</span></li>
          <li>Wins: <span className="font-bold">0</span></li>
          <li>Wallet Balance: <span className="font-bold">0 ETB</span></li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
