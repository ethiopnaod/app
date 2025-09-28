import type { Wallet } from '../types/wallet';
// Wallet Service
export class WalletService {
  // Fetch wallet for current user, create if missing
  static async getUserWallet(): Promise<Wallet | null> {
    const user = auth.currentUser;
    if (!user) return null;
    const walletRef = doc(db, 'wallets', user.uid);
    const walletDoc = await getDoc(walletRef);
    if (!walletDoc.exists()) {
      // Create wallet with default values
      const defaultWallet: Wallet = {
        id: user.uid,
        userId: user.uid,
        balance: 0,
        currency: 'ETB',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastUpdated: new Date(),
        securityLevel: 'basic',
        isVerified: false,
        transferLimit: 1000,
        dailyTransferLimit: 1000,
        dailyTransferUsed: 0,
        lastTransferDate: '',
        securityQuestions: {
          question1: '',
          answer1: '',
          question2: '',
          answer2: ''
        },
        twoFactorEnabled: false,
        deviceFingerprint: '',
        lastLoginLocation: '',
        suspiciousActivityCount: 0,
        isLocked: false
      };
      await setDoc(walletRef, defaultWallet);
      return defaultWallet;
    }
    return { id: walletDoc.id, ...walletDoc.data() } as Wallet;
  }
}
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  setDoc,
  QueryDocumentSnapshot,
  startAfter
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  User
} from 'firebase/auth';
import { db, auth, googleProvider } from '../firebase/config';

// Types
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  balance: number;
  isAdmin: boolean;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  telegramId?: string;
  phoneNumber?: string;
  level?: number;
  experience?: number;
  gamesPlayed?: number;
  gamesWon?: number;
  totalEarnings?: number;
  achievements?: string[];
  badges?: string[];
  dailyStreak?: number; // consecutive days claimed
  lastDailyClaim?: string; // ISO date string
  freeGamePoints?: number; // points from free games
  settings?: {
    soundEnabled?: boolean;
    musicEnabled?: boolean;
    notificationsEnabled?: boolean;
    language?: string;
    theme?: string;
  };
}


export interface Game {
  id: string;
  title: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  players: string[];
  maxPlayers: number;
  entryFee: number;
  prizePool: number;
  winner?: string;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  createdBy: string;
  bingoCard?: number[][];
  calledNumbers: number[];
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'game_entry' | 'game_win' | 'bonus' | 'transfer';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: Timestamp;
  reference?: string;
  paymentMethod?: string;
  recipientId?: string;
  senderId?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  adminResponse?: string;
}

// Authentication Service
export class AuthService {
  static async signIn(email: string, password: string): Promise<User> {
    return signInWithEmailAndPassword(auth, email, password).then(result => result.user);
  }

  static async signInWithGoogle(): Promise<User> {
    try {
      await signInWithRedirect(auth, googleProvider);
      const result = await getRedirectResult(auth);
      if (result) {
        const user = result.user;
        const existingProfile = await UserService.getUserProfile();
        if (!existingProfile && user.email && user.displayName) {
          await UserService.createUserProfile(user.email, user.displayName);
        } else if (existingProfile) {
          await UserService.updateLastLogin();
        }
        return user;
      }
      throw new Error('No redirect result found');
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw new Error('Failed to sign in with Google');
    }
  }
}

// User Service
export class UserService {
  // Get user profile by current user
  static async getUserProfile(): Promise<UserProfile | null> {
    const user = auth.currentUser;
    if (!user) return null;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;
    return { id: userDoc.id, ...userDoc.data() } as UserProfile;
  }

  // Create user profile document
  static async createUserProfile(email: string, displayName: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      email,
      displayName,
      balance: 0,
      isAdmin: false,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      settings: {},
    }, { merge: true });
  }

  // Update last login timestamp
  static async updateLastLogin(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      lastLogin: serverTimestamp(),
    });
  }
  static async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    let userDocSnap, userDocId;
    try {
      if (auth.currentUser) {
        const userQuery = query(collection(db, 'users'), where('email', '==', auth.currentUser.email));
        const querySnapshot = await getDocs(userQuery);
        if (querySnapshot.empty) throw new Error('User profile not found');
        userDocSnap = querySnapshot.docs[0];
        userDocId = userDocSnap.id;
      }
      const currentProfile = userDocSnap.data() as UserProfile;
      const changedFields: Partial<UserProfile> = {};
      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          const newValue = (updates as Record<string, unknown>)[key];
          const oldValue = ((currentProfile as unknown) as Record<string, unknown>)[key];
          if (typeof newValue === 'object' && newValue !== null && oldValue && typeof oldValue === 'object') {
            const nestedChanged: Record<string, unknown> = {};
            for (const nestedKey in newValue as Record<string, unknown>) {
              if ((newValue as Record<string, unknown>)[nestedKey] !== (oldValue as Record<string, unknown>)[nestedKey]) {
                nestedChanged[nestedKey] = (newValue as Record<string, unknown>)[nestedKey];
              }
            }
            if (Object.keys(nestedChanged).length > 0) {
              (changedFields as Record<string, unknown>)[key] = { ...oldValue, ...nestedChanged };
            }
          } else if (newValue !== undefined && newValue !== oldValue) {
            (changedFields as Record<string, unknown>)[key] = newValue;
          }
        }
      }
      if (Object.keys(changedFields).length === 0) {
        return;
      }
      await updateDoc(doc(db, 'users', userDocId), changedFields as Record<string, unknown>);
    } catch {
      throw new Error('Failed to update user profile');
    }
  }

  static async updateBalance(amount: number): Promise<void> {
    try {
      const userQuery = query(collection(db, 'users'), where('email', '==', auth.currentUser?.email));
      const querySnapshot = await getDocs(userQuery);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const currentBalance = userDoc.data().balance || 0;
        await updateDoc(doc(db, 'users', userDoc.id), {
          balance: currentBalance + amount
        });
      }
    } catch (error) {
      throw new Error('Failed to update balance');
    }
  }

  static async transferFunds(toUserId: string, amount: number): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated');
    const currentUserQuery = query(collection(db, 'users'), where('email', '==', currentUser.email));
    const currentUserSnapshot = await getDocs(currentUserQuery);
    if (currentUserSnapshot.empty) throw new Error('Current user not found');
    const currentUserDoc = currentUserSnapshot.docs[0];
    const currentUserId = currentUserDoc.id;
    const currentBalance = currentUserDoc.data().balance || 0;
    if (currentBalance < amount) throw new Error('Insufficient balance');
    const recipientDocRef = doc(db, 'users', toUserId);
    const recipientDoc = await getDoc(recipientDocRef);
    if (!recipientDoc.exists()) throw new Error('Recipient not found');
  // Removed unused recipientBalance
    await runTransaction(db, async (transaction) => {
      const senderSnap = await transaction.get(doc(db, 'users', currentUserId));
      const recipientSnap = await transaction.get(recipientDocRef);
      const senderBalance = senderSnap.data().balance || 0;
      const receiverBalance = recipientSnap.data().balance || 0;
      if (senderBalance < amount) throw new Error('Insufficient balance');
      transaction.update(doc(db, 'users', currentUserId), {
        balance: senderBalance - amount
      });
      transaction.update(recipientDocRef, {
        balance: receiverBalance + amount
      });
      const transferData = {
        userId: currentUserId,
        type: 'transfer',
        amount: -amount,
        status: 'completed',
        description: `Transfer to ${recipientSnap.data().displayName}`,
        createdAt: serverTimestamp(),
        recipientId: toUserId
      };
      const recipientTransferData = {
        userId: toUserId,
        type: 'transfer',
        amount: amount,
        status: 'completed',
        description: `Transfer from ${senderSnap.data().displayName}`,
        createdAt: serverTimestamp(),
        senderId: currentUserId
      };
      transaction.set(doc(collection(db, 'transactions')), transferData);
      transaction.set(doc(collection(db, 'transactions')), recipientTransferData);
    });
  }

  static async claimDailyReward(): Promise<{ streak: number; lastClaim: string; rewardGiven: boolean }> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) throw new Error('User profile not found');
    const data = userDoc.data() as UserProfile;
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
  let streak = data.dailyStreak || 0;
  const lastClaim = data.lastDailyClaim || '';
  let rewardGiven = false;
    if (lastClaim === todayStr) {
      return { streak, lastClaim, rewardGiven };
    }
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (lastClaim === yesterdayStr) {
      streak += 1;
    } else {
      streak = 1;
    }
    if (streak >= 3) {
      const newBalance = (data.balance || 0) + 10;
      await updateDoc(userDocRef, {
        balance: newBalance,
        dailyStreak: 0,
        lastDailyClaim: todayStr
      });
      rewardGiven = true;
      streak = 0;
    } else {
      await updateDoc(userDocRef, {
        dailyStreak: streak,
        lastDailyClaim: todayStr
      });
    }
    return { streak, lastClaim: todayStr, rewardGiven };
  }

  static async awardFreeGamePoints(): Promise<number> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) throw new Error('User profile not found');
    const data = userDoc.data() as UserProfile;
    const currentPoints = data.freeGamePoints || 0;
    const newPoints = currentPoints + 10;
    await updateDoc(userDocRef, { freeGamePoints: newPoints });
    return newPoints;
  }

  static async getAllUsers(limitCount: number = 50, startAfterDoc?: QueryDocumentSnapshot | undefined): Promise<UserProfile[]> {
    try {
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(limitCount));
      if (startAfterDoc) {
        q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), startAfter(startAfterDoc), limit(limitCount));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserProfile);
    } catch {
      throw new Error('Failed to get all users');
    }
  }

}

// Game Service
export class GameService {
  static async createGame(gameData: Omit<Game, 'id' | 'createdAt' | 'calledNumbers'>): Promise<string> {
    try {
      const game: Omit<Game, 'id'> = {
        ...gameData,
        createdAt: serverTimestamp() as Timestamp,
        calledNumbers: [],
        status: 'waiting'
      };
      
      const docRef = await addDoc(collection(db, 'games'), game);
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to create game');
    }
  }

  static async getGames(status?: Game['status'], limitCount: number = 50, startAfterDoc?: QueryDocumentSnapshot | undefined): Promise<Game[]> {
    try {
      let q = query(collection(db, 'games'), orderBy('createdAt', 'desc'), limit(limitCount));
      if (status) {
        q = query(collection(db, 'games'), where('status', '==', status), orderBy('createdAt', 'desc'), limit(limitCount));
      }
      if (startAfterDoc) {
        q = query(collection(db, 'games'), orderBy('createdAt', 'desc'), startAfter(startAfterDoc), limit(limitCount));
        if (status) {
          q = query(collection(db, 'games'), where('status', '==', status), orderBy('createdAt', 'desc'), startAfter(startAfterDoc), limit(limitCount));
        }
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...Object.assign({}, doc.data()) }) as Game);
    } catch (error) {
      throw new Error('Failed to get games');
    }
  }

  static async getLeaderboard(type: 'global' | 'weekly' | 'monthly' = 'global'): Promise<{
    id: string;
    type: string;
    period: string;
    players: Array<{
      playerId: string;
      playerName: string;
      avatar?: string;
      score: number;
      rank: number;
      change: number;
    }>;
    lastUpdated: string;
  }> {
    try {
      const now = new Date();
      const period = type === 'monthly'
        ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        : type === 'weekly'
          ? `${now.getFullYear()}-W${Math.ceil((((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7)}`
          : 'all-time';
      const docId = type === 'global' ? 'global' : `${type}-${period}`;

      const lbDoc = await getDoc(doc(db, 'leaderboards', docId));
      if (lbDoc.exists()) {
        const data: any = lbDoc.data();
        return {
          id: lbDoc.id,
          type: data.type || type,
          period: data.period || period,
          players: Array.isArray(data.players) ? data.players : [],
          lastUpdated: data.lastUpdated || now.toISOString(),
        };
      }

      return {
        id: docId,
        type,
        period,
        players: [],
        lastUpdated: now.toISOString(),
      };
    } catch (error) {
      return {
        id: `${type}-leaderboard`,
        type,
        period: 'all-time',
        players: [],
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  static async getGame(gameId: string): Promise<Game | null> {
    try {
      const docRef = doc(db, 'games', gameId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Game;
      }
      return null;
    } catch (error) {
      throw new Error('Failed to get game');
    }
  }

  static async joinGame(gameId: string, userId: string): Promise<void> {
    try {
      const game = await this.getGame(gameId);
      if (!game) throw new Error('Game not found');
      
      if (game.players.includes(userId)) {
        throw new Error('Already joined this game');
      }
      
      if (game.players.length >= game.maxPlayers) {
        throw new Error('Game is full');
      }
      
      await updateDoc(doc(db, 'games', gameId), {
        players: [...game.players, userId]
      });
    } catch (error) {
      throw new Error('Failed to join game');
    }
  }

  static async startGame(gameId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'games', gameId), {
        status: 'active',
        startedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to start game');
    }
  }

  static async endGame(gameId: string, winnerId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'games', gameId), {
        status: 'completed',
        winner: winnerId,
        endedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to end game');
    }
  }

  static onGameUpdate(gameId: string, callback: (game: Game) => void): () => void {
    return onSnapshot(doc(db, 'games', gameId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Game);
      }
    });
  }
}

// Transaction Service
export class TransactionService {
  static async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
    try {
      const transaction: Omit<Transaction, 'id'> = {
        ...transactionData,
        createdAt: serverTimestamp() as Timestamp
      };
      
      const docRef = await addDoc(collection(db, 'transactions'), transaction);
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to create transaction');
    }
  }

  static async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction);
    } catch (error) {
      throw new Error('Failed to get transactions');
    }
  }

  static async updateTransactionStatus(transactionId: string, status: Transaction['status']): Promise<void> {
    try {
      await updateDoc(doc(db, 'transactions', transactionId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to update transaction');
    }
  }

  static async getAllTransactions(limitCount: number = 100, startAfterDoc?: QueryDocumentSnapshot | undefined): Promise<Transaction[]> {
    try {
      let q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), limit(limitCount));
      if (startAfterDoc) {
        q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'), startAfter(startAfterDoc), limit(limitCount));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Transaction);
    } catch (error) {
      throw new Error('Failed to get all transactions');
    }
  }
}

// Support Service
export class SupportService {
  static async createTicket(ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const ticket: Omit<SupportTicket, 'id'> = {
        ...ticketData,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };
      
      const docRef = await addDoc(collection(db, 'support_tickets'), ticket);
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to create support ticket');
    }
  }

  static async getUserTickets(userId: string): Promise<SupportTicket[]> {
    try {
      const q = query(
        collection(db, 'support_tickets'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as SupportTicket);
    } catch (error) {
      throw new Error('Failed to get support tickets');
    }
  }

  static async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<void> {
    try {
      await updateDoc(doc(db, 'support_tickets', ticketId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to update ticket');
    }
  }

  static async getAllTickets(): Promise<SupportTicket[]> {
    try {
      const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as SupportTicket);
    } catch (error) {
      throw new Error('Failed to get all tickets');
    }
  }
}

// Payment Service (Chapa Integration)
export class PaymentService {
  static async createDeposit(amount: number, userId: string): Promise<{ transactionId: string; paymentUrl: string }> {
    try {
      // Create transaction record
      const transactionId = await TransactionService.createTransaction({
        userId,
        type: 'deposit',
        amount,
        status: 'pending',
        description: `Deposit of ${amount} ETB`,
        paymentMethod: 'chapa'
      });

      // In a real implementation, you would call Chapa API here
      // For now, we'll simulate the payment URL
      const paymentUrl = `https://checkout.chapa.co/pay/${transactionId}`;
      
      return { transactionId, paymentUrl };
    } catch (error) {
      throw new Error('Failed to create deposit');
    }
  }

  static async createWithdrawal(amount: number): Promise<string> {
    try {
      const transactionId = await TransactionService.createTransaction({
        userId: auth.currentUser?.uid || '', // Assuming userId is available from auth context
        type: 'withdrawal',
        amount: -amount,
        status: 'pending',
        description: `Withdrawal of ${amount} ETB`,
        paymentMethod: 'bank_transfer'
      });

      // In a real implementation, you would call Chapa API here
      return transactionId;
    } catch (error) {
      throw new Error('Failed to create withdrawal');
    }
  }

  static async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      // In a real implementation, you would verify with Chapa API
      // For now, we'll simulate verification
      await TransactionService.updateTransactionStatus(transactionId, 'completed');
      return true;
    } catch (error) {
      throw new Error('Failed to verify payment');
    }
  }
}

// Admin-only utilities
export class AdminService {
  static async updateLeaderboard(type: 'global' | 'weekly' | 'monthly' = 'global'): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Not authenticated');

    // Verify admin via users doc
    const adminDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!adminDoc.exists() || !adminDoc.data()?.isAdmin) {
      throw new Error('Admin privileges required');
    }

    // Fetch all users to aggregate scores (allowed by rules for admins)
    const usersSnap = await getDocs(collection(db, 'users'));
    const players = usersSnap.docs.map((d) => {
      const data = d.data() as any;
      const gamesWon = Number(data.gamesWon || 0);
      const gamesPlayed = Number(data.gamesPlayed || 0);
      const level = Number(data.level || 1);
      const experience = Number(data.experience || 0);
      const totalEarnings = Number(data.totalEarnings || 0);
      const score = gamesWon * 100 + gamesPlayed * 10 + level * 50 + Math.floor(experience / 10) + Math.floor(totalEarnings);
      return {
        playerId: d.id,
        playerName: data.displayName || data.email || 'Player',
        avatar: data.photoURL || '',
        score,
        rank: 0,
        change: 0,
      };
    });

    players.sort((a, b) => b.score - a.score);
    players.forEach((p, i) => { p.rank = i + 1; });

    const now = new Date();
    const period = type === 'monthly'
      ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      : type === 'weekly'
        ? `${now.getFullYear()}-W${Math.ceil((((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7)}`
        : 'all-time';
    const docId = type === 'global' ? 'global' : `${type}-${period}`;

    await setDoc(doc(db, 'leaderboards', docId), {
      id: docId,
      type,
      period,
      players,
      lastUpdated: serverTimestamp(),
    }, { merge: true });
  }
}
