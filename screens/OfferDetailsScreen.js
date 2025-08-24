import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRestaurantById } from '../services/api'; // update import
import { addToRecentlyVisited } from '../services/recentlyVisited'; // Add this import

const tabs = ['Promos', 'Cashback and loyalty', 'Store info', 'Reviews']; // <-- Add this line

const OfferDetailsScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [activeTab, setActiveTab] = useState('Promos');
  // const [restaurantInfo, setRestaurantInfo] = useState({});
  const [restaurantInfo, setRestaurantInfo] = useState({});

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await getRestaurantById(item.restaurantId);
        setRestaurantInfo(data);
      } catch (e) {
        console.error('Error fetching restaurant details:', e);
      }
    };
    fetchRestaurant();
  }, [item]);

  // Add to recently visited when component mounts
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await addToRecentlyVisited(item);
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };
    
    trackVisit();
  }, [item]);

  // Use restaurantInfo for details
  const restaurantDetails = {
    name: item.restaurant,
    address: restaurantInfo?.address || 'N/A',
    phone: restaurantInfo?.phone || 'N/A',
    hours: restaurantInfo?.hours || {},
    cuisine: restaurantInfo?.cuisines?.join(', ') || 'N/A',
    priceRange: restaurantInfo?.price || 'N/A',
    features: ['Takeout', 'Delivery', 'Dine-in', 'Outdoor Seating'],
    rating: item.rating,
    totalReviews: item.views || 0,
  };

  const handleContactPress = () => {
    Alert.alert(
      'Contact Restaurant',
      `Call ${restaurantDetails.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${restaurantDetails.phone}`);
          },
        },
      ]
    );
  };

  const handleDirectionsPress = () => {
    const address = encodeURIComponent(restaurantDetails.address);
    const url = `https://maps.google.com/?q=${address}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.foodImage} />
          <TouchableOpacity style={styles.heartIcon}>
            <Ionicons name="heart-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareIcon}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.restaurantName}>{restaurantDetails.name}</Text>
            <Text style={styles.foodTitle}>{item.title}</Text>
            <Text style={styles.foodCategory}>Food • {restaurantDetails.cuisine}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{Math.round(restaurantDetails.rating * 10) / 10}</Text>
            </View>
          </View>

          {/* Restaurant Details Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Restaurant Details</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#6366f1" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{restaurantDetails.address}</Text>
              </View>
              <TouchableOpacity onPress={handleDirectionsPress} style={styles.actionButton}>
                <Ionicons name="navigate-outline" size={16} color="#6366f1" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#6366f1" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Hours</Text>
                {restaurantDetails.hours && Object.entries(restaurantDetails.hours).map(([day, time]) => (
                  <Text style={styles.detailValue} key={day}>
                    {day}: {time}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="restaurant-outline" size={20} color="#6366f1" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Cuisine Type</Text>
                <Text style={styles.detailValue}>{restaurantDetails.cuisine}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="card-outline" size={20} color="#6366f1" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Price Range</Text>
                <Text style={styles.detailValue}>{restaurantDetails.priceRange} • Moderate</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="star-outline" size={20} color="#6366f1" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Rating</Text>
                <Text style={styles.detailValue}>
                  {restaurantDetails.rating} stars ({restaurantDetails.totalReviews} reviews)
                </Text>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={styles.detailLabel}>Features</Text>
              <View style={styles.featuresRow}>
                {restaurantDetails.features.map((feature, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Contact Restaurant</Text>
              <Text style={styles.phoneNumber}>{restaurantDetails.phone}</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          {activeTab === 'Promos' && (
            <View style={styles.promosContainer}>
              <Text style={styles.promosTitle}>Promos</Text>
              <View style={styles.promoCard}>
                <View style={styles.promoIcon}>
                  <Ionicons name="checkmark" size={20} color="#6366f1" />
                </View>
                <View style={styles.promoContent}>
                  <Text style={styles.promoTitle}>$5 Off First Order</Text>
                  <Text style={styles.promoDescription}>
                    New users only • Min spend $20
                  </Text>
                  <Text style={styles.promoExpiry}>
                    Valid for new users only. Expires 31/12/2024. Max discount $5.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'Store info' && (
            <View style={styles.storeInfoContainer}>
              <Text style={styles.promosTitle}>Store Information</Text>
              <Text style={styles.storeDescription}>
                {restaurantDetails.name} is a premier dining destination specializing in authentic {restaurantDetails.cuisine.toLowerCase()} cuisine. 
                Our experienced chefs use only the freshest ingredients to create memorable dining experiences for our guests.
              </Text>
              <View style={styles.storeStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>5+</Text>
                  <Text style={styles.statLabel}>Years Experience</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{restaurantDetails.totalReviews}</Text>
                  <Text style={styles.statLabel}>Happy Customers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{restaurantDetails.rating}</Text>
                  <Text style={styles.statLabel}>Average Rating</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'Reviews' && (
            <View style={styles.reviewsContainer}>
              <Text style={styles.promosTitle}>Customer Reviews</Text>
              <Text style={styles.reviewsPlaceholder}>
                Reviews feature coming soon. Check back later to see what other customers are saying!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: 300,
  },
  heartIcon: {
    position: 'absolute',
    top: 16,
    right: 60,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    padding: 16,
  },
  titleContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  foodTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  foodCategory: {
    fontSize: 14,
    color: '#999',
  },
  ratingBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButton: {
    padding: 8,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  featureTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
  },
  phoneNumber: {
    color: '#e0e7ff',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  promosContainer: {
    marginTop: 16,
  },
  promosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  promoCard: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 16,
  },
  promoIcon: {
    backgroundColor: '#e0e7ff',
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  promoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  promoExpiry: {
    fontSize: 12,
    color: '#999',
  },
  storeInfoContainer: {
    marginTop: 16,
  },
  storeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  storeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  reviewsContainer: {
    marginTop: 16,
  },
  reviewsPlaceholder: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default OfferDetailsScreen;

