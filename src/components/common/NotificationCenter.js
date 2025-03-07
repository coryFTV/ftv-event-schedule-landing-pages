import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const notificationsRef = useRef(new Map());
  const mountedRef = useRef(true);
  const animationFrameRef = useRef(null);

  // Update when component mounts/unmounts
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      // Cancel any pending animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Clear any notification refs
      notificationsRef.current.clear();
    };
  }, []);

  // Use useCallback for the subscription handler to prevent unnecessary rerenders
  const handleNotifications = useCallback((newNotifications) => {
    if (!mountedRef.current) return;
    
    // Use requestAnimationFrame to batch updates
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      if (!mountedRef.current) return;
      
      setNotifications(prev => {
        // Track which notifications are no longer in the new set
        const prevIds = new Set(prev.map(n => n.id));
        const newIds = new Set(newNotifications.map(n => n.id));
        
        // For each notification that's about to disappear, start removal animation
        prev.forEach(notification => {
          if (!newIds.has(notification.id) && notification.status !== 'removing') {
            // Start the removal process
            const notificationElement = notificationsRef.current.get(notification.id);
            if (notificationElement) {
              startRemovalAnimation(notificationElement, notification.id);
            }
          }
        });
        
        // Keep notifications that should be removed but are still animating
        const retainedNotifications = prev.filter(n => 
          !newIds.has(n.id) && n.status === 'removing'
        );
        
        // Mark new notifications as active
        const updatedNewNotifications = newNotifications.map(n => ({
          ...n,
          status: prevIds.has(n.id) ? n.status || 'active' : 'active'
        }));
        
        // Combine retained and new notifications
        return [...retainedNotifications, ...updatedNewNotifications];
      });
    });
  }, []);

  // Handle animation and removal with refs to avoid DOM exceptions
  const startRemovalAnimation = useCallback((element, id) => {
    if (!mountedRef.current) return;
    
    // First mark as removing in React state
    setNotifications(prev => 
      prev.map(n => (n.id === id ? { ...n, status: 'removing' } : n))
    );
    
    // Add animation class
    try {
      if (element && element.classList && !element.classList.contains('notification-exit')) {
        element.classList.add('notification-exit');
      }
    } catch (err) {
      console.error('Error adding exit class:', err);
    }
    
    // Schedule actual removal after animation completes
    const timeoutId = setTimeout(() => {
      if (mountedRef.current) {
        removeNotification(id);
      }
    }, 400); // Slightly longer than animation duration to ensure completion
    
    // Return cleanup function
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    // Subscribe to notification changes with the memoized handler
    const unsubscribe = subscribeToNotifications(handleNotifications);
    
    // Cleanup subscription on unmount
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [handleNotifications]);

  // Safe removal via animation
  const handleClose = useCallback((id) => {
    const element = notificationsRef.current.get(id);
    if (element) {
      startRemovalAnimation(element, id);
    } else {
      // Fallback if no element reference exists
      removeNotification(id);
    }
  }, [startRemovalAnimation]);

  // Set up ref for notification element
  const setNotificationRef = useCallback((element, id) => {
    if (!mountedRef.current) return;
    
    if (element) {
      notificationsRef.current.set(id, element);
    } else if (id !== undefined) {
      // Remove ref when element is unmounted
      notificationsRef.current.delete(id);
    }
  }, []);

  // Clean up refs for removed notifications
  useEffect(() => {
    if (!mountedRef.current) return;
    
    // Keep only refs for current notifications
    const currentIds = new Set(notifications.map(n => n.id));
    
    // Remove refs for notifications that no longer exist
    notificationsRef.current.forEach((_, id) => {
      if (!currentIds.has(id)) {
        notificationsRef.current.delete(id);
      }
    });
  }, [notifications]);

  // If no notifications, don't render anything
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-center" data-testid="notification-center">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => handleClose(notification.id)}
          setRef={(element) => setNotificationRef(element, notification.id)}
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
 * @param {Function} props.setRef Function to set ref to the notification element
 * @returns {JSX.Element} Notification component
 */
const Notification = ({ notification, onClose, setRef }) => {
  const { type, message, status } = notification;
  
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

  const notificationClass = `notification notification-${type} ${status === 'removing' ? 'notification-exit' : ''}`;

  return (
    <div 
      className={notificationClass} 
      ref={setRef}
    >
      <div className="notification-icon">{getIcon()}</div>
      <div className="notification-content">{message}</div>
      <button 
        className="notification-close" 
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default React.memo(NotificationCenter); 