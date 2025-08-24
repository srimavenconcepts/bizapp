import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationItem = ({ notification, onMarkAsRead, onDelete, onPress }) => {
  const getIconName = () => {
    switch (notification.type) {
      case 'deal':
      case 'deal_update':
        return 'pricetag';
      case 'promotional':
        return 'megaphone';
      default:
        return 'notifications';
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'deal':
      case 'deal_update':
        return '#10b981';
      case 'promotional':
        return '#f59e0b';
      default:
        return '#6366f1';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(notification.id) },
      ]
    );
  };

  const handlePress = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (onPress) {
      onPress(notification);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.isRead && styles.unreadContainer
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={getIconName()}
              size={20}
              color={getIconColor()}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={[
              styles.title,
              !notification.isRead && styles.unreadTitle
            ]}>
              {notification.title}
            </Text>
            <Text style={styles.timestamp}>
              {formatTime(notification.timestamp)}
            </Text>
          </View>
          <View style={styles.actions}>
            {!notification.isRead && (
              <View style={styles.unreadDot} />
            )}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[
          styles.body,
          !notification.isRead && styles.unreadBody
        ]}>
          {notification.body}
        </Text>
        {notification.type === 'deal' && notification.data?.deal && (
          <View style={styles.dealInfo}>
            <Text style={styles.dealText}>
              🏪 {notification.data.deal.restaurant}
            </Text>
            {notification.data.deal.discount && (
              <Text style={styles.discountText}>
                {notification.data.deal.discount} OFF
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadContainer: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  unreadTitle: {
    color: '#111827',
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  body: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  unreadBody: {
    color: '#374151',
  },
  dealInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  dealText: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
    marginBottom: 4,
  },
  discountText: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
});

export default NotificationItem;

