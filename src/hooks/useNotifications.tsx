import { useState, useEffect } from 'react';
import { Notification, STORAGE, save, load } from '@/lib/storage';

export const useNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    
    // Load notifications for current user
    const allNotifications = load<Notification[]>(STORAGE.NOTIFICATIONS, []);
    const userNotifications = allNotifications.filter(n => n.userId === userId);
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter(n => !n.isRead).length);
  }, [userId]);

  const markAsRead = (notificationId: string) => {
    const allNotifications = load<Notification[]>(STORAGE.NOTIFICATIONS, []);
    const updatedNotifications = allNotifications.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    save(STORAGE.NOTIFICATIONS, updatedNotifications);
    
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    if (!userId) return;
    
    const allNotifications = load<Notification[]>(STORAGE.NOTIFICATIONS, []);
    const updatedNotifications = allNotifications.map(n => 
      n.userId === userId ? { ...n, isRead: true } : n
    );
    save(STORAGE.NOTIFICATIONS, updatedNotifications);
    
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    const allNotifications = load<Notification[]>(STORAGE.NOTIFICATIONS, []);
    const updatedNotifications = allNotifications.filter(n => n.id !== notificationId);
    save(STORAGE.NOTIFICATIONS, updatedNotifications);
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    const deletedNotification = notifications.find(n => n.id === notificationId);
    if (deletedNotification && !deletedNotification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
