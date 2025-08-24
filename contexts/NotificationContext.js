import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Storage keys
  const NOTIFICATIONS_KEY = '@notifications';
  const UNREAD_COUNT_KEY = '@unread_count';

  // Load notifications from storage on app start
  useEffect(() => {
    loadNotifications();
  }, []);

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.isRead).length;
    setUnreadCount(count);
    saveUnreadCount(count);
  }, [notifications]);

  // Load notifications from AsyncStorage
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      const storedCount = await AsyncStorage.getItem(UNREAD_COUNT_KEY);
      
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications);
        setNotifications(parsedNotifications);
      }
      
      if (storedCount) {
        setUnreadCount(parseInt(storedCount, 10));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save notifications to AsyncStorage
  const saveNotifications = async (notificationsToSave) => {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notificationsToSave));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  // Save unread count to AsyncStorage
  const saveUnreadCount = async (count) => {
    try {
      await AsyncStorage.setItem(UNREAD_COUNT_KEY, count.toString());
    } catch (error) {
      console.error('Error saving unread count:', error);
    }
  };

  // Add a new notification
  const addNotification = async (notification) => {
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false,
      ...notification,
    };

    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);

    // Show local notification if app is in foreground
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      },
      trigger: null, // Show immediately
    });

    return newNotification;
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: true,
    }));
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    setNotifications(updatedNotifications);
    await saveNotifications(updatedNotifications);
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    setNotifications([]);
    await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    await AsyncStorage.removeItem(UNREAD_COUNT_KEY);
    setUnreadCount(0);
  };

  // Add a deal notification
  const addDealNotification = async (deal) => {
    return await addNotification({
      type: 'deal',
      title: 'New Deal Available!',
      body: `Check out the new deal: ${deal.title}`,
      data: { dealId: deal.id, deal },
    });
  };

  // Add a deal update notification
  const addDealUpdateNotification = async (deal) => {
    return await addNotification({
      type: 'deal_update',
      title: 'Deal Updated!',
      body: `${deal.title} has been updated with new offers`,
      data: { dealId: deal.id, deal },
    });
  };

  // Add a promotional notification
  const addPromotionalNotification = async (title, body, data = {}) => {
    return await addNotification({
      type: 'promotional',
      title,
      body,
      data,
    });
  };

  // Get notifications by type
  const getNotificationsByType = (type) => {
    return notifications.filter(notification => notification.type === type);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.isRead);
  };

  // Simulate new deal notifications (for demo purposes)
  const simulateNewDeal = async () => {
    const mockDeal = {
      id: Date.now().toString(),
      title: 'Pizza Palace Special',
      description: '50% off on all pizzas today only!',
      discount: '50%',
      restaurant: 'Pizza Palace',
    };
    
    await addDealNotification(mockDeal);
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addDealNotification,
    addDealUpdateNotification,
    addPromotionalNotification,
    getNotificationsByType,
    getUnreadNotifications,
    simulateNewDeal, // For demo purposes
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

