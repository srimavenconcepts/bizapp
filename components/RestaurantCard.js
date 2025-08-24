import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getDealsForRestaurant } from '../services/api';

const RestaurantCard = ({ restaurant, onPress }) => {
  const [deals, setDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(false);

  useEffect(() => {
    const fetchDeals = async () => {
      if (restaurant.id) {
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

    fetchDeals();
  }, [restaurant.id]);

  const handleCardPress = () => {
    // Pass deals data to the onPress handler
    onPress({ ...restaurant, deals });
  };

  const handleDealsPress = (e) => {
    e.stopPropagation(); // Prevent triggering the card press
    // Navigate to deals screen with restaurant filter
    if (onPress) {
      onPress({ ...restaurant, deals }, 'deals');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={`full-${i}`} name="star" size={14} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={14} color="#FFD700" />);
    }

    // Fill remaining stars with outline
    const remainingStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#ddd" />);
    }

    return stars;
  };

  const formatCuisines = (cuisines) => {
    if (!cuisines || cuisines.length === 0) return 'Various Cuisines';
    return cuisines.slice(0, 2).join(', ') + (cuisines.length > 2 ? '...' : '');
  };

  const formatPrice = (price) => {
    return price || '$';
  };

  // Default image if none provided
  const defaultImage = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop';
  const imageUri = restaurant.image_url || defaultImage;
  //console.log('RestaurantCard - Image URI:', imageUri);
  const ratingValue = Number(
    restaurant.avg_rating ??
    restaurant.rating ??
    0
  );

  return (
    <TouchableOpacity style={styles.restaurantCard} onPress={handleCardPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.restaurantImage} />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{formatPrice(restaurant.price)}</Text>
        </View>
        {deals && deals.length > 0 && (
          <TouchableOpacity style={styles.dealLabel} onPress={handleDealsPress}>
            <Ionicons name="pricetag" size={16} color="#fff" />
            <Text style={styles.dealText}>{deals.length} Deal{deals.length > 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.restaurantInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(ratingValue)}
            </View>
            <Text style={styles.ratingText}>
              {isNaN(ratingValue) ? 'N/A' : ratingValue.toFixed(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.cuisineText} numberOfLines={1}>
          {formatCuisines(restaurant.cuisines)}
        </Text>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.addressText} numberOfLines={1}>
            {restaurant.address ||
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
            }
          </Text>
        </View>

        {restaurant.phone && (
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={14} color="#666" />
            <Text style={styles.phoneText}>{restaurant.phone}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dealLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dealText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  restaurantInfo: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cuisineText: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 8,
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
});

export default RestaurantCard;

