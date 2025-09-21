// Restaurant API service
import Constants from 'expo-constants';
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL;
export const restaurantApi = {
  // Get all restaurants with optional filters
  getAllRestaurants: async (filters = {}) => {
    try {
      //console.log('restaurantApi.getAllRestaurants - Filters:', filters);
      const queryParams = new URLSearchParams();

      if (filters.search) {
        queryParams.append('query', filters.search);
      }
      if (filters.zipCode) {
        queryParams.append("zipCode", filters.zipCode);
      }
      if (filters.cuisineType) {
        queryParams.append('cuisines', filters.cuisineType);
      }
      if (filters.city) {
        queryParams.append('city', filters.city);
      }
      if (filters.state) {
        queryParams.append('state', filters.state);
      }
      if (filters.rating_min) {
        queryParams.append('minRating', filters.rating_min);
      }
      if (filters.price) {
        queryParams.append('price', filters.price);
      }
      if (filters.latitude) {
        queryParams.append('latitude', filters.latitude);
      }
      if (filters.longitude) {
        queryParams.append('longitude', filters.longitude);
      }
      if (filters.radius) {
        queryParams.append('radius', filters.radius);
      }
      if (filters.is_closed !== undefined) {
        // No direct equivalent for is_closed in mobile API, will ignore for now
      }
      if (filters.data_source) {
        queryParams.append("data_source", filters.data_source);
      }

      let url = '';
      //console.log("filter:", filters);
      const queryString = queryParams.toString();
      //console.log('restaurantApi.getAllRestaurants - Query Params:', queryString);
      if (filters.zipCode) {
        url = `${API_BASE_URL}/restaurants/all${queryString ? `?${queryString}` : ''}`;
      } else if (filters.latitude && filters.longitude) {
        url = `${API_BASE_URL}/restaurants/nearby${queryString ? `?${queryString}` : ''}`;
      } else if (filters.search) {
        url = `${API_BASE_URL}/restaurants/search${queryString ? `?${queryString}` : ''}`;
      } else if (filters.data_source) {
        url = `${API_BASE_URL}/restaurants/search${queryString ? `?${queryString}` : ''}`;
      } else {
        // NEW: Fetch all restaurants if no filters/zipcode
        url = `${API_BASE_URL}/restaurants/all`;
      }
      //console.log('restaurantApi.getAllRestaurants - Constructed URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      //console.log('restaurantApi.getAllRestaurants - Response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  },

  // Get restaurant by ID
  getRestaurantById: async (id) => {
    try {
      //console.log('restaurantApi.getRestaurantById - ID:', id);
      const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      //console.log('restaurantApi.getRestaurantById - Response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  },
};

// Mock data for development/testing when backend is not available
export const mockRestaurants = [
  // Atlanta area restaurants (30309)
  {
    id: '1',
    name: 'The Italian Corner',
    description: 'Authentic Italian cuisine with fresh ingredients and traditional recipes passed down through generations.',
    address: '123 Main St, Atlanta, GA 30309',
    phone: '(555) 123-4567',
    website: 'https://italiancorner.com',
    hours: {
      'Monday-Friday': '11:00 AM - 10:00 PM',
      'Saturday-Sunday': '12:00 PM - 11:00 PM'
    },
    price: '$$',
    cuisines: ['Italian', 'Mediterranean'],
    avg_rating: 4.5,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
    data_source: 'manual',
    zip_code: '30309',
    city: 'Atlanta',
    state: 'GA',
    latitude: 33.748997,
    longitude: -84.387985,
    deals: [
      {
        id: 'deal-1',
        title: '2-for-1 Pasta',
        description: 'Buy one pasta dish, get the second one free!',
      },
    ],
  },
  {
    id: '2',
    name: 'Sakura Sushi',
    description: 'Fresh sushi and Japanese dishes prepared by experienced chefs using the finest ingredients.',
    address: '456 Oak Ave, Atlanta, GA 30309',
    phone: '(555) 234-5678',
    website: 'https://sakurasushi.com',
    hours: {
      'Monday-Thursday': '5:00 PM - 10:00 PM',
      'Friday-Saturday': '5:00 PM - 11:00 PM',
      'Sunday': 'Closed'
    },
    price: '$$$',
    cuisines: ['Japanese', 'Sushi'],
    avg_rating: 4.8,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    data_source: 'manual',
    zip_code: '30309',
    city: 'Atlanta',
    state: 'GA',
    latitude: 33.749997,
    longitude: -84.388985,
    deals: [],
  },
  // Cumming area restaurants (30040)
  {
    id: '3',
    name: 'Burger Palace',
    description: 'Gourmet burgers made with locally sourced beef and fresh toppings. A casual dining experience.',
    address: '789 Pine St, Cumming, GA 30040',
    phone: '(555) 345-6789',
    website: 'https://burgerpalace.com',
    hours: {
      'Daily': '11:00 AM - 9:00 PM'
    },
    price: '$',
    cuisines: ['American', 'Burgers'],
    avg_rating: 4.2,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    data_source: 'manual',
    zip_code: '30040',
    city: 'Cumming',
    state: 'GA',
    latitude: 34.207222,
    longitude: -84.140000,
    deals: [
      {
        id: 'deal-2',
        title: 'Burger Combo Deal',
        description: 'Get a burger, fries, and a drink for a special price!',
      },
    ],
  },
  {
    id: '4',
    name: 'Spice Garden',
    description: 'Authentic Indian cuisine with aromatic spices and traditional cooking methods.',
    address: '321 Elm St, Cumming, GA 30040',
    phone: '(555) 456-7890',
    website: 'https://spicegarden.com',
    hours: {
      'Monday-Sunday': '12:00 PM - 10:00 PM'
    },
    price: '$$',
    cuisines: ['Indian', 'Vegetarian'],
    avg_rating: 4.6,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
    data_source: 'manual',
    zip_code: '30040',
    city: 'Cumming',
    state: 'GA',
    latitude: 34.208222,
    longitude: -84.141000,
    deals: [],
  },
  // Norcross area restaurants (30092)
  {
    id: '5',
    name: 'Taco Fiesta',
    description: 'Fresh Mexican food with bold flavors and authentic recipes from various regions of Mexico.',
    address: '654 Maple Dr, Norcross, GA 30092',
    phone: '(555) 567-8901',
    website: 'https://tacofiesta.com',
    hours: {
      'Monday-Saturday': '11:00 AM - 9:00 PM',
      'Sunday': '12:00 PM - 8:00 PM'
    },
    price: '$',
    cuisines: ['Mexican', 'Latin American'],
    avg_rating: 4.3,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    data_source: 'manual',
    zip_code: '30092',
    city: 'Norcross',
    state: 'GA',
    latitude: 33.941389,
    longitude: -84.213611,
    deals: [],
  },
  {
    id: '6',
    name: 'Mediterranean Delight',
    description: 'Fresh Mediterranean cuisine with healthy options and authentic flavors.',
    address: '987 Cedar Ave, Norcross, GA 30092',
    phone: '(555) 678-9012',
    website: 'https://meddelight.com',
    hours: {
      'Monday-Sunday': '11:00 AM - 9:00 PM'
    },
    price: '$$',
    cuisines: ['Mediterranean', 'Halal'],
    avg_rating: 4.4,
    image: 'https://images.unsplash.com/photo-1544510808-5e41d7d2c8e4?w=400&h=300&fit=crop',
    data_source: 'manual',
    zip_code: '30092',
    city: 'Norcross',
    state: 'GA',
    latitude: 33.942389,
    longitude: -84.214611,
    deals: [
      {
        id: 'deal-3',
        title: 'Mediterranean Feast',
        description: '20% off on all Mediterranean platters this week!',
      },
    ],
  },
  // Suwanee area restaurants (30024)
  {
    id: '7',
    name: 'BBQ Smokehouse',
    description: 'Authentic Southern BBQ with slow-smoked meats and traditional sides.',
    address: '555 Barbecue Blvd, Suwanee, GA 30024',
    phone: '(555) 789-0123',
    website: 'https://bbqsmokehouse.com',
    hours: {
      'Tuesday-Sunday': '11:00 AM - 9:00 PM',
      'Monday': 'Closed'
    },
    price: '$$',
    cuisines: ['American', 'BBQ'],
    avg_rating: 4.7,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    data_source: 'manual',
    zip_code: '30024',
    city: 'Suwanee',
    state: 'GA',
    latitude: 34.051389,
    longitude: -84.071111,
    deals: [],
  },
  {
    id: '8',
    name: 'Thai Orchid',
    description: 'Authentic Thai cuisine with fresh herbs and traditional recipes.',
    address: '777 Orchid Lane, Suwanee, GA 30024',
    phone: '(555) 890-1234',
    website: 'https://thaiorchid.com',
    hours: {
      'Monday-Sunday': '11:30 AM - 9:30 PM'
    },
    price: '$$',
    cuisines: ['Thai', 'Asian'],
    avg_rating: 4.5,
    image: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400&h=300&fit=crop',
    data_source: 'manual',
    zip_code: '30024',
    city: 'Suwanee',
    state: 'GA',
    latitude: 34.052389,
    longitude: -84.072111,
    deals: [],
  },
  // Yelp data restaurants
  {
    yelp_id: "n8eao4mfIsfiZj806uwcAA",
    name: "Dosa Boti",
    image_url: "https://s3-media0.fl.yelpcdn.com/bphoto/gujoyAhVE_P-YsOvUQmWFw/o.jpg",
    is_closed: false,
    yelp_url: "https://www.yelp.com/biz/dosa-boti-roswell",
    rating: "5.0",
    review_count: 2,
    categories: [{ alias: "indpak", title: "Indian" }],
    latitude: "34.03173163",
    longitude: "-84.36164970",
    price: "$$",
    address1: "1210 Canton St",
    city: "Roswell",
    state: "GA",
    zip_code: "30075",
    display_address: ["1210 Canton St", "Roswell, GA 30075"],
    phone: "+14702821376",
    display_phone: "(470) 282-1376",
    distance: "29880.4637",
    data_source: 'yelp',
    cuisines: ['Indian']
  },
  {
    yelp_id: "Kx_ryAKZYBxGNQKMN2bkGw",
    name: "Biryani World Fusion & Grill",
    image_url: "https://s3-media0.fl.yelpcdn.com/bphoto/U4otQ6vv_OZNZitrpk3lGQ/o.jpg",
    is_closed: false,
    yelp_url: "https://www.yelp.com/biz/biryani-world-fusion-and-grill-johns-creek",
    rating: "5.0",
    review_count: 2,
    categories: [
      { alias: "indpak", title: "Indian" },
      { alias: "buffets", title: "Buffets" }
    ],
    latitude: "34.06553169",
    longitude: "-84.21014629",
    price: "$$",
    address1: "11705 Jones Bridge Rd",
    address2: "Ste C 201",
    city: "Johns Creek",
    state: "GA",
    zip_code: "30005",
    display_address: ["11705 Jones Bridge Rd", "Ste C 201", "Johns Creek, GA 30005"],
    phone: "+14708203767",
    display_phone: "(470) 820-3767",
    distance: "17700.6447",
    data_source: 'yelp',
    cuisines: ['Indian', 'Buffets']
  }
];

// Use mock data when backend is not available
export const getRestaurantsWithFallback = async (filters = {}) => {
  try {
    const response = await restaurantApi.getAllRestaurants(filters);

    // Handle different response formats from the API
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else if (response && response.restaurants && Array.isArray(response.restaurants)) {
      return response.restaurants;
    } else {
      // If response is not in expected format, return empty array
      console.warn('Unexpected response format from API, returning empty array:', response);
      return [];
    }
  } catch (error) {
    console.warn('Backend not available, using mock data:', error.message);

    // Apply basic filtering to mock data
    let filteredData = [...mockRestaurants];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm) ||
        restaurant.cuisines?.some(cuisine => cuisine.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.cuisineType) {
      filteredData = filteredData.filter(restaurant =>
        restaurant.cuisines && restaurant.cuisines.includes(filters.cuisineType)
      );
    }

    if (filters.data_source) {
      filteredData = filteredData.filter(restaurant =>
        restaurant.data_source === filters.data_source
      );
    }

    // Filter by zipcode if provided
    if (filters.zipCode) {
      filteredData = filteredData.filter(restaurant =>
        restaurant.zip_code === filters.zipCode
      );
    }

    return filteredData;
  }
};

export const getRestaurantByIdWithFallback = async (id) => {
  try {
    return await restaurantApi.getRestaurantById(id);
  } catch (error) {
    console.warn('Backend not available, using mock data:', error.message);
    return mockRestaurants.find(restaurant => restaurant.id === id || restaurant.yelp_id === id);
  }
};

