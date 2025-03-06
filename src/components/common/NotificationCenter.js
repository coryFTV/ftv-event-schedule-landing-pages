import React, { useState, useEffect } from 'react';
import {
  subscribeToNotifications,
  removeNotification,
  NOTIFICATION_TYPES,
} from '../../utils/notificationService';
import './NotificationCenter.css';

/**
 * Component to display notifications
 * @returns {JSX.Element} NotificationCenter component
 */
const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Subscribe to notification changes
    const unsubscribe = subscribeToNotifications(setNotifications);
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // If no notifications, don't render anything
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-center">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

/**
 * Individual notification component
 * @param {Object} props Component props
 * @param {Object} props.notification Notification object
 * @param {Function} props.onClose Function to call when notification is closed
 * @returns {JSX.Element} Notification component
 */
const Notification = ({ notification, onClose }) => {
  const { type, message } = notification;
  
  // Get icon based on notification type
  const getIcon = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return '✓';
      case NOTIFICATION_TYPES.ERROR:
        return '✗';
      case NOTIFICATION_TYPES.WARNING:
        return '⚠';
      case NOTIFICATION_TYPES.INFO:
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-icon">{getIcon()}</div>
      <div className="notification-content">{message}</div>
      <button className="notification-close" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default NotificationCenter; 