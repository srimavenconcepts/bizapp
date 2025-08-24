import { getDeals } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

class DealMonitorService {
  constructor() {
    this.isMonitoring = false;
    this.intervalId = null;
    this.lastKnownDeals = [];
    this.notificationCallback = null;
    this.STORAGE_KEY = '@last_known_deals';
    this.POLL_INTERVAL = 30000; // 30 seconds
  }

  // Initialize the service with notification callback
  initialize(notificationCallback) {
    this.notificationCallback = notificationCallback;
    this.loadLastKnownDeals();
  }

  // Load last known deals from storage
  async loadLastKnownDeals() {
    try {
      const storedDeals = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedDeals) {
        this.lastKnownDeals = JSON.parse(storedDeals);
      }
    } catch (error) {
      console.error('Error loading last known deals:', error);
    }
  }

  // Save current deals to storage
  async saveLastKnownDeals(deals) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(deals));
      this.lastKnownDeals = deals;
    } catch (error) {
      console.error('Error saving last known deals:', error);
    }
  }

  // Check for new deals
  async checkForNewDeals() {
    try {
      const response = await getDeals();
      const currentDeals = response.deals || [];
      
      if (this.lastKnownDeals.length === 0) {
        // First time loading, just save current deals
        await this.saveLastKnownDeals(currentDeals);
        return;
      }

      // Find new deals by comparing IDs
      const lastKnownIds = new Set(this.lastKnownDeals.map(deal => deal.id));
      const newDeals = currentDeals.filter(deal => !lastKnownIds.has(deal.id));

      // Notify about new deals
      if (newDeals.length > 0 && this.notificationCallback) {
        for (const deal of newDeals) {
          // Ensure restaurant is a string for notification display
          const dealForNotification = {
            ...deal,
            restaurant: typeof deal.restaurant === 'string' 
              ? deal.restaurant 
              : deal.restaurant?.name || 'Restaurant'
          };
          await this.notificationCallback(dealForNotification);
        }
      }

      // Update last known deals
      await this.saveLastKnownDeals(currentDeals);
      
    } catch (error) {
      console.error('Error checking for new deals:', error);
    }
  }

  // Start monitoring for new deals
  startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    
    // Initial check
    this.checkForNewDeals();
    
    // Set up periodic checking
    this.intervalId = setInterval(() => {
      this.checkForNewDeals();
    }, this.POLL_INTERVAL);

    //console.log('Deal monitoring started');
  }

  // Stop monitoring
  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    //console.log('Deal monitoring stopped');
  }

  // Get monitoring status
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      lastKnownDealsCount: this.lastKnownDeals.length,
      pollInterval: this.POLL_INTERVAL,
    };
  }

  // Manually trigger a check (for testing)
  async manualCheck() {
    await this.checkForNewDeals();
  }

  // Reset stored deals (for testing)
  async resetStoredDeals() {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      this.lastKnownDeals = [];
      //console.log('Stored deals reset');
    } catch (error) {
      console.error('Error resetting stored deals:', error);
    }
  }

  // Set custom poll interval
  setPollInterval(intervalMs) {
    this.POLL_INTERVAL = intervalMs;
    
    // Restart monitoring with new interval if currently monitoring
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }
}

// Create and export singleton instance
const dealMonitorService = new DealMonitorService();
export default dealMonitorService;

