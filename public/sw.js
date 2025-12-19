// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received:', event);
  
  let data = { title: 'নতুন নোটিফিকেশন', body: 'আপনার জন্য একটি নতুন বার্তা আছে' };
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error('[Service Worker] Error parsing push data:', e);
  }

  const options = {
    body: data.body || 'নতুন আপডেট পাওয়া গেছে',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      postId: data.postId
    },
    actions: [
      { action: 'open', title: 'দেখুন' },
      { action: 'close', title: 'বন্ধ করুন' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Unity', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click:', event.action);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating...');
  event.waitUntil(clients.claim());
});
