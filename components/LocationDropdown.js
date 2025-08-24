import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LocationDropdown = ({ onLocationChange, style, defaultZipCode }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("Enter ZIP Code");
  const [zipCodeInput, setZipCodeInput] = useState("");

  useEffect(() => {
    if (defaultZipCode) {
      setCurrentLocation(`ZIP ${defaultZipCode}`);
    }
  }, [defaultZipCode]);

  const handleZipCodeSubmit = () => {
    if (zipCodeInput.trim() && zipCodeInput.trim().length === 5) {
      const customLocation = {
        name: `ZIP ${zipCodeInput.trim()}`,
        zipCode: zipCodeInput.trim(),
        city: null,
        isCurrentLocation: false,
      };
      
      setCurrentLocation(customLocation.name);
      setModalVisible(false);
      setZipCodeInput('');
      
      if (onLocationChange) {
        onLocationChange(customLocation);
      }
    } else {
      Alert.alert("Invalid ZIP Code", "Please enter a valid 5-digit ZIP code.");
    }
  };

  const handleClearLocation = () => {
    setCurrentLocation("Enter ZIP Code");
    setModalVisible(false);
    setZipCodeInput('');
    
    if (onLocationChange) {
      onLocationChange(null); // Clear location to show all restaurants
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.buttonContent}>
          <Ionicons name="location" size={16} color="#6366f1" style={styles.buttonIcon} />
          <Text style={styles.buttonText} numberOfLines={1}>
            {currentLocation}
          </Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {/* ZIP Code Input Section */}
          <View style={styles.zipCodeSection}>
            <Text style={styles.zipCodeLabel}>Enter ZIP Code:</Text>
            <View style={styles.zipCodeInputContainer}>
              <TextInput
                style={styles.zipCodeInput}
                placeholder="Enter 5-digit ZIP code"
                value={zipCodeInput}
                onChangeText={setZipCodeInput}
                keyboardType="numeric"
                maxLength={5}
              />
              <TouchableOpacity
                style={styles.zipCodeSubmitButton}
                onPress={handleZipCodeSubmit}
              >
                <Text style={styles.zipCodeSubmitText}>Go</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Clear Location Option */}
          {/*<View style={styles.clearSection}>
            <TouchableOpacity
              style={styles.clearLocationButton}
              onPress={handleClearLocation}
            >
              <Ionicons name="globe-outline" size={20} color="#6366f1" style={styles.clearIcon} />
              <Text style={styles.clearLocationText}>Show All Restaurants</Text>
            </TouchableOpacity>
            <Text style={styles.clearLocationSubtext}>
              Remove location filter to see all available restaurants
            </Text>
          </View>*/}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 120,
    maxWidth: 200,
  },
  dropdownButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  zipCodeSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  zipCodeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  zipCodeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zipCodeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    marginRight: 8,
  },
  zipCodeSubmitButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  zipCodeSubmitText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  clearSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  clearLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  clearIcon: {
    marginRight: 12,
  },
  clearLocationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366f1',
  },
  clearLocationSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    paddingHorizontal: 16,
  },
});

export default LocationDropdown;