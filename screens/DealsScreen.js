import React, { useState, useEffect, useMemo } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  FlatList,
  Keyboard,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import FoodCard from '../components/FoodCard';
import RecentlyVisitedCard from '../components/RecentlyVisitedCard';
import { getDeals, getPriceRanges, getDealsWithPrices } from '../services/api'; // Assuming getDeals returns the object { deals: [], total: N, ... }
import { getRecentlyVisited, clearRecentlyVisited } from '../services/recentlyVisited';

const DealsScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Offers');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedSortOption, setSelectedSortOption] = useState('');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [selectedRestaurantName, setSelectedRestaurantName] = useState('');
  const [deals, setDeals] = useState([]); // This will now consistently hold an array of deal objects
  const [recentlyVisited, setRecentlyVisited] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [recentlyVisitedModalVisible, setRecentlyVisitedModalVisible] = useState(false);
  const [priceRanges, setPriceRanges] = useState([]);

  // Handle route params for restaurant filtering
  useEffect(() => {
    if (route?.params?.restaurantId) {
      setSelectedRestaurantId(route.params.restaurantId);
      setSelectedRestaurantName(route.params.restaurantName || '');
      setSelectedFilter('Restaurant');
    }
  }, [route?.params]);

  useEffect(() => {
    const fetchPriceRanges = async () => {
      try {
        const ranges = await getPriceRanges();
        setPriceRanges(ranges);
      } catch (error) {
        console.error('Failed to fetch price ranges:', error);
      }
    };
    fetchPriceRanges();
  }, []);

  const loadRecentlyVisited = async () => {
    try {
      const recentDeals = await getRecentlyVisited();
      setRecentlyVisited(recentDeals);
    } catch (error) {
      console.error('Error loading recently visited:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh deals data
      const response = await getDeals();
      let fetchedDeals = [];

      if (response && Array.isArray(response.deals)) {
        fetchedDeals = response.deals;
      } else if (Array.isArray(response)) {
        fetchedDeals = response;
      }

      // Apply current filters
      let filteredDeals = searchText.trim().length === 0
        ? fetchedDeals
        : fetchedDeals.filter(deal => {
            const search = searchText.toLowerCase();
            const matchTitle = deal.title?.toLowerCase().includes(search);
            const matchRestaurant = deal.restaurant?.name?.toLowerCase().includes(search);
            const matchCategory = Array.isArray(deal.categories)
              ? deal.categories.some(cat => cat?.name?.toLowerCase().includes(search))
              : false;
            // const matchCuisine = Array.isArray(deal.restaurant?.cuisines)
            //   ? deal.restaurant.cuisines.some(cuisine => cuisine?.toLowerCase().includes(search))
            //   : false;
            // return matchTitle || matchRestaurant || matchCategory || matchCuisine;
            return matchTitle || matchRestaurant || matchCategory;
          });

      // Apply price range filter
      if (selectedPriceRange) {
        filteredDeals = filteredDeals.filter(
          deal => deal.restaurant?.price === selectedPriceRange
        );
      }

      // Apply restaurant filter
      if (selectedRestaurantId) {
        filteredDeals = filteredDeals.filter(
          deal => deal.restaurant_id === selectedRestaurantId
        );
      }

      // Apply sorting
      if (selectedSortOption === 'Most Viewed') {
        filteredDeals.sort((a, b) => (b.views || 0) - (a.views || 0));
      } else if (selectedSortOption === 'Most Liked') {
        filteredDeals.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      } else if (selectedSortOption === 'Latest') {
        filteredDeals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setDeals(filteredDeals);
      
      // Also refresh recently visited
      await loadRecentlyVisited();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const response = await getDeals(); // Assuming getDeals returns { deals: [...], total: N, ... }
        let fetchedDeals = [];

        // Extract the actual array of deals from the response
        if (response && Array.isArray(response.deals)) {
          fetchedDeals = response.deals;
        } else if (Array.isArray(response)) { // Fallback if getDeals somehow returns just an array
          fetchedDeals = response;
        }
        // If response is a single object (not an array and not an object with a 'deals' array),
        // you might need to decide how to handle it. For now, it will remain an empty array if not structured as expected.

        // Apply search text filter
        let filteredDeals = searchText.trim().length === 0
          ? fetchedDeals
          : fetchedDeals.filter(deal => {
              const search = searchText.toLowerCase();
              const matchTitle = deal.title?.toLowerCase().includes(search);
              const matchRestaurant = deal.restaurant?.name?.toLowerCase().includes(search);
              const matchCategory = Array.isArray(deal.categories)
                ? deal.categories.some(cat => cat?.name?.toLowerCase().includes(search))
                : false;
              const matchCuisine = Array.isArray(deal.restaurant?.cuisines)
                ? deal.restaurant.cuisines.some(cuisine => cuisine?.toLowerCase().includes(search))
                : false;
              return matchTitle || matchRestaurant || matchCategory || matchCuisine;
            });

        // Apply price range filter
        if (selectedPriceRange) {
          filteredDeals = filteredDeals.filter(
            deal => deal.restaurant?.price === selectedPriceRange
          );
        }

        // Apply restaurant filter
        if (selectedRestaurantId) {
          filteredDeals = filteredDeals.filter(
            deal => deal.restaurant_id === selectedRestaurantId
          );
        }

        // Apply sorting
        if (selectedSortOption === 'Most Viewed') {
          filteredDeals.sort((a, b) => (b.views || 0) - (a.views || 0));
        } else if (selectedSortOption === 'Most Liked') {
          filteredDeals.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        } else if (selectedSortOption === 'Latest') {
          filteredDeals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setDeals(filteredDeals); // Set the state with the correctly filtered array of deal objects
      } catch (error) {
        console.error('Failed to fetch deals:', error);
        setDeals([]); // Ensure deals is an empty array on error
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchText, selectedPriceRange, selectedSortOption, selectedRestaurantId]);

  // foodItems now correctly maps over the 'deals' state, which is guaranteed to be an array
  const foodItems = deals.map((deal) => ({
    id: deal.id,
    title: deal.title,
    restaurant: deal.restaurant?.name,
    restaurantId: deal.restaurant?.id,
    description: deal.description,
    rating: deal.restaurant?.avg_rating ? parseFloat(deal.restaurant.avg_rating) : 0,
    distance: '',
    discount: deal.discount_percentage ? `${deal.discount_percentage}% OFF` : '',
    image:
      deal.images?.find((img) => img.is_main)?.image_url ||
      deal.images?.[0]?.image_url ||
      '',
  }));

  // const filters = ['All Offers', 'Cuisine'];
  const filters = selectedRestaurantId ? ['All Offers', 'Restaurant'] : ['All Offers'];


  const categories = useMemo(() => {
    const categorySet = new Set();
    deals.forEach(deal => {
      if (Array.isArray(deal.categories)) {
        deal.categories.forEach(cat => {
          if (cat && cat.name) categorySet.add(cat.name);
        });
      }
    });
    return Array.from(categorySet);
  }, [deals]);

  const cuisines = useMemo(() => {
    const cuisineSet = new Set();
    deals.forEach(deal => {
      if (Array.isArray(deal.restaurant?.cuisines)) {
        deal.restaurant.cuisines.forEach(cuisine => {
          if (cuisine) cuisineSet.add(cuisine);
        });
      }
    });
    return Array.from(cuisineSet);
  }, [deals]);

 useFocusEffect(
    React.useCallback(() => {
      // Load recently visited when screen comes into focus
      loadRecentlyVisited();
      return () => {
        // On blur (navigating away), clear search
        setSearchText('');
        setModalVisible(false);
      };
    }, [])
  );

  useEffect(() => {
    if (route?.params?.openModal) {
      setModalVisible(true);
      navigation.setParams({ openModal: false });
    }
  }, [route?.params?.openModal]);

  const handleRecentlyVisitedPress = (item) => {
    navigation.navigate('OfferDetails', { item });
  };

  const handleClearRecentlyVisited = async () => {
    try {
      await clearRecentlyVisited();
      setRecentlyVisited([]);
    } catch (error) {
      console.error('Failed to clear recently visited:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.searchContainer}
            activeOpacity={0.9}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>
              {searchText || 'Restaurant, Zip code, Cuisine'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate("Notifications")}>
            <Ionicons name="notifications-outline" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.selectedFilterButton,
              ]}
              onPress={() => {
                setSelectedFilter(filter);
                if (filter === 'All Offers') {
                  setSelectedPriceRange('');
                  setSelectedSortOption('');
                  setSelectedRestaurantId('');
                  setSelectedRestaurantName('');
                  // setSearchText(''); // Uncomment if you want to clear search as well
                } else if (filter === 'Restaurant') {
                  // Keep the restaurant filter active
                }
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.selectedFilterText,
                ]}
              >
                {filter === 'Restaurant' && selectedRestaurantName 
                  ? selectedRestaurantName 
                  : filter}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Price Range Picker */}
          <View
            style={[
              styles.filterButton,
              selectedFilter === 'Price Range' && styles.selectedFilterButton,
              { flex: 1, paddingHorizontal: 0 },
            ]}
          >
            <Picker
              selectedValue={selectedPriceRange}
              onValueChange={(itemValue) => {
                setSelectedPriceRange(itemValue);
                if (itemValue) {
                  setSelectedFilter('Price Range');
                }
              }}
              style={styles.pickerStyle}
              itemStyle={styles.pickerItemStyle}
            >
              <Picker.Item label="Price Range" value="" />
              {priceRanges.map((range) => (
                <Picker.Item key={range} label={range} value={range} />
              ))}
            </Picker>
          </View>

          {/* Sort Options Picker */}
          <View
            style={[
              styles.filterButton,
              selectedSortOption && styles.selectedFilterButton,
              { flex: 1, paddingHorizontal: 0 },
            ]}
          >
            <Picker
              selectedValue={selectedSortOption}
              onValueChange={(itemValue) => {
                setSelectedSortOption(itemValue);
                if (itemValue) {
                  setSelectedFilter('Sort');
                }
              }}
              style={styles.pickerStyle}
              itemStyle={styles.pickerItemStyle}
            >
              <Picker.Item label="Sort By" value="" />
              <Picker.Item label="Most Viewed" value="Most Viewed" />
              <Picker.Item label="Most Liked" value="Most Liked" />
              <Picker.Item label="Latest" value="Latest" />
            </Picker>
          </View>
        </View>
        {(searchText.trim().length > 0 || selectedFilter !== 'All Offers' || selectedPriceRange !== '' || selectedSortOption !== '') && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginBottom: 10,
              marginTop: 12,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: '#eee',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
              }}
              onPress={() => {
                setSearchText('');
                setSelectedFilter('All Offers');
                setSelectedPriceRange('');
                setSelectedSortOption('');
                setSelectedRestaurantId('');
                setSelectedRestaurantName('');
              }}
            >
              <Text style={{ color: '#6366f1', fontWeight: 'bold' }}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalSearchBar}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSearchText('');
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#999" style={{ marginRight: 8 }} />
            </TouchableOpacity>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search for food, restaurant, cuisine"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {searchText.trim().length > 0 ? (
            loading ? (
              <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 40 }} />
            ) : (
              <>
                {(searchText.trim().length > 0 || selectedFilter !== 'All Offers' || selectedPriceRange !== '' || selectedSortOption !== '') && (
                  <Text style={{ marginLeft: 16, marginBottom: 8, color: '#6366f1', fontWeight: 'bold', fontSize: 16 }}>
                    {foodItems.length} result{foodItems.length === 1 ? '' : 's'} found
                  </Text>
                )}
                <FlatList
                  data={
                    recentlyVisited.length % 2 === 1
                      ? [...recentlyVisited, { id: `empty-${Date.now()}`, empty: true }] // Make the ID unique
                      : recentlyVisited
                  }
                  keyExtractor={(item) => item.id} // This will now work correctly
                  renderItem={({ item }) =>
                    item.empty ? (
                      <View style={{ flex: 1, aspectRatio: 1, margin: 4, backgroundColor: 'transparent' }} />
                    ) : (
                      <RecentlyVisitedCard
                        item={item}
                        style={{ flex: 1, aspectRatio: 1, margin: 4 }}
                        onPress={() => {
                          setRecentlyVisitedModalVisible(false);
                          handleRecentlyVisitedPress(item);
                        }}
                      />
                    )
                  }
                  numColumns={2}
                  columnWrapperStyle={styles.row}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              </>
            )
          ) : (
            <>
              <Text style={styles.categoriesTitle}>Categories</Text>
              <FlatList
                data={categories}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => {
                      setSearchText(item);
                      setModalVisible(false);
                    }}
                  >
                    <Text style={styles.categoryText}>{item}</Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.categoriesList}
              />
              {cuisines.length > 0 && (
                <>
                  <Text style={styles.categoriesTitle}>Cuisines</Text>
                  <FlatList
                    data={cuisines}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.categoryItem}
                        onPress={() => {
                          setSearchText(item);
                          setModalVisible(false);
                        }}
                      >
                        <Text style={styles.categoryText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.categoriesList}
                  />
                </>
              )}
            </>
          )}
        </SafeAreaView>
      </Modal>

      {(searchText.trim().length > 0 || selectedFilter !== 'All Offers' || selectedPriceRange !== '' || selectedSortOption !== '') && (
        <Text
          style={{
            marginLeft: 16,
            marginBottom: 8,
            marginTop: 12,
            color: '#6366f1',
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          {foodItems.length} result{foodItems.length === 1 ? '' : 's'} found
        </Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366f1']}
              tintColor="#6366f1"
            />
          }
        >
          {recentlyVisited.length > 0 && (
            <View style={styles.recentlyVisitedSection}>
              <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Visited</Text>
              <View style={styles.sectionHeaderButtons}>
                  <TouchableOpacity
                    onPress={handleClearRecentlyVisited}
                    style={styles.clearButtonSmall}
                  >
                    <Text style={styles.clearButtonSmallText}>Clear All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setRecentlyVisitedModalVisible(true)}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.recentlyVisitedList, { height: 220}]}
              >
                {recentlyVisited.map((item) => (
                  <RecentlyVisitedCard
                    key={item.id}
                    item={item}
                    onPress={() => handleRecentlyVisitedPress(item)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {foodItems.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onPress={() => navigation.navigate('OfferDetails', { item })}
            />
          ))}
        </ScrollView>
      )}

      <Modal
        visible={recentlyVisitedModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setRecentlyVisitedModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalSearchBar}>
            <TouchableOpacity onPress={() => setRecentlyVisitedModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#999" style={{ marginRight: 8 }} />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Recently Visited</Text>
          </View>
          {recentlyVisited.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 32, color: '#999' }}>
              No recently visited deals.
            </Text>
          ) : (
            <FlatList
              data={
                recentlyVisited.length % 2 === 1
                  ? [...recentlyVisited, { id: 'empty', empty: true }]
                  : recentlyVisited
              }
              keyExtractor={(item) => item.id}
              renderItem={({ item }) =>
                item.empty ? (
                  <View style={{ flex: 1, aspectRatio: 1, margin: 4, backgroundColor: 'transparent' }} />
                ) : (
                  <RecentlyVisitedCard
                    item={item}
                    style={{ flex: 1, aspectRatio: 1, margin: 4 }}
                    onPress={() => {
                      setRecentlyVisitedModalVisible(false);
                      handleRecentlyVisitedPress(item);
                    }}
                  />
                )
              }
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 60, // Adjust for iOS status bar
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
  sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
},
 sectionHeaderButtons: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8, // only works in RN >= 0.71
},

clearButtonSmall: {
  marginRight: 8,
  paddingHorizontal: 10,
  paddingVertical: 5,
  backgroundColor: '#ef4444',
  borderRadius: 5,
},

  clearButtonSmallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
    sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationButton: {
    padding: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    color: '#999',
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 4,      // reduced from 10
    paddingHorizontal: 4,    // reduced from 10
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 2,     // reduced from 5
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFilterButton: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedFilterText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
  },
  recentlyVisitedSection: {
    marginBottom: 20,
  },
  seeAllText: {
    color: '#6366f1',
    fontWeight: '500',
    fontSize: 14,
  },
  recentlyVisitedList: {
    paddingRight: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  categoriesList: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-around',
  },
  pickerStyle: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  pickerItemStyle: {
    fontSize: 16,
  },
  notificationButton: {
    padding: 8,
  },
});

export default DealsScreen;









