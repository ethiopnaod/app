import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuth } from '../hooks/useSimpleAuth';
import { GameService } from '../services/firebaseService';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/Select';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useLanguage } from '../contexts/LanguageContext';

const CreateGameModal: React.FC = () => {
  const { user, isLoading: authLoading, error: authError } = useSimpleAuth();
  const { t } = useLanguage();
  const [gameData, setGameData] = useState({
    title: '',
    entryFee: 10,
    maxPlayers: 4,
    prizePool: 40
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string | number) => {
    setGameData(prev => ({
      ...prev,
      [field]: value
    }));
    // Auto-calculate prize pool based on entry fee and max players
    if (field === 'entryFee' || field === 'maxPlayers') {
      const entryFee = field === 'entryFee' ? Number(value) : gameData.entryFee;
      const maxPlayers = field === 'maxPlayers' ? Number(value) : gameData.maxPlayers;
      setGameData(prev => ({
        ...prev,
        [field]: value,
        prizePool: entryFee * maxPlayers
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError(t('pleaseSignInToCreateGame') || 'Please sign in to create a game');
      return;
    }
    if (!gameData.title.trim()) {
      setError(t('pleaseEnterGameTitle') || 'Please enter a game title');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const gameId = await GameService.createGame({
        title: gameData.title,
        entryFee: gameData.entryFee,
        maxPlayers: gameData.maxPlayers,
        prizePool: gameData.prizePool,
        players: [user.uid],
        createdBy: user.uid,
        status: 'waiting'
      });
      navigate(`/game/${gameId}`);
    } catch {
      setError(t('failedToCreateGame') || 'Failed to create game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (authError || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="panel-cyber p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">{t('error') || 'Error'}</h2>
          <p className="text-red-400 mb-4">{authError || error}</p>
          <button onClick={() => navigate('/games')} className="btn-modern">
            {t('backToGames') || 'Back to Games'}
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="panel-cyber p-8 text-center">
          <h2 className="text-xl font-semibold text-white mb-4">{t('userNotFound') || 'User Not Found'}</h2>
          <button onClick={() => navigate('/')} className="btn-modern">
            {t('goHome') || 'Go Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate('/games')}
        className="back-button"
        aria-label={t('goBack') || 'Go back'}
      >
        
      </button>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="gaming-font text-4xl mb-4 gradient-text">{t('createNewGame') || 'Create New Game'}</h1>
          <p className="text-slate-300">{t('setupBingoAndInvite') || 'Set up your Bingo game and invite players'}</p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="panel-cyber p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-slate-300 font-medium mb-2">{t('gameTitle') || 'Game Title'}</label>
                <Input
                  type="text"
                  value={gameData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('enterGameName') || 'Enter game name...'}
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-2">{t('entryFeeEtb') || 'Entry Fee (ETB)'}</label>
                <Input
                  type="number"
                  value={gameData.entryFee}
                  onChange={(e) => handleInputChange('entryFee', Number(e.target.value))}
                  min="1"
                  max="1000"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">
                  {t('amountEachPlayerPays') || 'Amount each player pays to join'}
                </p>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-2">{t('maxPlayers') || 'Max Players'}</label>
                <Select value={String(gameData.maxPlayers)} onValueChange={(v) => handleInputChange('maxPlayers', Number(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectMaxPlayers') || 'Select max players'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 {t('players') || 'Players'}</SelectItem>
                    <SelectItem value="4">4 {t('players') || 'Players'}</SelectItem>
                    <SelectItem value="6">6 {t('players') || 'Players'}</SelectItem>
                    <SelectItem value="8">8 {t('players') || 'Players'}</SelectItem>
                    <SelectItem value="10">10 {t('players') || 'Players'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="card-cyber p-4">
                <h3 className="font-semibold text-white mb-2">{t('gameSummary') || 'Game Summary'}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">{t('entryFee') || 'Entry Fee'}:</span>
                    <span className="text-white">{t('etb') || 'ETB'} {gameData.entryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">{t('maxPlayers') || 'Max Players'}:</span>
                    <span className="text-white">{gameData.maxPlayers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">{t('prizePool') || 'Prize Pool'}:</span>
                    <span className="text-green-400 font-bold">{t('etb') || 'ETB'} {gameData.prizePool}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">{t('yourCut') || 'Your Cut'}:</span>
                    <span className="text-blue-400">{t('etb') || 'ETB'} {(gameData.prizePool * 0.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="card-cyber p-4">
                <h4 className="font-semibold text-yellow-400 mb-2">{t('gameRules') || 'Game Rules:'}</h4>
                <ul className="text-sm text-yellow-300 space-y-1">
                  <li>• {t('firstPlayerToCompleteLineWins') || 'First player to complete a line wins'}</li>
                  <li>• {t('gameStartsWhenAllPlayersJoin') || 'Game starts when all players join'}</li>
                  <li>• {t('numbersAreCalledAutomatically') || 'Numbers are called automatically'}</li>
                  <li>• {t('winnerTakes90Percent') || 'Winner takes 90% of prize pool'}</li>
                  <li>• {t('tenPercentPlatformFees') || '10% goes to platform fees'}</li>
                </ul>
              </div>
              <div className="flex space-x-3">
                <Button type="button" onClick={() => navigate('/games')} variant="cyber" className="flex-1">{t('cancel') || 'Cancel'}</Button>
                <Button type="submit" variant="cyber" className="flex-1" disabled={isLoading || !gameData.title.trim()}>
                  {isLoading ? t('creating') || 'Creating...' : t('createGame') || 'Create Game'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGameModal;
