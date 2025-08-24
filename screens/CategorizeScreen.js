import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategories } from '../services/api';

const CategorizeScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      // Assuming getCategories returns an array of strings or objects with a 'name' property
      const formattedCategories = response.map(cat => typeof cat === 'string' ? { id: cat, name: cat } : cat);
      setCategories(formattedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to dummy data if API fails or for initial development
      setCategories([
        { id: '1', name: 'Italian' },
        { id: '2', name: 'American' },
        { id: '3', name: 'Indian' },
        { id: '4', name: 'Mexican' },
        { id: '5', name: 'Chinese' },
        { id: '6', name: 'Japanese' },
        { id: '7', name: 'Dessert' },
        { id: '8', name: 'Fast Food' },
        { id: '9', name: 'Vegetarian' },
        { id: '10', name: 'Vegan' },
        { id: '11', name: 'Breakfast' },
        { id: '12', name: 'Lunch' },
        { id: '13', name: 'Dinner' },
        { id: '14', name: 'Seafood' },
        { id: '15', name: 'Steakhouse' },
        { id: '16', name: 'Cafe' },
        { id: '17', name: 'Bakery' },
        { id: '18', name: 'Pub Food' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCategories();
    } catch (error) {
      console.error('Error refreshing categories:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryPress = (categoryName) => {
    // Navigate to the SearchOffersScreen and pass the category as a search parameter
    navigation.navigate('Home', { screen: 'SearchOffers', params: { initialSearchText: categoryName } });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryItem} onPress={() => handleCategoryPress(item.name)}>
      <Text style={styles.categoryText}>{item.name}</Text>
      <Ionicons name="chevron-forward-outline" size={20} color="#6b7280" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Categories</Text>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.id.toString()} // Ensure key is a string
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366f1']}
              tintColor="#6366f1"
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No categories found.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937',
    textAlign: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default CategorizeScreen;


