import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DealsModal = ({ visible, deals, restaurantName, onClose, onDealPress }) => {
  if (!deals || deals.length === 0) return null;

  const formatPrice = (price) => {
    if (!price) return '';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDiscount = (deal) => {
    if (deal.discount_percentage) {
      return `${deal.discount_percentage}% OFF`;
    }
    if (deal.discount_amount) {
      return `$${deal.discount_amount} OFF`;
    }
    if (deal.original_price && deal.discounted_price) {
      const savings = parseFloat(deal.original_price) - parseFloat(deal.discounted_price);
      return `Save $${savings.toFixed(2)}`;
    }
    return 'Special Deal';
  };

  const renderDealCard = (deal) => {
    const defaultImage = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop';
    const imageUri = deal.images?.find((img) => img.is_main)?.image_url || 
                    deal.images?.[0]?.image_url || 
                    defaultImage;

    return (
      <TouchableOpacity 
        key={deal.id} 
        style={styles.dealCard}
        onPress={() => onDealPress && onDealPress(deal)}
      >
        <View style={styles.dealImageContainer}>
          <Image source={{ uri: imageUri }} style={styles.dealImage} />
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{formatDiscount(deal)}</Text>
          </View>
        </View>
        
        <View style={styles.dealInfo}>
          <Text style={styles.dealTitle} numberOfLines={2}>{deal.title}</Text>
          <Text style={styles.dealDescription} numberOfLines={3}>{deal.description}</Text>
          
          <View style={styles.priceContainer}>
            {deal.original_price && deal.discounted_price ? (
              <View style={styles.priceRow}>
                <Text style={styles.originalPrice}>{formatPrice(deal.original_price)}</Text>
                <Text style={styles.discountedPrice}>{formatPrice(deal.discounted_price)}</Text>
              </View>
            ) : deal.price_adult ? (
              <Text style={styles.price}>Adult: {formatPrice(deal.price_adult)}</Text>
            ) : null}
          </View>

          {deal.valid_to && (
            <View style={styles.validityContainer}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.validityText}>
                Valid until {new Date(deal.valid_to).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Deals</Text>
            <Text style={styles.headerSubtitle}>{restaurantName}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.dealsContainer}>
            <Text style={styles.dealsCount}>
              {deals.length} deal{deals.length !== 1 ? 's' : ''} available
            </Text>
            
            {deals.map(renderDealCard)}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
  headerTitleContainer: {
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
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  dealsContainer: {
    padding: 16,
  },
  dealsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  dealCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
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
  dealImageContainer: {
    position: 'relative',
    height: 180,
  },
  dealImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dealInfo: {
    padding: 16,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  dealDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  priceContainer: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  validityText: {
    fontSize: 12,
    color: '#666',
  },
});

export default DealsModal;

