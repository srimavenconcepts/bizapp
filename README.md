# BizBites - Food Delivery App with Authentication

A complete React Native food delivery application built with Expo, featuring user authentication, favorites management, push notifications, and more.

## 🚀 Features

### 🔐 Authentication System
- **Welcome/Onboarding Flow**: First-time users see a welcome screen with login options
- **Optional Login**: Users can skip login and use the app as guests
- **Email Registration**: Simple email/password registration with validation
- **Secure Login**: Email/password authentication with error handling
- **Persistent Sessions**: Users stay logged in across app restarts
- **Guest Mode**: Full app functionality available without login (limited features)

### 📱 Core Features
- **Search & Browse**: Discover restaurants and food deals
- **Categories**: Browse by food types, cuisines, and preferences
- **Favorites**: Save favorite restaurants and dishes (enhanced for authenticated users)
- **Recently Visited**: Track and quickly revisit previously viewed deals
- **Push Notifications**: Real-time notifications for orders, promotions, and updates
- **Account Management**: Profile management and app settings

### 🎯 User Experience
- **Seamless Navigation**: Bottom tab navigation with stack navigation for details
- **Responsive Design**: Optimized for all mobile screen sizes
- **Modern UI**: Clean, professional design with consistent styling
- **Error Handling**: Comprehensive error handling and user feedback

## 📋 Authentication Flow

### First-Time Users
1. **Welcome Screen**: Introduction to BizBites with login options
2. **Choice**: Sign up, sign in, or continue as guest
3. **Registration**: Name, email, password with validation
4. **Verification**: Email format validation and password requirements
5. **Success**: Automatic login after successful registration

### Returning Users
1. **Auto-Login**: Automatic authentication check on app start
2. **Session Management**: Persistent login state across app sessions
3. **Logout**: Secure logout with confirmation dialog

### Guest Users
1. **Limited Features**: Access to browsing and basic functionality
2. **Upgrade Prompts**: Gentle encouragement to create account for enhanced features
3. **Data Persistence**: Local storage for recently visited items

## 🛠 Technical Implementation

### Authentication Service
- **Local Storage**: AsyncStorage for user data and session management
- **Mock API**: Simulated backend for development and testing
- **Security**: Password hashing simulation and secure token management
- **Data Management**: User favorites, preferences, and profile data

### State Management
- **React Context**: Global authentication state management
- **Persistent State**: Automatic state restoration on app restart
- **Real-time Updates**: Immediate UI updates on authentication changes

### Navigation Structure
```
App
├── AuthStack (Unauthenticated)
│   ├── WelcomeScreen
│   ├── LoginScreen
│   └── RegisterScreen
└── MainStack (Authenticated/Guest)
    ├── TabNavigator
    │   ├── Home (SearchOffers)
    │   ├── Categorize
    │   ├── Favorites
    │   └── Account
    ├── OfferDetails
    ├── Notifications
    └── Account Management
```

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Expo Go app (for testing on device)

### Installation Steps
1. **Extract the project files**
   ```bash
   unzip BizBites_Authentication.zip
   cd FoodDeliveryApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Test the app**
   - Scan QR code with Expo Go (mobile)
   - Press 'w' for web testing
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator

## 🧪 Testing the Authentication Flow

### Test User Registration
1. Open the app (first time users see Welcome screen)
2. Tap "Get Started" → "Sign Up"
3. Enter test details:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
4. Tap "Create Account"
5. Verify successful login and navigation to main app

### Test User Login
1. If already registered, tap "Sign In"
2. Enter credentials
3. Verify successful authentication

### Test Guest Mode
1. On Welcome screen, tap "Continue as Guest"
2. Explore app functionality
3. Notice authentication prompts in Account and Favorites sections

### Test Features by Authentication Status

#### Authenticated Users
- ✅ Full access to all features
- ✅ Persistent favorites across sessions
- ✅ Profile management
- ✅ Order history (coming soon)
- ✅ Personalized recommendations

#### Guest Users
- ✅ Browse restaurants and deals
- ✅ View offer details
- ✅ Recently visited tracking (local only)
- ✅ Basic notifications
- ❌ Persistent favorites (prompts to sign up)
- ❌ Profile management (prompts to sign up)

## 🔧 Configuration

### Push Notifications
- Configured for Expo's push notification service
- Test notifications available in NotificationScreen
- Production-ready for app store deployment

### Storage
- AsyncStorage for local data persistence
- Automatic data migration and cleanup
- Secure storage practices

## 🚀 Deployment Ready

### Production Checklist
- ✅ Authentication flow implemented
- ✅ Error handling and validation
- ✅ Responsive design
- ✅ Push notification setup
- ✅ Data persistence
- ✅ Security best practices
- ✅ Performance optimization

### Build for Production
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure build
eas build:configure

# Build for app stores
eas build --platform all
```

## 📱 App Structure

### Screens
- **WelcomeScreen**: Onboarding and authentication entry point
- **LoginScreen**: User authentication
- **RegisterScreen**: New user registration
- **SearchOffersScreen**: Main food discovery (Home)
- **CategorizeScreen**: Browse by categories
- **FavoritesScreen**: Saved items (authentication-aware)
- **AccountScreen**: Profile and settings (authentication-aware)
- **NotificationScreen**: Push notifications center
- **OfferDetailsScreen**: Restaurant and deal details

### Components
- **FoodCard**: Restaurant/deal display component
- **FavoriteCard**: Favorites grid item
- **RecentlyVisitedCard**: Recently viewed items

### Services
- **authService**: Authentication and user data management
- **recentlyVisited**: Recently viewed items tracking

### Context
- **AuthContext**: Global authentication state management

## 🎯 Future Enhancements

### Planned Features
- **Social Login**: Google, Facebook, Apple Sign-In
- **Email Verification**: Email confirmation for new accounts
- **Password Reset**: Forgot password functionality
- **Profile Pictures**: Avatar upload and management
- **Order Management**: Complete order flow and history
- **Payment Integration**: Secure payment processing
- **Real-time Chat**: Customer support integration
- **Location Services**: GPS-based restaurant discovery
- **Reviews & Ratings**: User-generated content system

### Technical Improvements
- **Backend Integration**: Replace mock API with real backend
- **Offline Support**: Offline data synchronization
- **Performance**: Image caching and lazy loading
- **Analytics**: User behavior tracking
- **A/B Testing**: Feature experimentation framework
---

**BizBites v2.0.0** - Complete Authentication System
Built with ❤️ using React Native & Expo



## 🚀 Running the Application

After installing the dependencies, you can run the application using:

```bash
npx expo start
```

This will start the Expo development server. You can then:

- Scan the QR code with the Expo Go app on your mobile device to test on a physical device.
- Press 'w' in the terminal to open the app in your web browser.
- Press 'a' to run on an Android emulator.
- Press 'i' to run on an iOS simulator.


