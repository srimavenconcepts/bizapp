import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

const { width } = Dimensions.get('window');

const FavoriteCard = ({ item, onViewDeal, onDetails, onRemove }) => {
  const [isFavorited, setIsFavorited] = useState(true);
  const [loading, setLoading] = useState(false);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={10} color="#FFD700" />);
    }

    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={10} color="#FFD700" />);
    }

    return stars;
  };

  const handleHeartPress = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (isFavorited) {
        await authService.removeFromFavorites(item.id);
        setIsFavorited(false);
        // Notify parent component to remove from list
        if (onRemove) {
          onRemove(item.id);
        }
      } else {
        await authService.addToFavorites(item);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.foodImage} />
        {item.discount && (
          <View style={[styles.discountBadge, { backgroundColor: item.discountColor || '#6366f1' }]}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.heartIcon} 
          onPress={handleHeartPress}
          disabled={loading}
        >
          <Ionicons 
            name={isFavorited ? "heart" : "heart-outline"} 
            size={18} 
            color={isFavorited ? "#ff4757" : "#fff"} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.restaurantName}>{item.restaurant}</Text>
        <Text style={styles.dishName} numberOfLines={2}>{item.dishName || item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {renderStars(item.rating)}
          </View>
          <Text style={styles.ratingText}>
            {item.rating} ({item.reviewCount || item.reviews || '0'} Reviews)
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.viewDealButton} 
            onPress={() => onViewDeal && onViewDeal(item)}
          >
            <Text style={styles.viewDealText}>View Deal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.detailsButton} 
            onPress={() => onDetails && onDetails(item)}
          >
            <Text style={styles.detailsText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  heartIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 6,
  },
  cardContent: {
    padding: 10,
  },
  restaurantName: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
  },
  dishName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    lineHeight: 16,
  },
  description: {
    fontSize: 10,
    color: '#666',
    lineHeight: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  ratingText: {
    fontSize: 10,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewDealButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 4,
    alignItems: 'center',
  },
  viewDealText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  detailsButton: {
    backgroundColor: 'transparent',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6366f1',
    flex: 1,
    marginLeft: 4,
    alignItems: 'center',
  },
  detailsText: {
    color: '#6366f1',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default FavoriteCard;

