import React from 'react';
// LanguageContext removed
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { GameService, TransactionService, UserService, Game, Transaction } from '../services/firebaseService';

/**
 * AdminDashboard - Data-driven with simple charts
 */
const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  // Translation removed
  const navigate = useNavigate();
  const [users, setUsers] = React.useState<number>(0);
  const [games, setGames] = React.useState<Game[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const [usersList, gamesList] = await Promise.all([
          UserService.getAllUsers(),
          GameService.getGames()
        ]);
        setUsers(usersList.length);
        setGames(gamesList);
      } catch {
        setUsers(0);
        setGames([]);
      }
    };
    load();
  }, []);

  React.useEffect(() => {
    const loadTx = async () => {
      try {
        const tx = await TransactionService.getAllTransactions();
        setTransactions(tx);
      } catch {
        setTransactions([]);
      }
    };
    loadTx();
  }, []);

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin-dashboard' },
    { label: 'Games', icon: 'casino', route: '/games' },
    { label: 'Users', icon: 'group', route: '/admin' },
    { label: 'Transactions', icon: 'account_balance_wallet', route: '/transactions' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];
  const location = useLocation();

  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = { waiting: 0, active: 0, completed: 0, cancelled: 0 };
    games.forEach(g => { counts[g.status] = (counts[g.status] || 0) + 1; });
    return counts;
  }, [games]);

  const totalGames = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;
  const pct = (n: number) => Math.round((n / totalGames) * 100);
  const cg = `conic-gradient(#22c55e 0% ${pct(statusCounts.active)}%, #f59e0b ${pct(statusCounts.active)}% ${pct(statusCounts.active)+pct(statusCounts.waiting)}%, #60a5fa ${pct(statusCounts.active)+pct(statusCounts.waiting)}% ${pct(statusCounts.active)+pct(statusCounts.waiting)+pct(statusCounts.completed)}%, #ef4444 ${pct(statusCounts.active)+pct(statusCounts.waiting)+pct(statusCounts.completed)}% 100%)`;

  const revenueByType = React.useMemo(() => {
    const sums: Record<string, number> = {};
    transactions.forEach(t => { sums[t.type] = (sums[t.type] || 0) + t.amount; });
    return sums;
  }, [transactions]);
  const maxRevenue = Math.max(1, ...Object.values(revenueByType).map(v => Math.abs(v)));

  return (
    <div className="min-h-screen game-cyberpunk text-white flex relative overflow-hidden">
      {/* Sidebar (collapsible on mobile) */}
      <aside className={`fixed z-30 top-0 left-0 h-full panel-cyber shadow-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:w-56 w-56 flex flex-col`}>
  <div className="font-extrabold text-2xl text-yellow-400 p-6 border-b border-yellow-400">Admin</div>
        <nav className="flex-1 flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const active = location.pathname === item.route;
            return (
              <button
                key={item.label}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl font-semibold transition ${active ? 'bg-gradient-to-r from-cyan-400/20 to-fuchsia-500/20 text-white shadow-[0_0_18px_rgba(0,255,240,0.25)]' : 'text-yellow-300 hover:bg-white/10'}`}
                onClick={() => navigate(item.route)}
              >
                <span className="material-icons text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-56 relative z-10">
        {/* Topbar for mobile sidebar toggle */}
        <div className="md:hidden flex items-center justify-between p-4 panel-cyber shadow">
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} className="text-yellow-400"><span className="material-icons">menu</span></button>
          <span className="font-bold text-lg text-yellow-400">Admin Dashboard</span>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
          {[{label:'users', value: users}, {label:'games', value: games.length}, {label:'transactions', value: transactions.length}, {label:'active', value: statusCounts.active}].map((stat, i) => (
            <div key={i} className="panel-cyber rounded-2xl p-6 flex flex-col items-center hover:shadow-xl transition">
              <div className="text-2xl font-bold text-yellow-400 mb-1">{stat.value}</div>
              <div className="text-xs text-yellow-200 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          <div className="panel-cyber rounded-2xl p-6">
            <div className="font-semibold text-cyan-300 mb-4">Game Status Distribution</div>
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 rounded-full" style={{ background: cg }} />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-sm"/>Active: {statusCounts.active}</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded-sm"/>Waiting: {statusCounts.waiting}</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-sky-500 rounded-sm"/>Completed: {statusCounts.completed}</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-sm"/>Cancelled: {statusCounts.cancelled}</div>
              </div>
            </div>
          </div>
          <div className="panel-cyber rounded-2xl p-6">
            <div className="font-semibold text-cyan-300 mb-4">Revenue by Type</div>
            <div className="space-y-3">
              {Object.entries(revenueByType).map(([type, value]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1"><span className="capitalize">{type.replace('_',' ')}</span><span>ETB {value.toFixed(2)}</span></div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-3 bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${Math.min(100, Math.abs(value)/maxRevenue*100)}%` }} />
                  </div>
                </div>
              ))}
              {Object.keys(revenueByType).length === 0 && <div className="text-slate-300 text-sm">No revenue data.</div>}
            </div>
          </div>
        </div>
        {/* Transactions Table */}
        <div className="panel-cyber rounded-2xl p-6 m-4">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-2 text-left text-cyan-300">Type</th>
                  <th className="p-2 text-left text-cyan-300">Amount</th>
                  <th className="p-2 text-left text-cyan-300">Status</th>
                  <th className="p-2 text-left text-cyan-300">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/5">
                    <td className="p-2 capitalize">{tx.type.replace('_',' ')}</td>
                    <td className={`p-2 ${tx.amount>=0?'text-green-400':'text-red-400'}`}>ETB {tx.amount}</td>
                    <td className="p-2">{tx.status}</td>
                    <td className="p-2">{'createdAt' in tx && typeof tx.createdAt?.toDate === 'function' ? tx.createdAt.toDate().toLocaleString() : ''}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td className="p-2 text-slate-300" colSpan={4}>No transactions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
