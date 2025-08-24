import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import dealMonitorService from './services/dealMonitorService';


// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';

// Services
import { clearInactiveRecentlyVisited } from './services/recentlyVisited';

// Screens
import SearchOffersScreen from './screens/SearchOffersScreen';
import OfferDetailsScreen from './screens/OfferDetailsScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import AccountScreen from './screens/AccountScreen';
import NotificationScreen from './screens/NotificationScreen';
import CategorizeScreen from './screens/CategorizeScreen';
import HomeRestaurantScreen from './screens/HomeRestaurantScreen';
import DealsScreen from './screens/DealsScreen';

// Auth Screens
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// Components
import NotificationBell from './components/NotificationBell';

// Custom header right component
function HeaderRight({ navigation }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
      <NotificationBell navigation={navigation} />
    </View>
  );
}

// Helper to inject headerRight into all screens
function withHeaderRight(options = {}) {
  return ({ navigation }) => ({
    ...options,
    headerRight: () => <HeaderRight navigation={navigation} />,
  });
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={withHeaderRight({
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: '#000',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Stack.Screen 
        name="HomeRestaurants" 
        component={HomeRestaurantScreen}
        options={{ title: '', headerTitle: 'BizBites', headerShown: false }}
      />
      <Stack.Screen 
        name="OfferDetails" 
        component={OfferDetailsScreen}
        options={{ title: 'Offer Details' }}
      />
    </Stack.Navigator>
  );
}

function CategorizeStack() {
  return (
    <Stack.Navigator
      screenOptions={withHeaderRight({
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: '#000',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Stack.Screen 
        name="CategorizeMain" 
        component={CategorizeScreen}
        options={{ title: 'Categories' }}
      />
      <Stack.Screen 
        name="OfferDetails" 
        component={OfferDetailsScreen}
        options={{ title: 'Offer Details' }}
      />
    </Stack.Navigator>
  );
}

function FavoritesStack() {
  return (
    <Stack.Navigator
      screenOptions={withHeaderRight({
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
          height: 56,
        },
        headerTintColor: '#000',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Stack.Screen 
        name="FavoritesList" 
        component={FavoritesScreen}
        options={{ title: '', headerTitle: '' }}
      />
      <Stack.Screen 
        name="OfferDetails" 
        component={OfferDetailsScreen}
        options={{ title: 'Offer Details' }}
      />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator
      screenOptions={withHeaderRight({
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: '#000',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Stack.Screen 
        name="AccountMain" 
        component={AccountScreen}
        options={{ title: 'My Account' }}
      />
    </Stack.Navigator>
  );
}

function NotificationStack() {
  return (
    <Stack.Navigator
      screenOptions={withHeaderRight({
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: '#000',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Stack.Screen 
        name="NotificationMain" 
        component={NotificationScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
}

function DealsStack() {
  return (
    <Stack.Navigator
      screenOptions={withHeaderRight({
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: '#000',
        headerTitleStyle: { fontWeight: 'bold' },
      })}
    >
      <Stack.Screen 
        name="DealsMain" 
        component={DealsScreen}
        options={{ title: '', headerTitle: 'Deals & Offers', headerShown: false }}
      />
      <Stack.Screen 
        name="OfferDetails" 
        component={OfferDetailsScreen}
        options={{ title: 'Offer Details' }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Deals') {
            iconName = focused ? 'pricetag' : 'pricetag-outline';
          } else if (route.name === 'Categorize') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Deals" 
        component={DealsStack}
        options={{ title: 'Deals' }}
      />
      <Tab.Screen 
        name="Categorize" 
        component={CategorizeStack}
        options={{ title: 'Categorize' }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesStack}
        options={{ title: 'Favorites' }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountStack}
        options={{ title: 'Account' }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack for onboarding and authentication
function AuthStack() {
  const { skipLogin } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome">
        {(props) => <WelcomeScreen {...props} onSkip={skipLogin} />}
      </Stack.Screen>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => <RegisterScreen {...props} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Main App Stack
function MainAppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Notifications" component={NotificationStack} />
      <Stack.Screen name="Account" component={AccountStack} />
            <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}

// Deal Monitor Initializer Component
function DealMonitorInitializer() {
  const { addDealNotification } = useNotifications();

  useEffect(() => {
    // Initialize the deal monitoring service
    dealMonitorService.initialize(async (newDeal) => {
      // Create notification for new deal
      await addDealNotification(newDeal);
      //console.log('New deal notification created:', newDeal.title);
    });

    // Start monitoring
    dealMonitorService.startMonitoring();

    // Cleanup on unmount
    return () => {
      dealMonitorService.stopMonitoring();
    };
  }, [addDealNotification]);

  return null; // This component doesn't render anything
}

// App Navigator Component
function AppNavigator() {
  const { isLoading, isAuthenticated, hasSeenOnboarding } = useAuth();

  useEffect(() => {
    clearInactiveRecentlyVisited();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show onboarding if user hasn't seen it and isn't authenticated
  if (!hasSeenOnboarding && !isAuthenticated) {
    return (
      <>
        <DealMonitorInitializer />
        <AuthStack />
      </>
    );
  }

  // Show main app (whether authenticated or as guest)
  return (
    <>
      <DealMonitorInitializer />
      <MainAppStack />
    </>
  );
}

// Main App Component
export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <NotificationProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </NotificationProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

