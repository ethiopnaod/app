import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import { useAuth } from '../contexts/AuthContext';
import { GameService, TransactionService, UserService, Game, Transaction } from '../services/firebaseService';
import { useUserProfile } from '../contexts/UserProfileContext';
import ShowIdToken from './ShowIdToken';
// LanguageContext removed

/**
 * PlayerDashboard - Main dashboard for bingo players
 * Data-driven from Firestore
 */
const PlayerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { profile, refreshProfile, setProfile } = useUserProfile();
  const navigate = useNavigate();
  const [username, setUsername] = React.useState<string>('');
  const [balance, setBalance] = React.useState<number>(0);
  const [activeGames, setActiveGames] = React.useState<Game[]>([]);
  const [leaderboard, setLeaderboard] = React.useState<{ playerName: string; score: number }[]>([]);
  const [recentWins, setRecentWins] = React.useState<{ id: string; amount: number; date: string }[]>([]);

  // Daily reward and free game state
  const [streak, setStreak] = React.useState<number>(0);
  const [lastClaim, setLastClaim] = React.useState<string>('');
  const [rewardGiven, setRewardGiven] = React.useState<boolean>(false);
  const [freeGamePoints, setFreeGamePoints] = React.useState<number>(0);
  const [loadingReward, setLoadingReward] = React.useState(false);
  const [loadingFreeGame, setLoadingFreeGame] = React.useState(false);
  const [rewardMsg, setRewardMsg] = React.useState<string>('');


  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) return;
      try {
        const [games, lb, tx] = await Promise.all([
          GameService.getGames('active'),
          GameService.getLeaderboard('global'),
          TransactionService.getUserTransactions(user.uid)
        ]);
        if (!mounted) return;
        setUsername(profile?.displayName || profile?.email || 'Player');
        setBalance(profile?.balance || 0);
        setActiveGames(games.filter((g) => g.players.includes(user.uid)));
        setLeaderboard((lb.players || []).map((p) => ({ playerName: p.playerName, score: p.score })));
        setFreeGamePoints(profile?.freeGamePoints || 0);
        setStreak(profile?.dailyStreak || 0);
        setLastClaim(profile?.lastDailyClaim || '');
        const wins = tx
          .filter((t: Transaction) => t.type === 'game_win' || t.amount > 0)
          .slice(0, 10)
          .map((t) => ({
            id: t.id,
            amount: t.amount,
            date:
              t.createdAt && typeof (t.createdAt as { toDate?: () => Date }).toDate === 'function'
                ? (t.createdAt as { toDate: () => Date }).toDate().toLocaleDateString()
                : new Date().toLocaleDateString(),
          }));
        setRecentWins(wins);
      } catch {
        // ignore for now
      }
    };
    load();
    return () => { mounted = false; };
  }, [user, profile, rewardGiven, freeGamePoints]);

  // Claim daily reward handler
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

  // Play free game handler
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
    <div className="min-h-screen game-cyberpunk text-white flex flex-col pb-20 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-b-2xl shadow-md relative z-10">
        <Avatar userId={user?.uid || 'guest'} size={56} />
        <div>
            <div className="font-bold text-lg text-yellow-400">{username}</div>
          <div className="text-yellow-300 font-semibold text-sm flex items-center gap-1">
            <span className="material-icons text-yellow-400">monetization_on</span>
              ETB {balance}
          </div>
        </div>
      </div>
      {/* Daily Reward & Free Game */}
      <div className="max-w-2xl mx-auto w-full mb-4">
        <div className="panel-cyber rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div>
            <div className="font-bold text-yellow-300 text-lg mb-1">Daily Streak: <span className="text-white">{streak}</span></div>
            <div className="text-sm text-cyan-200">Last Claimed: <span className="text-white">{lastClaim || 'Never'}</span></div>
            <div className="text-sm text-green-300 mt-1">Free Game Points: <span className="text-white">{freeGamePoints}</span></div>
          </div>
          <div className="flex flex-col gap-2 min-w-[180px]">
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
        </div>
        {rewardMsg && <div className="text-center text-green-400 font-semibold mt-2">{rewardMsg}</div>}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 flex-1 relative z-10">
        {/* Active Games */}
        <div className="panel-cyber rounded-2xl p-6 mb-6 flex flex-col hover:shadow-2xl transition">
          <div className="font-bold text-cyan-300 mb-2">Active Games</div>
          {activeGames.length === 0 ? (
            <div className="text-slate-300 text-sm">You are not in any active games.</div>
          ) : (
            <ul className="space-y-2">
              {activeGames.map(game => (
                <li key={game.id} className="flex justify-between items-center">
                  <span className="text-white">{game.title}</span>
                  <button className="btn-modern px-3 py-1">Join</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ShowIdToken />
        {/* Leaderboard */}
        <div className="panel-cyber rounded-2xl p-6 mb-6 flex flex-col hover:shadow-2xl transition">
          <div className="font-bold text-cyan-300 mb-2">Leaderboard</div>
          {leaderboard.length === 0 ? (
            <div className="text-slate-300 text-sm">No leaderboard data.</div>
          ) : (
            <ol className="space-y-1">
              {leaderboard.slice(0, 5).map((p, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className={`font-bold text-lg ${i===0?'text-yellow-400':i===1?'text-gray-300':'text-orange-400'}`}>{i+1}.</span>
                  <span>{p.playerName}</span>
                  <span className="ml-auto font-semibold">{p.score}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        {/* Recent Wins */}
        <div className="panel-cyber rounded-2xl p-6 mb-6 flex flex-col hover:shadow-2xl transition max-h-60 overflow-y-auto">
          <div className="font-bold text-cyan-300 mb-2">Recent Activity</div>
          {recentWins.length === 0 ? (
            <div className="text-slate-300 text-sm">No recent wins yet.</div>
          ) : (
            <ul className="space-y-1">
              {recentWins.map(win => (
                <li key={win.id} className="flex justify-between text-sm">
                  <span className="text-green-300">+ ETB {win.amount}</span>
                  <span className="text-gray-300">{win.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
