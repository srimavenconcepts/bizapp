import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENTLY_VISITED_KEY = 'recently_visited_deals';
const MAX_RECENT_ITEMS = 10; // Maximum number of recently visited items to store

/**
 * Get recently visited deals from AsyncStorage
 * @returns {Promise<Array>} Array of recently visited deals
 */
export const getRecentlyVisited = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(RECENTLY_VISITED_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting recently visited deals:', error);
    return [];
  }
};

/**
 * Add a deal to recently visited list
 * @param {Object} deal - The deal object to add
 */
export const addToRecentlyVisited = async (deal) => {
  try {
    const recentlyVisited = await getRecentlyVisited();
    
    // Create a simplified version of the deal for storage
    const dealToStore = {
      id: deal.id,
      title: deal.title,
      restaurant: deal.restaurant,
      restaurantId: deal.restaurantId,
      description: deal.description,
      rating: deal.rating,
      distance: deal.distance,
      discount: deal.discount,
      image: deal.image,
      visitedAt: new Date().toISOString(),
    };
    
    // Remove the deal if it already exists (to avoid duplicates)
    const filteredDeals = recentlyVisited.filter(item => item.id !== deal.id);
    
    // Add the new deal to the beginning of the array
    const updatedDeals = [dealToStore, ...filteredDeals];
    
    // Keep only the most recent MAX_RECENT_ITEMS
    const trimmedDeals = updatedDeals.slice(0, MAX_RECENT_ITEMS);
    
    // Save to AsyncStorage
    const jsonValue = JSON.stringify(trimmedDeals);
    await AsyncStorage.setItem(RECENTLY_VISITED_KEY, jsonValue);
    
    //console.log('Deal added to recently visited:', deal.title);
  } catch (error) {
    console.error('Error adding deal to recently visited:', error);
  }
};

/**
 * Remove a deal from recently visited list
 * @param {string} dealId - The ID of the deal to remove
 */
export const removeFromRecentlyVisited = async (dealId) => {
  try {
    const recentlyVisited = await getRecentlyVisited();
    const filteredDeals = recentlyVisited.filter(item => item.id !== dealId);
    
    const jsonValue = JSON.stringify(filteredDeals);
    await AsyncStorage.setItem(RECENTLY_VISITED_KEY, jsonValue);
    
    //console.log('Deal removed from recently visited:', dealId);
  } catch (error) {
    console.error('Error removing deal from recently visited:', error);
  }
};

/**
 * Clear all recently visited deals
 */
export const clearRecentlyVisited = async () => {
  try {
    await AsyncStorage.removeItem(RECENTLY_VISITED_KEY);
    //console.log('Recently visited deals cleared');
  } catch (error) {
    console.error('Error clearing recently visited deals:', error);
  }
};

/**
 * Check if a deal is in recently visited list
 * @param {string} dealId - The ID of the deal to check
 * @returns {Promise<boolean>} True if the deal is in recently visited list
 */
export const isRecentlyVisited = async (dealId) => {
  try {
    const recentlyVisited = await getRecentlyVisited();
    return recentlyVisited.some(item => item.id === dealId);
  } catch (error) {
    console.error('Error checking if deal is recently visited:', error);
    return false;
  }
};

/**
 * Get recently visited deals count
 * @returns {Promise<number>} Number of recently visited deals
 */
export const getRecentlyVisitedCount = async () => {
  try {
    const recentlyVisited = await getRecentlyVisited();
    return recentlyVisited.length;
  } catch (error) {
    console.error('Error getting recently visited count:', error);
    return 0;
  }
};



import { getDealStatuses } from './api';

/**
 * Clears inactive deals from the recently visited list.
 */
export const clearInactiveRecentlyVisited = async () => {
  try {
    const recentlyVisited = await getRecentlyVisited();
    if (recentlyVisited.length === 0) {
      //console.log('No recently visited deals to check.');
      return;
    }

    const dealIds = recentlyVisited.map(deal => deal.id);
    const dealStatuses = await getDealStatuses(dealIds);

    const activeDeals = recentlyVisited.filter(deal => {
      const status = dealStatuses.find(s => s.id === deal.id)?.status;
      return status === 'active';
    });

    if (activeDeals.length !== recentlyVisited.length) {
      const jsonValue = JSON.stringify(activeDeals);
      await AsyncStorage.setItem(RECENTLY_VISITED_KEY, jsonValue);
      //console.log('Inactive deals cleared from recently visited.');
    } else {
      //console.log('All recently visited deals are active.');
    }
  } catch (error) {
    console.error('Error clearing inactive recently visited deals:', error);
  }
};