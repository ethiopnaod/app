export type Language = 'en' | 'am';

export interface LanguageStrings {
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  confirm: string;
  back: string;
  next: string;
  continue: string;
  getStarted: string;
  save: string;
  delete: string;
  edit: string;
  close: string;
  
  // Navigation
  home: string;
  games: string;
  profile: string;
  settings: string;
  wallet: string;
  leaderboard: string;
  shop: string;
  support: string;
  
  // Auth
  signIn: string;
  signUp: string;
  signOut: string;
  continueWithGoogle: string;
  phoneRegistration: string;
  sharePhoneNumber: string;
  phoneRegistered: string;
  welcomeToBingo: string;
  advancedGamingExperience: string;
  
  // Game
  gameModes: string;
  classicBingo: string;
  speedBingo: string;
  tournamentMode: string;
  practiceMode: string;
  dailyChallenge: string;
  joinGame: string;
  createGame: string;
  gameLobby: string;
  waitingForPlayers: string;
  players: string;
  entryFee: string;
  duration: string;
  difficulty: string;
  
  // User Profile
  level: string;
  experience: string;
  balance: string;
  gamesPlayed: string;
  gamesWon: string;
  achievements: string;
  totalEarnings: string;
  
  // Features
  realTime: string;
  multiplayer: string;
  achievementsSystem: string;
  customization: string;
  voiceChat: string;
  leaderboards: string;
  dailyChallenges: string;
  seasonalEvents: string;
  
  // Tutorial
  tutorial: string;
  tutorialWelcome: string;
  tutorialCreateGame: string;
  tutorialJoinGame: string;
  tutorialPlayGame: string;
  tutorialWallet: string;
  tutorialSettings: string;
  
  // Settings
  soundEnabled: string;
  musicEnabled: string;
  notificationsEnabled: string;
  language: string;
  theme: string;
  graphicsQuality: string;
  soundVolume: string;
  musicVolume: string;
  
  // Wallet
  deposit: string;
  withdraw: string;
  transfer: string;
  transactionHistory: string;
  recentActivity: string;
  
  // Achievements
  achievementUnlocked: string;
  firstVictory: string;
  speedDemon: string;
  tournamentChampion: string;
  socialButterfly: string;
  achievementCollector: string;
  
  // Errors
  errorOccurred: string;
  tryAgain: string;
  networkError: string;
  authenticationError: string;
  gameNotFound: string;
  insufficientBalance: string;
  
  // Success Messages
  phoneRegisteredSuccess: string;
  gameCreatedSuccess: string;
  gameJoinedSuccess: string;
  depositSuccess: string;
  withdrawalSuccess: string;
  transferSuccess: string;
  levelUp: string;
  signInSuccess: string;
  
  // Welcome Messages
  telegramWelcomeMessage: string;
  webWelcomeMessage: string;
  playGames: string;
  earnRewards: string;
  
  // Bot Messages
  botWelcome: string;
  botHelp: string;
  botCommands: string;
  botStart: string;
  botStats: string;
  botBalance: string;
  botGames: string;
}

export const translations: Record<Language, LanguageStrings> = {
  en: {
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    continue: 'Continue',
    getStarted: 'Get Started',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    
    // Navigation
    home: 'Lobby',
    games: 'Arcade',
    profile: 'Player Card',
    settings: 'Control Room',
    wallet: 'Vault',
    leaderboard: 'Hall of Fame',
    shop: 'Item Shop',
    support: 'Help Desk',
    
    // Auth
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    continueWithGoogle: 'Continue with Google',
    phoneRegistration: 'Phone Registration',
    sharePhoneNumber: 'Share Phone Number',
    phoneRegistered: 'Phone Registered',
    welcomeToBingo: 'Welcome to the Bingo Arena',
    advancedGamingExperience: 'A next‑gen, adrenaline‑pumping bingo experience',
    
    // Game
    gameModes: 'Play Styles',
    classicBingo: 'Classic Board',
    speedBingo: 'Turbo Bingo',
    tournamentMode: 'Tournament Arena',
    practiceMode: 'Training Ground',
    dailyChallenge: 'Daily Quest',
    joinGame: 'Quick Join',
    createGame: 'Host Match',
    gameLobby: 'Match Lobby',
    waitingForPlayers: 'Waiting for contenders…',
    players: 'players',
    entryFee: 'Entry Fee',
    duration: 'Duration',
    difficulty: 'Difficulty',
    
    // User Profile
    level: 'Level',
    experience: 'XP',
    balance: 'Credits',
    gamesPlayed: 'Matches Played',
    gamesWon: 'Victories',
    achievements: 'Badges',
    totalEarnings: 'Lifetime Winnings',
    
    // Features
    realTime: 'Real‑time Action',
    multiplayer: 'Multiplayer Arenas',
    achievementsSystem: 'Badge System',
    customization: 'Loadout',
    voiceChat: 'Team Comms',
    leaderboards: 'Global Rankings',
    dailyChallenges: 'Daily Quests',
    seasonalEvents: 'Seasonal Events',
    
    // Tutorial
    tutorial: 'Tutorial',
    tutorialWelcome: 'Welcome to Bingo Platform!',
    tutorialCreateGame: 'Learn how to create games',
    tutorialJoinGame: 'Learn how to join games',
    tutorialPlayGame: 'Learn how to play Bingo',
    tutorialWallet: 'Learn about your wallet',
    tutorialSettings: 'Customize your experience',
    
    // Settings
    soundEnabled: 'Sound Enabled',
    musicEnabled: 'Music Enabled',
    notificationsEnabled: 'Notifications Enabled',
    language: 'Language',
    theme: 'Theme',
    graphicsQuality: 'Graphics Quality',
    soundVolume: 'Sound Volume',
    musicVolume: 'Music Volume',
    
    // Wallet
    deposit: 'Top Up',
    withdraw: 'Cash Out',
    transfer: 'Send Credits',
    transactionHistory: 'Vault History',
    recentActivity: 'Recent Plays',
    
    // Achievements
    achievementUnlocked: 'Badge Unlocked',
    firstVictory: 'First Win',
    speedDemon: 'Turbo Master',
    tournamentChampion: 'Arena Champion',
    socialButterfly: 'Party Pro',
    achievementCollector: 'Badge Collector',
    
    // Errors
    errorOccurred: 'Something went sideways',
    tryAgain: 'Try that again',
    networkError: 'Connection lost',
    authenticationError: 'Login required',
    gameNotFound: 'Match not found',
    insufficientBalance: 'Not enough credits',
    
    // Success Messages
    phoneRegisteredSuccess: 'Phone linked! ✔',
    gameCreatedSuccess: 'Match ready to launch! 🚀',
    gameJoinedSuccess: 'You joined the arena! 💥',
    depositSuccess: 'Top‑up confirmed! 💎',
    withdrawalSuccess: 'Cash‑out complete! 💸',
    transferSuccess: 'Credits sent! 📤',
    levelUp: 'Level Up! ⬆️',
    signInSuccess: 'Welcome back, champion! 🏆',
    
    // Welcome Messages
    telegramWelcomeMessage: 'Welcome to the Bingo Arena! 🎮',
    webWelcomeMessage: 'Welcome to the Bingo Arena! 🎮',
    playGames: 'Play & Win',
    earnRewards: 'Earn Rewards',
    
    // Bot Messages
    botWelcome: 'Welcome to the Bingo Arena! 🎮',
    botHelp: 'Need backup? Type /help',
    botCommands: 'Commands: /start /stats /balance /games',
    botStart: 'Booting up your adventure…',
    botStats: 'Your battle stats',
    botBalance: 'Your vault balance',
    botGames: 'Available matches'
  },
  
  am: {
    // Common
    loading: 'በመጫን ላይ...',
    error: 'ስህተት',
    success: 'ተሳክቷል',
    cancel: 'ሰርዝ',
    confirm: 'ያረጋግጥ',
    back: 'ተመለስ',
    next: 'ቀጣይ',
    continue: 'ቀጥል',
    getStarted: 'ጀምር',
    save: 'አስቀምጥ',
    delete: 'ሰርዝ',
    edit: 'አርትዕ',
    close: 'ዝጋ',
    
    // Navigation
    home: 'ሎቢ',
    games: 'አርኬድ',
    profile: 'የተጫዋች መታወቂያ',
    settings: 'መቆጣጠሪያ ክፍል',
    wallet: 'ቫልት',
    leaderboard: 'የክብር ማህደር',
    shop: 'ሱቅ',
    support: 'ዕርዳታ',
    
    // Auth
    signIn: 'ግባ',
    signUp: 'ይመዝገቡ',
    signOut: 'ውጣ',
    continueWithGoogle: 'በ Google ይቀጥሉ',
    phoneRegistration: 'የስልክ ምዝገባ',
    sharePhoneNumber: 'የስልክ ቁጥር ያጋራ',
    phoneRegistered: 'የስልክ ቁጥር ተመዝግቧል',
    welcomeToBingo: 'ወደ ቢንጎ አሬና እንኳን በደህና መጡ',
    advancedGamingExperience: 'ዘመናዊ እና ከፍተኛ የጨዋታ ልምድ',
    
    // Game
    gameModes: 'የጓደኝ መንገድ',
    classicBingo: 'ዘመናዊ ቢንጎ',
    speedBingo: 'ታርቦ ቢንጎ',
    tournamentMode: 'የትዕይንት አሬና',
    practiceMode: 'ስልጠና መድረክ',
    dailyChallenge: 'ዕለታዊ ተግባር',
    joinGame: 'በፍጥነት ግባ',
    createGame: 'ጨዋታ አስተናግድ',
    gameLobby: 'የጨዋታ ሎቢ',
    waitingForPlayers: 'ተወዳጆችን እየጠበቅን ነው…',
    players: 'ተጫዋቾች',
    entryFee: 'የመግቢያ ክፍያ',
    duration: 'ጊዜ',
    difficulty: 'አስቸጋሪነት',
    
    // User Profile
    level: 'ደረጃ',
    experience: 'ኤክስፒ',
    balance: 'ክሬዲት',
    gamesPlayed: 'የተጫወቱ ጨዋታዎች',
    gamesWon: 'ድሎች',
    achievements: 'ባዶጅዎች',
    totalEarnings: 'አጠቃላይ ሽልማት',
    
    // Features
    realTime: 'በቅጽበት እርምጃ',
    multiplayer: 'ብዙ‑ተጫዋች አሬና',
    achievementsSystem: 'የባዶጅ ስርዓት',
    customization: 'ሎዳውት',
    voiceChat: 'የቡድን ግንኙነት',
    leaderboards: 'ዓለም አቀፍ ደረጃ',
    dailyChallenges: 'ዕለታዊ ተግባሮች',
    seasonalEvents: 'የወቅት ዝግጅቶች',
    
    // Tutorial
    tutorial: 'ስልጠና',
    tutorialWelcome: 'ወደ ቢንጎ መድረኳ እንኳን በደህና መጡ!',
    tutorialCreateGame: 'ጨዋታዎችን እንዴት እንደሚፈጥሩ ይማሩ',
    tutorialJoinGame: 'ጨዋታዎችን እንደሚቀላቀሉ ይማሩ',
    tutorialPlayGame: 'ቢንጎ እንደሚጫወቱ ይማሩ',
    tutorialWallet: 'ስለ የገንዘብ ቦርሳዎ ይማሩ',
    tutorialSettings: 'ልምድዎን ያስተካክሉ',
    
    // Settings
    soundEnabled: 'ድምፅ የተነቃ',
    musicEnabled: 'ሙዚቃ የተነቃ',
    notificationsEnabled: 'ማስታወቂያዎች የተነቁ',
    language: 'ቋንቋ',
    theme: 'ገጽታ',
    graphicsQuality: 'የግራፊክ ጥራት',
    soundVolume: 'የድምፅ መጠን',
    musicVolume: 'የሙዚቃ መጠ��',
    
    // Wallet
    deposit: 'ክሬዲት ጨምር',
    withdraw: 'ክሬዲት አውጣ',
    transfer: 'ክሬዲት ላክ',
    transactionHistory: 'የቫልት ታሪክ',
    recentActivity: 'የቅርብ ጊዜ እንቅስቃሴ',
    
    // Achievements
    achievementUnlocked: 'ባዶጅ ተከፍቷል',
    firstVictory: 'የመጀመሪያ ድል',
    speedDemon: 'ታርቦ አለቃ',
    tournamentChampion: 'የአሬና ቻምፒዮን',
    socialButterfly: 'ፓርቲ ፕሮ',
    achievementCollector: 'የባዶጅ ሰብሳቢ',
    
    // Errors
    errorOccurred: 'ችግኝ ተፈጥሯል',
    tryAgain: 'እንደገና ይሞክሩ',
    networkError: 'ኮኔክሽኑ ተቋርጧል',
    authenticationError: 'መግቢያ ያስፈልጋል',
    gameNotFound: 'ጨዋታ አልተገኘም',
    insufficientBalance: 'የበቂ ክሬዲት የለም',
    
    // Success Messages
    phoneRegisteredSuccess: 'ስልክ ተገናኝቷል! ✔',
    gameCreatedSuccess: 'ጨዋታ ዝግጁ ነው! 🚀',
    gameJoinedSuccess: 'አሬናውን ገብተዋል! 💥',
    depositSuccess: 'ክሬዲት ተጨመረ! 💎',
    withdrawalSuccess: 'ክሬዲት ተወጣ! 💸',
    transferSuccess: 'ክሬዲት ተልኳል! 📤',
    levelUp: 'ደረጃ ጨመረ! ⬆️',
    signInSuccess: 'እንኳን በደህና መጡ ሻምፒዮን! 🏆',
    
    // Welcome Messages
    telegramWelcomeMessage: 'ወደ ቢንጎ አሬና እንኳን በደህና መጡ! 🎮',
    webWelcomeMessage: 'ወደ ቢንጎ አሬና እንኳን በደህና መጡ! 🎮',
    playGames: 'ጨዋታ ጫወቱ',
    earnRewards: 'ሽልማት አግኙ',
    
    // Bot Messages
    botWelcome: 'ወደ ቢንጎ አሬና እንኳን በደህና መጡ! 🎮',
    botHelp: 'እገዛ እፈልጋለሁ? /help ተጠቀሙ',
    botCommands: 'ትዕዛዞች: /start /stats /balance /games',
    botStart: 'ጉዞዎ እየጀመረ ነው…',
    botStats: 'የጨዋታ ስታትስቲክስ',
    botBalance: 'የቫልት ቀሪ',
    botGames: 'የሚገኙ ጨዋታዎች'
  }
};

// Language management
class LanguageManager {
  private currentLanguage: Language = 'en';

  constructor() {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'am')) {
      this.currentLanguage = savedLanguage;
    } else {
      // Auto-detect language based on browser
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('am')) {
        this.currentLanguage = 'am';
      }
    }
    
    this.applyLanguage();
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    this.applyLanguage();
  }

  t(key: keyof LanguageStrings): string {
    return translations[this.currentLanguage][key] || key;
  }

  private applyLanguage(): void {
    // Apply language-specific CSS
    document.documentElement.setAttribute('lang', this.currentLanguage);
    document.documentElement.setAttribute('data-language', this.currentLanguage);
    
    // Apply Amharic font if needed
    if (this.currentLanguage === 'am') {
      document.documentElement.classList.add('amharic-font');
    } else {
      document.documentElement.classList.remove('amharic-font');
    }
  }
}

export const languageManager = new LanguageManager();

// Helper function for translations
export const t = (key: keyof LanguageStrings): string => {
  return languageManager.t(key);
};
