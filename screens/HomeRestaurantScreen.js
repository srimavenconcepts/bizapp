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

const HomeRestaurantScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Filter options - Updated to match common Yelp categories
  const filterOptions = useMemo(() => ['All', 'Indian', 'Mediterranean', 'Halal', 'Middle Eastern', 'Buffets', 'American', 'Italian'], []);

  // Fetch all restaurants by default on component mount
  useEffect(() => {
    fetchRestaurantsByZipcode("30041");
  }, [fetchRestaurantsByZipcode]);

  const fetchAllRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      //console.log("HomeRestaurantScreen - Fetching all restaurants (no filters)");

      // Fetch all restaurants without any location filters
      const data = await getRestaurantsWithFallback({});
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

  const fetchRestaurantsByZipcode = useCallback(async (zipCode) => {
    try {
      setLoading(true);
      //console.log("HomeRestaurantScreen - Fetching restaurants for zipcode:", zipCode);

      const filters = { zipCode };
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

  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    // Apply search filter
    if (searchText.trim()) {
      const searchTerm = searchText.trim().toLowerCase();
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm) ||
        restaurant.cuisines?.some(cuisine => cuisine.toLowerCase().includes(searchTerm)) ||
        restaurant.address?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply cuisine filter
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(restaurant =>
        restaurant.cuisines?.includes(selectedFilter)
      );
    }

    return filtered;
  }, [restaurants, searchText, selectedFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedLocation && selectedLocation.zipCode) {
      await fetchRestaurantsByZipcode(selectedLocation.zipCode);
    } else {
      await fetchAllRestaurants();
    }
    setRefreshing(false);
  }, [selectedLocation, fetchRestaurantsByZipcode, fetchAllRestaurants]);

  const handleLocationChange = useCallback((location) => {
    //console.log("HomeRestaurantScreen - Location changed:", location);
    setSelectedLocation(location);

    if (location && location.zipCode) {
      // Fetch restaurants for the selected zipcode
      fetchRestaurantsByZipcode(location.zipCode);
    } else {
      // If no zipcode, fetch all restaurants
      fetchAllRestaurants();
    }
  }, [fetchRestaurantsByZipcode, fetchAllRestaurants]);

  const handleRestaurantPress = useCallback(async (restaurant, action) => {
    if (action === 'deals') {
      // Navigate to deals screen with restaurant filter
      navigation.navigate('Deals', {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name
      });
      return;
    }

    try {
      const response = await getRestaurantByIdWithFallback(restaurant.id || restaurant.yelpId || restaurant.yelp_id);
      const fullRestaurant = response && response.data ? response.data : response;
      //console.log("HomeRestaurantScreen - Full restaurant details:", fullRestaurant);
      setSelectedRestaurant(fullRestaurant || restaurant);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      setSelectedRestaurant(restaurant);
      setModalVisible(true);
    }
  }, [navigation]);

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
            defaultZipCode={selectedLocation?.zipCode || "30041"}
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