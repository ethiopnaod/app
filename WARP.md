# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Auto-fix ESLint issues
npm run fix-unused

# Preview production build
npm run preview
```

### Backend Development
```bash
# Start Flask backend (from backend/ directory)
cd backend
python app.py

# Deploy backend to Render
./deploy-render.sh
# or on Windows
deploy-render.bat

# Setup Telegram webhook
python setup_telegram_webhook.py

# Run advanced Telegram bot
python run_advanced_bot.py
```

### Firebase Operations
```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy
```

### Testing & Debugging
```bash
# Run a single test file (if tests exist)
npm test -- --testNamePattern="specific test"

# Check TypeScript compilation
npx tsc -b

# Check for unused dependencies
npm run fix-unused
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Python Flask with modular structure
- **Database**: Firebase Firestore with comprehensive security rules
- **Authentication**: Firebase Auth with Google and email/password
- **Payments**: Chapa payment gateway integration
- **Real-time**: Firebase real-time listeners and WebSockets
- **Telegram Integration**: Advanced bot with payment features

### Key Architectural Patterns

#### Frontend Architecture
The frontend follows a component-based architecture with:
- **Service Layer**: Centralized business logic in `src/services/`
- **Context Providers**: React Context for auth, game state, and language
- **Component Hierarchy**: Reusable UI components with Radix UI primitives
- **Route Protection**: Protected routes with auth state management

#### Backend Architecture (Modular Flask)
```
backend/
├── app.py              # Main Flask application
├── config/             # Configuration management
│   ├── settings.py     # Environment-based config
├── database/           # Firebase connections
│   ├── firebase.py     # Firebase Admin SDK
├── routes/             # API route blueprints
│   ├── payment_routes.py   # Chapa payment endpoints
│   ├── telegram_routes.py  # Telegram webhook handlers
├── services/           # Business logic services
│   ├── chapa_service.py    # Payment processing
│   ├── telegram_service.py # Bot functionality
```

#### Authentication Flow
The app uses Firebase Auth with multiple authentication methods:
1. **Google OAuth**: Primary authentication via popup/redirect
2. **Email/Password**: Traditional sign-up/sign-in
3. **Anonymous Auth**: Guest access with account linking
4. **Admin Verification**: Multi-method admin identification (email, phone, UID, Telegram, first-user)

#### Real-time Game Architecture
Games use Firebase real-time listeners for:
- **Game Room State**: Player joining/leaving, game status updates
- **Number Calling**: Real-time bingo number announcements
- **Chat System**: Live in-game messaging
- **Wallet Updates**: Balance changes from transactions

### Data Models

#### Core Collections
- **users**: User profiles with comprehensive gaming statistics
- **games**: Game instances with state management
- **gameRooms**: Real-time game sessions
- **transactions**: Financial operations with Chapa integration
- **wallets**: User balance management
- **support_tickets**: Customer support system

#### Security Model
Firestore rules enforce:
- **Email Verification**: Required for financial operations
- **User Ownership**: Users can only access their own data
- **Admin Privileges**: Multi-method admin verification
- **Amount Limits**: Upper bounds on transactions (50,000 ETB)
- **Input Validation**: Strict validation on all user inputs

### Payment System Architecture

#### Chapa Integration
The payment system handles:
- **Deposits**: User wallet top-ups
- **Withdrawals**: Bank transfers
- **Game Entries**: Tournament and game fees
- **Player Transfers**: Peer-to-peer transactions
- **Webhook Processing**: Secure payment verification

#### Transaction Flow
1. Frontend initiates payment request
2. Backend creates Chapa transaction
3. User completes payment on Chapa's platform
4. Chapa sends webhook to backend
5. Backend verifies and updates user wallet
6. Frontend receives real-time balance update

### Telegram Bot Integration

#### Advanced Bot Features
- **Multi-language Support**: English and Amharic
- **Payment Processing**: Direct Telegram payments
- **Game Management**: Create/join games via bot
- **User Linking**: Connect Telegram accounts to web profiles
- **Admin Commands**: Administrative functions via Telegram

#### Bot Architecture
The Telegram service includes:
- **Webhook Handlers**: Process Telegram updates
- **Payment Providers**: Handle Telegram payments
- **User Management**: Link Telegram users to Firebase accounts
- **Game Integration**: Bridge between Telegram and web game rooms

## Important Configuration

### Environment Variables
Essential environment variables that must be configured:

#### Frontend (.env)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_BACKEND_URL=
VITE_CHAPA_PUBLIC_KEY=
```

#### Backend (.env in backend/)
```
CHAPA_SECRET_KEY=
FIREBASE_SERVICE_ACCOUNT_PATH=
TELEGRAM_BOT_TOKEN=
ENVIRONMENT=production
FRONTEND_URL=
CALLBACK_BASE_URL=
CORS_ORIGINS=
```

### Admin System
Admin access is granted through multiple verification methods:
- **Admin emails**: Configured in `AdminService.ADMIN_EMAILS`
- **Phone numbers**: Admin phone numbers in `AdminService.ADMIN_PHONE_NUMBERS`
- **UIDs**: Specific Firebase UIDs in `AdminService.ADMIN_UIDs`
- **Telegram IDs**: Admin Telegram user IDs
- **First user**: Users created within the first week get admin access

### Voice & Audio System
The platform includes comprehensive audio features:
- **Number Calling**: AI-powered voice announcements
- **Multi-language TTS**: English and Amharic support
- **Sound Effects**: Game events and interactions
- **Volume Controls**: User-configurable audio settings

## Development Guidelines

### Frontend Development
- Use TypeScript strictly - no `any` types without justification
- Follow React hooks patterns for state management
- Implement proper error boundaries for component failures
- Use Tailwind CSS classes consistently
- Leverage Radix UI components for accessibility

### Backend Development
- Follow Flask blueprint pattern for route organization
- Use Firebase Admin SDK for all database operations
- Implement proper error handling with structured responses
- Validate all inputs using the established patterns
- Use environment-based configuration for all external services

### Security Considerations
- All financial operations require email verification
- Implement rate limiting for sensitive endpoints
- Use Firebase security rules as the primary access control
- Validate amounts with upper limits (50,000 ETB max)
- Log all admin actions for audit trails

### Real-time Features
- Use Firebase listeners for real-time updates
- Implement proper cleanup for listeners to prevent memory leaks
- Handle connection states gracefully
- Use optimistic updates where appropriate

### Payment Integration
- Test all payment flows in Chapa's sandbox environment
- Implement proper webhook verification
- Handle payment failures gracefully
- Maintain transaction audit trails
- Support payment status reconciliation

### Telegram Bot Development
- Use the modular TelegramService for all bot operations
- Implement proper error handling for webhook failures
- Support both English and Amharic languages
- Link Telegram accounts to web app users for full feature access
- Handle payment provider integration securely

## File Structure Highlights

### Critical Frontend Files
- `src/App.tsx`: Main application with routing and layout
- `src/services/authService.ts`: Authentication service with multiple providers
- `src/services/adminService.ts`: Admin verification and management
- `src/services/firebaseService.ts`: Database operations and real-time listeners
- `src/firebase/config.ts`: Firebase configuration with Telegram Web App integration

### Critical Backend Files
- `backend/app.py`: Main Flask application with service initialization
- `backend/routes/payment_routes.py`: Chapa payment processing endpoints
- `backend/routes/telegram_routes.py`: Telegram webhook handlers
- `backend/services/chapa_service.py`: Payment gateway integration
- `backend/services/telegram_service.py`: Telegram bot functionality

### Configuration Files
- `firestore.rules`: Comprehensive Firestore security rules
- `firebase.json`: Firebase project configuration
- `package.json`: Frontend dependencies and scripts
- `backend/requirements.txt`: Python dependencies

## Deployment Notes

### Production Checklist
- Set all environment variables in production environment
- Configure Chapa webhooks to point to production backend
- Set up Telegram bot webhooks for production
- Deploy Firestore rules and indexes
- Test payment flows end-to-end
- Verify admin access functionality
- Check real-time features under load

### Quick Deployment
For rapid deployment, use the provided scripts:
- `./deploy.sh` (Linux/Mac) or `deploy.bat` (Windows) for complete deployment
- `QUICK_START.md` contains a 40-minute deployment guide
- `DEPLOYMENT_GUIDE.md` provides comprehensive deployment instructions

The platform is designed to support thousands of concurrent players with real-time gameplay, comprehensive payment processing, and advanced admin features.