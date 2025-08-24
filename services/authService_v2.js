import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = '@bizbites_auth_token';
const USER_DATA_KEY = '@bizbites_user_data';
const USERS_KEY = '@bizbites_users'; // Mock user database

// Mock API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user database operations
const getUsersDatabase = async () => {
  try {
    const users = await AsyncStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Error getting users database:', error);
    return [];
  }
};

const saveUsersDatabase = async (users) => {
  try {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users database:', error);
  }
};

// Generate a simple token
const generateToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const authService = {
  // Register new user
  register: async (email, password, name) => {
    const response = await fetch('https://your-api-url.com/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    // Save token and user data
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.token);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
    return { user: data.user, token: data.token };
  },
  
  // Login user
  login: async (email, password) => {
    await delay(1000); // Simulate API call
    
    if (!isValidEmail(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    if (!password) {
      throw new Error('Password is required');
    }
    
    const users = await getUsersDatabase();
    
    // Find user
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Generate auth token
    const token = generateToken();
    
    // Save auth data
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      token
    }));
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    };
  },
  
  // Logout user
  logout: async () => {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      
      if (token && userData) {
        const user = JSON.parse(userData);
        return { user, token };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },
  
  // Update user profile
  updateProfile: async (updates) => {
    try {
      const currentAuth = await authService.getCurrentUser();
      if (!currentAuth) {
        throw new Error('User not authenticated');
      }
      
      const users = await getUsersDatabase();
      const userIndex = users.findIndex(u => u.id === currentAuth.user.id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update user in database
      users[userIndex] = { ...users[userIndex], ...updates };
      await saveUsersDatabase(users);
      
      // Update stored user data
      const updatedUserData = {
        ...currentAuth.user,
        ...updates
      };
      
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify({
        ...updatedUserData,
        token: currentAuth.token
      }));
      
      return updatedUserData;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Add to favorites
  addToFavorites: async (dealId, userId, token) => {
    const response = await fetch(`https://your-api-url.com/api/v1/users/${userId}/favorites/${dealId}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add favorite');
    }
    return await response.json();
  },
  
  // Remove from favorites
  removeFromFavorites: async (itemId) => {
    try {
      const currentAuth = await authService.getCurrentUser();
      if (!currentAuth) {
        // For guest users
        const guestFavorites = await AsyncStorage.getItem('@guest_favorites');
        const favorites = guestFavorites ? JSON.parse(guestFavorites) : [];
        const updatedFavorites = favorites.filter(fav => fav.id !== itemId);
        await AsyncStorage.setItem('@guest_favorites', JSON.stringify(updatedFavorites));
        return updatedFavorites;
      }
      
      const users = await getUsersDatabase();
      const userIndex = users.findIndex(u => u.id === currentAuth.user.id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      users[userIndex].favorites = users[userIndex].favorites.filter(fav => fav.id !== itemId);
      await saveUsersDatabase(users);
      
      return users[userIndex].favorites;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  },
  
  // Get user favorites
  getFavorites: async () => {
    try {
      const currentAuth = await authService.getCurrentUser();
      if (!currentAuth) {
        // For guest users
        const guestFavorites = await AsyncStorage.getItem('@guest_favorites');
        return guestFavorites ? JSON.parse(guestFavorites) : [];
      }
      
      const users = await getUsersDatabase();
      const user = users.find(u => u.id === currentAuth.user.id);
      
      return user ? user.favorites : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },
  
  // Sync guest data when user logs in
  syncGuestData: async () => {
    try {
      const currentAuth = await authService.getCurrentUser();
      if (!currentAuth) return;
      
      // Get guest favorites
      const guestFavorites = await AsyncStorage.getItem('@guest_favorites');
      if (!guestFavorites) return;
      
      const favorites = JSON.parse(guestFavorites);
      if (favorites.length === 0) return;
      
      // Add guest favorites to user account
      for (const favorite of favorites) {
        await authService.addToFavorites(favorite);
      }
      
      // Clear guest data
      await AsyncStorage.removeItem('@guest_favorites');
    } catch (error) {
      console.error('Error syncing guest data:', error);
    }
  }
};

export default authService;

