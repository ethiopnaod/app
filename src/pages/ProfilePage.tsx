import React from 'react';
import UserProfile from '../components/UserProfile';

const ProfilePage: React.FC = () => {
  return (
    <div className="px-4 pt-6 pb-10 max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Your Profile</h1>
        <p className="text-white/70 text-sm md:text-base">Manage your account details and contact information</p>
      </div>
      <UserProfile />
    </div>
  );
};

export default ProfilePage;
