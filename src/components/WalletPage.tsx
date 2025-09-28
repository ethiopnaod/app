import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { TransactionService, Transaction, UserService, UserProfile, WalletService } from '../services/firebaseService';
import type { Wallet } from '../types/wallet';
import DepositModal from './DepositModal';
import WithdrawalModal from './WithdrawalModal';
import PlayerTransferModal from './PlayerTransferModal';
import { Button } from './ui/Button';

const WalletPage: React.FC = () => {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const loadUserData = React.useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      const userTransactions = await TransactionService.getUserTransactions(userId);
      setTransactions(userTransactions);
    } catch {
      setError(t('failedToLoadWalletData') || 'Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const init = async () => {
      if (!user) return;
      try {
        setProfileLoading(true);
        let p = await UserService.getUserProfile();
        if (!p) {
          const email = user.email || `${user.uid}@example.com`;
          const name = user.displayName || (user.email ? user.email.split('@')[0] : 'Player');
          await UserService.createUserProfile(email, name);
          p = await UserService.getUserProfile();
        }
        setProfile(p);
        // Fetch wallet data, create if missing
        let w = await WalletService.getUserWallet();
        if (!w) {
          // Only create wallet if missing, then fetch again
          w = await WalletService.getUserWallet();
        }
        setWallet(w);
        await loadUserData(user.uid);
      } catch {
        setError(t('failedToLoadProfile') || 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };
    init();
  }, [user, t, loadUserData]);

  // Listen for ?refresh=1 in the URL and reload wallet data
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(location.search);
    if (params.get('refresh') === '1') {
      (async () => {
        let w = await WalletService.getUserWallet();
        setWallet(w);
        await loadUserData(user.uid);
      })();
    }
  }, [location.search, user, loadUserData]);

  const handleDepositSuccess = async () => {
    if (user) {
      await loadUserData(user.uid);
    }
    setShowDepositModal(false);
  };

  const handleWithdrawalSuccess = async () => {
    if (user) {
      await loadUserData(user.uid);
    }
    setShowWithdrawalModal(false);
  };

  const handleTransferSuccess = async () => {
    if (user) {
      await loadUserData(user.uid);
    }
    setShowTransferModal(false);
  };

  const formatDate = (timestamp: Date | { toDate: () => Date }) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'object' && 'toDate' in timestamp ? timestamp.toDate() : new Date(timestamp as Date);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'game_entry': return '🎮';
      case 'game_win': return '🏆';
      case 'bonus': return '🎁';
      case 'transfer': return '🔄';
      default: return '📊';
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'game_win':
      case 'bonus':
        return 'text-green-400';
      case 'withdrawal':
      case 'game_entry':
      case 'transfer':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  if (authLoading || profileLoading || isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="relative z-10">
          <div className="loading-spinner mx-auto"></div>
          <div className="text-center text-white mt-4">{t('loading') || 'Loading...'}</div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="panel-cyber p-8 text-center relative z-10">
          <h2 className="text-xl font-semibold text-white mb-4">{t('error') || 'Error'}</h2>
          <p className="text-red-400 mb-4">{authError}</p>
          <Button onClick={() => navigate('/')}>{t('goHome') || 'Go Home'}</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="panel-cyber p-8 text-center relative z-10">
          <h2 className="text-xl font-semibold text-white mb-4">{t('signInRequired') || 'Sign in required'}</h2>
          <Button onClick={() => navigate('/login')} variant="cyber">{t('goToLogin') || 'Go to Login'}</Button>
        </div>
      </div>
    );
  }

  // Always render wallet UI, show empty/default state if wallet is missing
  return (
    <div className="min-h-screen flex flex-col items-center justify-start relative">
      {/* Glassmorphism Card for Wallet */}
      <div className="absolute top-4 left-4">
        <button
          onClick={() => navigate('/')}
          className="back-button"
          aria-label="Go back"
        >
          ←
        </button>
      </div>
      <div className="w-full max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          {/* User Image */}
          <div className="flex justify-center mb-4">
            <img
              src={profile?.photoURL || '/default-avatar.png'}
              alt="User Avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-cyber shadow-lg"
              onError={e => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
            />
          </div>
          <h1 className="gaming-font text-5xl mb-2 gradient-text animate-gradient">{t('wallet') || 'Wallet'}</h1>
          <p className="text-slate-300 text-lg">{t('manageFundsAndTransactions') || 'Manage your funds and transactions'}</p>
        </div>
        {/* Balance Card */}
        <div className="panel-cyber p-8 mb-8 mx-auto animate-fade-in">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">{t('currentBalance') || 'Current Balance'}</h2>
            <div className="text-5xl font-bold text-green-400 mb-4 drop-shadow-lg">
              ETB {Number(wallet?.balance ?? profile?.balance ?? 0).toFixed(2)}
            </div>
            <div className="flex flex-col md:flex-row gap-3 justify-center">
              <Button onClick={() => setShowDepositModal(true)} variant="cyber" className="animate-bounce">💰 {t('deposit') || 'Deposit'}</Button>
              <Button onClick={() => setShowWithdrawalModal(true)} variant="cyber" disabled={Number(wallet?.balance ?? 0) <= 0}>💸 {t('withdraw') || 'Withdraw'}</Button>
              <Button onClick={() => setShowTransferModal(true)} variant="cyber" disabled={Number(wallet?.balance ?? 0) <= 0}>🔄 {t('transfer') || 'Transfer'}</Button>
            </div>
            <div className="mt-4 text-xs text-slate-400">{t('fastSecureEasyTransactions') || 'Fast, secure, and easy transactions'}</div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card-cyber p-4 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-bold text-green-400">
              ETB {transactions
                .filter(t => t.type === 'deposit' && t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </div>
            <div className="text-sm text-slate-400">{t('totalDeposits') || 'Total Deposits'}</div>
          </div>
          <div className="card-cyber p-4 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl mb-2">💸</div>
            <div className="text-2xl font-bold text-red-400">
              ETB {Math.abs(transactions
                .filter(t => t.type === 'withdrawal' && t.status === 'completed')
                .reduce((sum, t) => sum + t.amount, 0))
                .toFixed(2)}
            </div>
            <div className="text-sm text-slate-400">{t('totalWithdrawals') || 'Total Withdrawals'}</div>
          </div>
          <div className="card-cyber p-4 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl mb-2">🔄</div>
            <div className="text-2xl font-bold text-blue-400">
              {transactions.filter(t => t.type === 'transfer' && t.status === 'completed').length}
            </div>
            <div className="text-sm text-slate-400">{t('transfers') || 'Transfers'}</div>
          </div>
          <div className="card-cyber p-4 text-center transform hover:scale-105 transition-transform duration-200">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-yellow-400">
              {transactions.filter(t => t.type === 'game_win' && t.status === 'completed').length}
            </div>
            <div className="text-sm text-slate-400">{t('gamesWon') || 'Games Won'}</div>
          </div>
        </div>
        {/* Transactions */}
        <div className="panel-cyber p-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-white mb-4">{t('recentTransactions') || 'Recent Transactions'}</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-slate-400 mb-4">{t('noTransactionsYet') || 'No transactions yet'}</p>
              <Button onClick={() => setShowDepositModal(true)}>{t('makeFirstDeposit') || 'Make Your First Deposit'}</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 card-cyber transform hover:scale-102 transition-transform duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getTransactionIcon(transaction.type)}</div>
                    <div>
                      <div className="font-semibold text-white">{transaction.description}</div>
                      <div className="text-sm text-slate-400">
                        {transaction.type} • {formatDate(transaction.createdAt)}
                      </div>
                      {transaction.paymentMethod && (
                        <div className="text-xs text-slate-500">
                          Method: {transaction.paymentMethod}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
              <div className="text-center mt-6">
                <Button onClick={() => navigate('/transactions')} variant="cyber">{t('viewAllTransactions') || 'View All Transactions'}</Button>
              </div>
            </div>
          )}
        </div>
        {/* Modals */}
        {showDepositModal && (
          <DepositModal
            onClose={() => setShowDepositModal(false)}
            onSuccess={handleDepositSuccess}
            userId={user?.uid || ''}
          />
        )}
        {showWithdrawalModal && (
          <WithdrawalModal
            onClose={() => setShowWithdrawalModal(false)}
            onSuccess={handleWithdrawalSuccess}
            currentBalance={Number(profile?.balance || 0)}
          />
        )}
        {showTransferModal && (
          <PlayerTransferModal
            onClose={() => setShowTransferModal(false)}
            onSuccess={handleTransferSuccess}
            currentBalance={Number(profile?.balance || 0)}
            currentUserId={user?.uid || ''}
          />
        )}
      </div>
    </div>
  );
};

export default WalletPage;
