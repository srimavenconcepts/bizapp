import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RecentlyVisitedCard = ({ item, onPress, style }) => {
  const formatVisitedTime = (visitedAt) => {
    const now = new Date();
    const visited = new Date(visitedAt);
    const diffInHours = Math.floor((now - visited) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.restaurant} numberOfLines={1}>
          {item.restaurant}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text style={styles.rating}>{typeof item.rating === 'number' ? item.rating.toFixed(1) : '0.0'}</Text>
          </View>
          <Text style={styles.visitedTime}>
            {formatVisitedTime(item.visitedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 4, // Use margin for spacing between cards
    flex: 1,   // Allow card to expand equally in row
    aspectRatio: 1, // Make it square
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  restaurant: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 2,
  },
  visitedTime: {
    fontSize: 10,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});

export default RecentlyVisitedCard;