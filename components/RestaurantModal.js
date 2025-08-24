import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDealsForRestaurant } from '../services/api';
import DealsModal from './DealsModal';

const RestaurantModal = ({ visible, restaurant, onClose, navigation }) => {
  const [deals, setDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [dealsModalVisible, setDealsModalVisible] = useState(false);

  // Fetch deals when restaurant changes
  useEffect(() => {
    const fetchDeals = async () => {
      if (restaurant && restaurant.id) {
        setLoadingDeals(true);
        try {
          //console.log('Fetching deals for restaurant ID:', restaurant.id);
          const response = await getDealsForRestaurant(restaurant.id);
          //console.log('Deals fetched:', response);
          setDeals(Array.isArray(response) ? response : response.deals || []);
        } catch (error) {
          console.error('Error fetching deals for restaurant:', error);
          setDeals([]);
        } finally {
          setLoadingDeals(false);
        }
      }
    };

    if (visible && restaurant) {
      fetchDeals();
    }
  }, [restaurant, visible]);

  if (!restaurant) return null;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#FFD700" />);
    }

    // Fill remaining stars with outline
    const remainingStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#ddd" />);
    }

    return stars;
  };

  const formatCuisines = (cuisines, categories) => {
    if (cuisines && cuisines.length > 0) return cuisines.join(', ');
    if (categories && categories.length > 0) return categories.map(c => c.title).join(', ');
    return 'Various Cuisines';
  };

  const formatHours = (hours) => {
    if (!hours) return 'Hours not available';
    if (typeof hours === 'string') return hours;
    if (typeof hours === 'object') {
      return Object.entries(hours)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    }
    return 'Hours not available';
  };

  const handlePhonePress = () => {
    if (restaurant.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    }
  };

  const handleWebsitePress = () => {
    if (restaurant.website) {
      Linking.openURL(restaurant.website);
    }
  };

  const handleMenuPress = () => {
    if (restaurant.attributes && restaurant.attributes.menu_url) {
      Linking.openURL(restaurant.attributes.menu_url);
    }
  };

  // Helper to get the best address string
  const getDisplayAddress = (restaurant) => {
    return (
      restaurant.address ||
      [
        restaurant.address1,
        restaurant.address2,
        restaurant.address3,
        restaurant.city && restaurant.state && restaurant.zip_code
          ? `${restaurant.city}, ${restaurant.state} ${restaurant.zip_code}`
          : null,
      ]
        .filter(Boolean)
        .join(', ') ||
      (Array.isArray(restaurant.display_address)
        ? restaurant.display_address.join(', ')
        : '')
    );
  };

  const handleDirectionsPress = () => {
    const address = getDisplayAddress(restaurant);
    if (address) {
      const encodedAddress = encodeURIComponent(address);
      const url = `https://maps.google.com/?q=${encodedAddress}`;
      Linking.openURL(url);
    }
  };

  const handleViewDealsPress = () => {
    setDealsModalVisible(true);
  };

  const handleDealPress = (deal) => {
    setDealsModalVisible(false);
    onClose(); // Close restaurant modal
    if (navigation) {
      navigation.navigate('OfferDetails', { item: {
        id: deal.id,
        title: deal.title,
        restaurant: restaurant.name,
        restaurantId: restaurant.id,
        description: deal.description,
        rating: restaurant.avg_rating || restaurant.rating || 0,
        distance: '',
        discount: deal.discount_percentage ? `${deal.discount_percentage}% OFF` : '',
        image: deal.images?.find((img) => img.is_main)?.image_url || 
               deal.images?.[0]?.image_url || 
               '',
      }});
    }
  };

  // Default image if none provided
  const defaultImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop';
  const imageUri = restaurant.image || restaurant.imageUrl || restaurant.image_url || defaultImage;

  // Parse and normalize the rating value
  const rating = Number(restaurant.avg_rating || restaurant.rating);

  const phoneNumber = restaurant.display_phone || restaurant.phone;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Restaurant Details</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.restaurantImage} />
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{restaurant.price || '$'}</Text>
            </View>
          </View>

          <View style={styles.restaurantInfo}>
            <View style={styles.titleSection}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {renderStars(rating)}
                </View>
                <Text style={styles.ratingText}>
                  {rating ? rating.toFixed(1) : 'N/A'}
                </Text>
              </View>
              {restaurant.review_count && (
                <Text style={{ color: '#666', fontSize: 14, marginLeft: 8 }}>
                  {restaurant.review_count} reviews
                </Text>
              )}
            </View>

            <Text style={styles.cuisineText}>
              {formatCuisines(restaurant.cuisines, restaurant.categories)}
            </Text>

            {restaurant.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <Text style={styles.descriptionText}>{restaurant.description}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>

              <TouchableOpacity style={styles.contactItem} onPress={handleDirectionsPress}>
                <Ionicons name="location" size={20} color="#6366f1" />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Address</Text>
                  <Text style={styles.contactValue}>{getDisplayAddress(restaurant)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>

              {phoneNumber && (
                <TouchableOpacity style={styles.contactItem} onPress={handlePhonePress}>
                  <Ionicons name="call" size={20} color="#6366f1" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactValue}>{phoneNumber}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </TouchableOpacity>
              )}

              {/* {restaurant.website && (
                <TouchableOpacity style={styles.contactItem} onPress={handleWebsitePress}>
                  <Ionicons name="globe" size={20} color="#6366f1" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Website</Text>
                    <Text style={styles.contactValue}>{restaurant.website}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </TouchableOpacity>
              )} */}

              {restaurant.attributes && restaurant.attributes.menu_url && (
                <TouchableOpacity style={styles.contactItem} onPress={handleMenuPress}>
                  <Ionicons name="restaurant" size={20} color="#6366f1" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Menu</Text>
                    <Text style={styles.contactValue} numberOfLines={1}>View Menu</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </TouchableOpacity>
              )}
            </View>

            {restaurant.hours && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Operating Hours</Text>
                <Text style={styles.hoursText}>{formatHours(restaurant.hours)}</Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              {deals && deals.length > 0 && (
                <TouchableOpacity style={styles.dealButton} onPress={handleViewDealsPress}>
                  <Ionicons name="pricetag" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>View Deals ({deals.length})</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.actionButton} onPress={handlePhonePress}>
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={handleDirectionsPress}>
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>

      <DealsModal
        visible={dealsModalVisible}
        deals={deals}
        restaurantName={restaurant.name}
        onClose={() => setDealsModalVisible(false)}
        onDealPress={handleDealPress}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingTop: 50, // Account for status bar
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40, // Same width as close button for centering
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cuisineText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    minWidth: 120,
  },
  dealButton: {
    flex: 1,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    minWidth: 120,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RestaurantModal;

