import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import FavoriteCard from '../components/FavoriteCard';
import { useFavorites } from '../contexts/FavoritesContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 16px padding on each side + 16px gap between cards

const FavoritesScreen = ({ navigation }) => {
  const { favorites: favoriteItems, loading, removeFromFavorites } = useFavorites();

  const onRefresh = useCallback(async () => {
    // The context automatically manages the state, so we don't need to manually refresh
    // The favorites will be updated automatically when the context loads
    // We can trigger a re-fetch by calling the context's refresh method if available
    // For now, this will just show the refresh animation briefly
  }, []);

  const handleRemoveFromFavorites = async (itemId) => {
    // Remove item using context method
    await removeFromFavorites(itemId);
  };

  const handleViewDeal = (item) => {
    // Navigate to offer details or deal page
    navigation.navigate('OfferDetails', { item: {
      ...item,
      title: item.dishName || item.title,
      restaurant: item.restaurant,
      description: item.description,
      rating: item.rating,
      distance: item.distance || '1.2 mi', // Default distance if not available
      discount: item.discount,
      image: item.image,
    }});
  };

  const handleDetails = (item) => {
    // Navigate to detailed view
    navigation.navigate('OfferDetails', { item: {
      ...item,
      title: item.dishName || item.title,
      restaurant: item.restaurant,
      description: item.description,
      rating: item.rating,
      distance: item.distance || '1.2 mi', // Default distance if not available
      discount: item.discount,
      image: item.image,
    }});
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Favorites Yet</Text>
      <Text style={styles.emptyDescription}>
        Start adding your favorite restaurants and deals by tapping the heart icon on any item.
      </Text>
      <TouchableOpacity 
        style={styles.browseButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.browseButtonText}>Browse Restaurants</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFavoriteItems = () => {
    if (favoriteItems.length === 0) {
      return renderEmptyState();
    }

    const rows = [];
    for (let i = 0; i < favoriteItems.length; i += 2) {
      const leftItem = favoriteItems[i];
      const rightItem = favoriteItems[i + 1];
      
      rows.push(
        <View key={i} style={styles.row}>
          <View style={[styles.cardContainer, { width: cardWidth }]}>
            <FavoriteCard
              item={leftItem}
              onViewDeal={handleViewDeal}
              onDetails={handleDetails}
              onRemove={handleRemoveFromFavorites}
            />
          </View>
          {rightItem && (
            <View style={[styles.cardContainer, { width: cardWidth }]}>
              <FavoriteCard
                item={rightItem}
                onViewDeal={handleViewDeal}
                onDetails={handleDetails}
                onRemove={handleRemoveFromFavorites}
              />
            </View>
          )}
        </View>
      );
    }
    return rows;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favorites</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        {favoriteItems.length > 0 && (
          <Text style={styles.headerSubtitle}>
            {favoriteItems.length} item{favoriteItems.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
      >
        {renderFavoriteItems()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  cardContainer: {
    // Width is set dynamically in renderFavoriteItems
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FavoritesScreen;

