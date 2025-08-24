import * as Location from 'expo-location';

// Cache for location data to prevent excessive API calls
let locationCache = {
  position: null,
  address: null,
  timestamp: null,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Location service for handling geolocation and reverse geocoding
export const locationService = {
  // Request location permissions
  requestLocationPermission: async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      //console.log('Location permission status:', status);
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  },

  // Get current position with caching
  getCurrentPosition: async () => {
    try {
      // Check cache first
      const now = Date.now();
      if (locationCache.position && locationCache.timestamp && 
          (now - locationCache.timestamp) < locationCache.CACHE_DURATION) {
        //console.log('Using cached position:', locationCache.position);
        return locationCache.position;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 30000,
        maximumAge: 60000, // Cache for 1 minute
      });
      
      const position = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
      
      // Update cache
      locationCache.position = position;
      locationCache.timestamp = now;
      
      //console.log('Current position:', position);
      return position;
    } catch (error) {
      console.error('Error getting current position:', error);
      throw error;
    }
  },

  // Reverse geocode coordinates to address with caching
  reverseGeocode: async (latitude, longitude) => {
    try {
      // Check cache first
      const now = Date.now();
      if (locationCache.address && locationCache.timestamp && 
          (now - locationCache.timestamp) < locationCache.CACHE_DURATION) {
        //console.log('Using cached address:', locationCache.address);
        return locationCache.address;
      }

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const formattedAddress = {
          street: address.street,
          city: address.city,
          region: address.region,
          country: address.country,
          postalCode: address.postalCode,
          name: address.name,
          formattedAddress: `${address.city || 'Unknown'}, ${address.region || 'Unknown'} ${address.postalCode || ''}`.trim(),
        };
        
        // Update cache
        locationCache.address = formattedAddress;
        locationCache.timestamp = now;
        
        //console.log('Reverse geocoded address:', formattedAddress);
        return formattedAddress;
      }
      //console.log('No address found for coordinates:', { latitude, longitude });
      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  },

  // Get current location with address
  getCurrentLocationWithAddress: async () => {
    try {
      const hasPermission = await locationService.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const position = await locationService.getCurrentPosition();
      const address = await locationService.reverseGeocode(position.latitude, position.longitude);

      //console.log('Current location with address:', { ...position, address });
      return {
        ...position,
        address,
      };
    } catch (error) {
      console.error('Error getting current location with address:', error);
      throw error;
    }
  },

  // Get zipcode from current location
  getCurrentZipCode: async () => {
    try {
      const locationWithAddress = await locationService.getCurrentLocationWithAddress();
      const zipcode = locationWithAddress.address?.postalCode || null;
      //console.log('Current zipcode:', zipcode);
      return zipcode;
    } catch (error) {
      console.error('Error getting current zipcode:', error);
      return null;
    }
  },

  // Clear location cache (useful for testing or when user wants fresh location)
  clearCache: () => {
    locationCache = {
      position: null,
      address: null,
      timestamp: null,
      CACHE_DURATION: 5 * 60 * 1000,
    };
    //console.log('Location cache cleared');
  },

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in meters
    return distance;
  },

  // Sort locations by distance from current position
  sortLocationsByDistance: (locations, currentLat, currentLon) => {
    return locations.map(location => ({
      ...location,
      distance: locationService.calculateDistance(
        currentLat,
        currentLon,
        parseFloat(location.latitude),
        parseFloat(location.longitude)
      )
    })).sort((a, b) => a.distance - b.distance);
  },

  // Format distance for display
  formatDistance: (distanceInMeters) => {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else if (distanceInMeters < 10000) {
      return `${(distanceInMeters / 1000).toFixed(1)}km`;
    } else {
      return `${Math.round(distanceInMeters / 1000)}km`;
    }
  },
};

export default locationService;

