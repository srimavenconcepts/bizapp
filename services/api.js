import axios from 'axios';
import Constants from 'expo-constants';
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDeals = async (params) => {
  try {
    const response = await api.get('/deals/public', { params }); // Use public route
    return response.data;
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
};

export const getRestaurants = async (params) => {
  try {
    const response = await api.get('/restaurants/public', { params }); // Use public route
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

export const getDealById = async (id) => {
  try {
    const response = await api.get(`/deals/public/${id}`); // Use public route
    return response.data;
  } catch (error) {
    console.error(`Error fetching deal ${id}:`, error);
    throw error;
  }
};

export const getRestaurantById = async (id) => {
  try {
    const response = await api.get(`/restaurants/public/${id}`); // Use public route
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await api.get('/categories/public'); // Use public route
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getPriceRanges = async () => {
  try {
    const response = await api.get("/deals/public"); // Use public route
    // Ensure response.data.deals is an array before mapping
    if (!response.data || !Array.isArray(response.data.deals)) {
      console.warn("API response for /deals/public is not an array or missing 'deals' property:", response.data);
      return []; // Return empty array if data is not as expected
    }
    const prices = response.data.deals
      .map((deal) => deal.restaurant?.price)
      .filter(Boolean);
    // Remove duplicates
    const uniquePrices = [...new Set(prices)];
    return uniquePrices.sort(); // Optional: sort the price ranges
  } catch (error) {
    console.error("Error fetching price ranges:", error);
    throw error;
  }
};

export const getDealsWithPrices = async () => {
  try {
    const response = await api.get('/deals/prices');
    return response.data;
  } catch (error) {
    console.error('Error fetching deals with prices:', error);
    throw error;
  }
};

export const getDealsForRestaurant = async (restaurantId) => {
  try {
    const response = await api.get(`/deals/public/restaurant/${restaurantId}`);
    //console.log(`Deals for restaurant ${restaurantId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching deals for restaurant ${restaurantId}:`, error);
    throw error;
  }
};

export const getDealStatuses = async (dealIds) => {
  try {
    const response = await api.post('/deals/statuses', { dealIds });
    return response.data;
  } catch (error) {
    console.error('Error fetching deal statuses:', error);
    throw error;
  }
};