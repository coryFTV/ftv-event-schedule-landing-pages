/**
 * Notification service for displaying user-friendly messages
 */

// Types of notifications
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Store for active notifications
let notifications = [];
let notificationId = 0;
let listeners = [];

/**
 * Add a notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds before auto-dismiss (0 for no auto-dismiss)
 * @returns {number} The notification ID
 */
export const addNotification = (message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
  const id = notificationId++;
  const notification = {
    id,
    message,
    type,
    timestamp: new Date(),
  };

  notifications.push(notification);
  notifyListeners();

  // Auto-dismiss after duration if specified
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }

  return id;
};

/**
 * Remove a notification by ID
 * @param {number} id - The notification ID
 */
export const removeNotification = id => {
  notifications = notifications.filter(notification => notification.id !== id);
  notifyListeners();
};

/**
 * Clear all notifications
 */
export const clearNotifications = () => {
  notifications = [];
  notifyListeners();
};

/**
 * Get all active notifications
 * @returns {Array} Array of notification objects
 */
export const getNotifications = () => {
  return [...notifications];
};

/**
 * Subscribe to notification changes
 * @param {Function} listener - Callback function to be called when notifications change
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNotifications = listener => {
  listeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

/**
 * Notify all listeners of changes
 */
const notifyListeners = () => {
  listeners.forEach(listener => {
    try {
      listener(getNotifications());
    } catch (error) {
      console.error('Error in notification listener:', error);
    }
  });
};

/**
 * Convenience method for success notifications
 * @param {string} message - The notification message
 * @param {number} duration - Duration in milliseconds before auto-dismiss
 * @returns {number} The notification ID
 */
export const notifySuccess = (message, duration = 5000) => {
  return addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
};

/**
 * Convenience method for error notifications
 * @param {string} message - The notification message
 * @param {number} duration - Duration in milliseconds before auto-dismiss (0 for no auto-dismiss)
 * @returns {number} The notification ID
 */
export const notifyError = (message, duration = 0) => {
  console.error(message); // Still log to console for debugging
  return addNotification(message, NOTIFICATION_TYPES.ERROR, duration);
};

/**
 * Convenience method for warning notifications
 * @param {string} message - The notification message
 * @param {number} duration - Duration in milliseconds before auto-dismiss
 * @returns {number} The notification ID
 */
export const notifyWarning = (message, duration = 7000) => {
  console.warn(message); // Still log to console for debugging
  return addNotification(message, NOTIFICATION_TYPES.WARNING, duration);
};

/**
 * Convenience method for info notifications
 * @param {string} message - The notification message
 * @param {number} duration - Duration in milliseconds before auto-dismiss
 * @returns {number} The notification ID
 */
export const notifyInfo = (message, duration = 5000) => {
  return addNotification(message, NOTIFICATION_TYPES.INFO, duration);
}; 