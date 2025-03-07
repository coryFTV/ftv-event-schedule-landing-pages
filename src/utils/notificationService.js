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

// Store for active notifications - using an object for better id-based access
let notificationsById = {};
let notificationId = 0;
let listeners = [];
let isProcessingQueue = false;
let operationQueue = [];

/**
 * Process the operation queue safely
 */
const processQueue = () => {
  if (isProcessingQueue || operationQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  
  try {
    // Process all operations in a single batch
    const currentBatch = [...operationQueue];
    operationQueue = [];
    
    // Apply all operations in the batch
    for (const operation of currentBatch) {
      try {
        operation();
      } catch (error) {
        console.error('Error in notification operation:', error);
      }
    }
    
    // Always notify listeners after each batch
    notifyListenersWithDebounce();
  } finally {
    isProcessingQueue = false;
    
    // If more operations were added during processing, process them too
    if (operationQueue.length > 0) {
      setTimeout(processQueue, 0);
    }
  }
};

/**
 * Add an operation to the queue
 */
const queueOperation = (operation) => {
  operationQueue.push(operation);
  
  // Start processing if it's not already in progress
  if (!isProcessingQueue) {
    processQueue();
  }
};

// Debounce listener notifications
let notificationDebounceTimeout = null;
const notifyListenersWithDebounce = () => {
  clearTimeout(notificationDebounceTimeout);
  notificationDebounceTimeout = setTimeout(notifyListeners, 0);
};

/**
 * Add a notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds before auto-dismiss (0 for no auto-dismiss)
 * @returns {number} The notification ID
 */
export const addNotification = (message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
  if (!message) {
    console.warn('Empty notification message provided');
    return -1;
  }
  
  const id = notificationId++;
  const notification = {
    id,
    message: String(message), // Ensure message is a string
    type,
    timestamp: new Date(),
  };

  queueOperation(() => {
    notificationsById[id] = notification;
  });

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
  queueOperation(() => {
    const { [id]: removed, ...rest } = notificationsById;
    notificationsById = rest;
  });
};

/**
 * Clear all notifications
 */
export const clearNotifications = () => {
  queueOperation(() => {
    notificationsById = {};
  });
};

/**
 * Get all active notifications
 * @returns {Array} Array of notification objects
 */
export const getNotifications = () => {
  return Object.values(notificationsById);
};

/**
 * Subscribe to notification changes
 * @param {Function} listener - Callback function to be called when notifications change
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNotifications = listener => {
  if (typeof listener !== 'function') {
    console.error('Notification listener must be a function');
    return () => {}; // Return no-op function
  }
  
  // Make sure we don't add duplicates
  if (!listeners.includes(listener)) {
    listeners.push(listener);
  }
  
  // Immediately notify the new listener with current state
  try {
    const currentNotifications = getNotifications();
    listener(currentNotifications);
  } catch (error) {
    console.error('Error in notification listener during subscription:', error);
  }
  
  // Return unsubscribe function
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
};

/**
 * Notify all listeners of changes
 */
const notifyListeners = () => {
  if (listeners.length === 0) return;
  
  const currentNotifications = getNotifications();
  
  for (const listener of listeners) {
    try {
      listener(currentNotifications);
    } catch (error) {
      console.error('Error in notification listener:', error);
    }
  }
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