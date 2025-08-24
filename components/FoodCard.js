import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../contexts/FavoritesContext';

const FoodCard = ({ item, onPress }) => {
  const [loading, setLoading] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleHeartPress = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await toggleFavorite(item);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={12} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={12} color="#FFD700" />);
    }

    return stars;
  };

  return (
    <TouchableOpacity style={styles.foodItem} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.foodImage} />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>
        <TouchableOpacity 
          style={styles.heartIcon} 
          onPress={handleHeartPress}
          disabled={loading}
        >
          <Ionicons 
            name={isFavorite(item.id) ? "heart" : "heart-outline"} 
            size={20} 
            color={isFavorite(item.id) ? "#ff4757" : "#fff"} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.foodInfo}>
        <Text style={styles.restaurantName}>{item.restaurant}</Text>
        <Text style={styles.foodTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.foodDescription} numberOfLines={3}>{item.description}</Text>
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {renderStars(item.rating)}
          </View>
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.distanceText}>{item.distance}</Text>
          {/* <TouchableOpacity 
            style={styles.heartIconSmall} 
            onPress={handleHeartPress}
            disabled={loading}
          >
            <Ionicons 
              name={isFavorited ? "heart" : "heart-outline"} 
              size={16} 
              color={isFavorited ? "#ff4757" : "#ccc"} 
            />
          </TouchableOpacity> */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  foodItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
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
  },
  foodImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  foodInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  foodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  foodDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  heartIconSmall: {
    padding: 4,
  },
});

export default FoodCard;

