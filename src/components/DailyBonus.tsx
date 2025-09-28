
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../contexts/UserProfileContext';

const DailyBonus: React.FC = () => {
  const { user } = useAuth();
  const { profile, refreshProfile, setProfile } = useUserProfile();
  const navigate = useNavigate();
  const [streak, setStreak] = React.useState<number>(0);
  const [lastClaim, setLastClaim] = React.useState<string>('');
  const [rewardGiven, setRewardGiven] = React.useState<boolean>(false);
  const [freeGamePoints, setFreeGamePoints] = React.useState<number>(0);
  const [loadingReward, setLoadingReward] = React.useState(false);
  const [loadingFreeGame, setLoadingFreeGame] = React.useState(false);
  const [rewardMsg, setRewardMsg] = React.useState<string>('');

  React.useEffect(() => {
    if (!user || !profile) return;
    setStreak(profile.dailyStreak || 0);
    setLastClaim(profile.lastDailyClaim || '');
    setFreeGamePoints(profile.freeGamePoints || 0);
  }, [user, profile, rewardGiven, freeGamePoints]);

  const handleClaimDailyReward = async () => {
    setLoadingReward(true);
    setRewardMsg('');
    try {
      const res = await UserService.claimDailyReward();
      setStreak(res.streak);
      setLastClaim(res.lastClaim);
      setRewardGiven(res.rewardGiven);
      if (profile) setProfile({ ...profile, dailyStreak: res.streak, lastDailyClaim: res.lastClaim });
      await refreshProfile();
      if (res.rewardGiven) {
        setRewardMsg('Congratulations! You earned 10 birr for a 3-day streak!');
      } else {
        setRewardMsg('Daily reward claimed. Keep your streak for a bigger reward!');
      }
    } catch {
      setRewardMsg('Error claiming daily reward.');
    }
    setLoadingReward(false);
  };

  const handlePlayFreeGame = async () => {
    setLoadingFreeGame(true);
    setRewardMsg('');
    try {
      const points = await UserService.awardFreeGamePoints();
      setFreeGamePoints(points);
      if (profile) setProfile({ ...profile, freeGamePoints: points });
      await refreshProfile();
      setRewardMsg('You played a free game and earned 10 points!');
    } catch {
      setRewardMsg('Error awarding free game points.');
    }
    setLoadingFreeGame(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Daily Bonus
          </h1>
        </div>

        {/* Bonus Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <div className="mb-2 font-bold text-yellow-300 text-lg">Daily Streak: <span className="text-white">{streak}</span></div>
          <div className="text-sm text-cyan-200 mb-1">Last Claimed: <span className="text-white">{lastClaim || 'Never'}</span></div>
          <div className="text-sm text-green-300 mb-4">Free Game Points: <span className="text-white">{freeGamePoints}</span></div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleClaimDailyReward}
              disabled={loadingReward}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-60"
            >
              {loadingReward ? 'Claiming...' : 'Claim Daily Reward'}
            </button>
            <button
              onClick={handlePlayFreeGame}
              disabled={loadingFreeGame}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-60"
            >
              {loadingFreeGame ? 'Playing...' : 'Play Free Game'}
            </button>
          </div>
          {rewardMsg && <div className="text-center text-green-400 font-semibold mt-2">{rewardMsg}</div>}
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/welcome')}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg mt-2"
        >
          Back to Welcome
        </button>
      </div>
    </div>
  );
};

export default DailyBonus;