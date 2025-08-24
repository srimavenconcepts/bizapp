import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RestaurantCard from '../components/RestaurantCard';
import RestaurantModal from '../components/RestaurantModal';
import LocationDropdown from '../components/LocationDropdown';
import { getRestaurantsWithFallback, getRestaurantByIdWithFallback } from '../services/restaurantApi';
import { locationService } from '../services/locationService'; // Import locationService

const HomeRestaurantScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const locationInitialized = useRef(false);

  // Filter options - Updated to match common Yelp categories
  const filterOptions = useMemo(() => ['All', 'Indian', 'Mediterranean', 'Halal', 'Middle Eastern', 'Buffets', 'American', 'Italian'], []);

  useEffect(() => {
    if (!locationInitialized.current) {
      // Initialize location only once on component mount
      locationService.getCurrentLocationWithAddress()
        .then(locationData => {
          if (locationData && locationData.address) {
            setSelectedLocation({
              name: locationData.address.formattedAddress,
              zipCode: locationData.address.postalCode,
              city: locationData.address.city,
              isCurrentLocation: true,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            });
          }
        })
        .catch(error => {
          console.error("Error initializing location in HomeRestaurantScreen:", error);
          // Fallback to a default location if current location fails
          setSelectedLocation({
            name: 'Atlanta, GA 30309',
            zipCode: '30309',
            city: 'Atlanta',
            isCurrentLocation: false,
            latitude: 33.748997,
            longitude: -84.387985,
          });
        })
        .finally(() => {
          locationInitialized.current = true;
        });
    }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedLocation && selectedLocation.zipCode) {
        filters.zipCode = selectedLocation.zipCode;
      }
      
      // Fetch all restaurants initially, then filter by zipcode if selected
      //console.log("HomeRestaurantScreen - Fetching all restaurants");
      const data = await getRestaurantsWithFallback(filters);
      //console.log("HomeRestaurantScreen - Restaurant data received:", data);
      
      // Handle different response formats from mobile API vs fallback
      let restaurantList = [];
      if (data.success && data.data) {
        restaurantList = data.data;
      } else if (Array.isArray(data)) {
        restaurantList = data;
      } else if (data.restaurants) {
        restaurantList = data.restaurants;
      } else {
        restaurantList = [];
      }
      
      //console.log("HomeRestaurantScreen - Final restaurant list:", restaurantList.length, "restaurants");
      setRestaurants(restaurantList);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      Alert.alert("Error", "Failed to load restaurants. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const filterRestaurants = useCallback(() => {
    let filtered = [...restaurants];

    // Apply zipcode filter first if a location is selected
    if (selectedLocation && selectedLocation.zipCode) {
      filtered = filtered.filter(restaurant => {
        const restaurantZip = restaurant.zip_code || restaurant.zipCode;
        return restaurantZip === selectedLocation.zipCode;
      });
    }

    // Apply search filter
    if (searchText.trim()) {
      const searchTerm = searchText.trim().toLowerCase();
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm) ||
        restaurant.cuisines?.some(cuisine => 
          cuisine.toLowerCase().includes(searchTerm)
        ) ||
        restaurant.address?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply cuisine filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(restaurant =>
        restaurant.cuisines?.some(cuisine => cuisine === selectedFilter)
      );
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, searchText, selectedFilter, selectedLocation]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    filterRestaurants();
  }, [filterRestaurants]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRestaurants();
    setRefreshing(false);
  }, [fetchRestaurants]);

  const handleLocationChange = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  const handleRestaurantPress = useCallback(async (restaurant) => {
    try {
      const fullRestaurant = await getRestaurantByIdWithFallback(restaurant.id || restaurant.yelpId || restaurant.yelp_id);
      setSelectedRestaurant(fullRestaurant || restaurant);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      setSelectedRestaurant(restaurant);
      setModalVisible(true);
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedRestaurant(null);
  }, []);

  const renderFilterButton = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(item)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === item && styles.filterButtonTextActive
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  ), [selectedFilter]);

  const headerComponent = useMemo(() => (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <LocationDropdown 
            onLocationChange={handleLocationChange}
            style={styles.locationDropdown}
          />
           <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate("Notifications")}>
              <Ionicons name="notifications-outline" size={24} color="#6366f1" />
            </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Restaurants Near You</Text>
        <Text style={styles.headerSubtitle}>
          {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisines, or locations..."
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchText('')}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          renderItem={renderFilterButton}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filtersContent}
        />
      </View>
    </View>
  ), [filteredRestaurants.length, searchText, selectedFilter, handleLocationChange, filterOptions, navigation]);

  const renderRestaurantItem = useCallback(({ item }) => (
    <RestaurantCard
      restaurant={item}
      onPress={() => handleRestaurantPress(item)}
    />
  ), [handleRestaurantPress]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No restaurants found</Text>
      <Text style={styles.emptyStateText}>
        {searchText.trim() || selectedFilter !== 'All'
          ? 'Try adjusting your search or filters'
          : 'Check back later for new restaurants'
        }
      </Text>
    </View>
  ), [searchText, selectedFilter]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id || item.yelpId || item.yelp_id || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        ListHeaderComponent={headerComponent}
        ListEmptyComponent={renderEmptyState}
        stickyHeaderIndices={[0]}
      />

      <RestaurantModal
        visible={modalVisible}
        restaurant={selectedRestaurant}
        onClose={handleCloseModal}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 30, // Adjust for iOS status bar
  },
  headerContainer: {
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationDropdown: {
    flex: 1,
    marginRight: 12,
  },
  notificationButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersContent: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default HomeRestaurantScreen;


