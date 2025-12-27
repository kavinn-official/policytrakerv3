// Service Worker for PolicyTracker PWA
const CACHE_NAME = 'policytracker-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle share target - receive shared files
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle shared files via Web Share Target API
  if (url.pathname === '/add-policy' && url.searchParams.get('shared') === 'true' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
    return;
  }
});

async function handleShareTarget(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('pdf');
    
    if (files.length === 0) {
      // Redirect to add-policy without file
      return Response.redirect('/add-policy?error=no_file', 303);
    }

    const file = files[0];
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      return Response.redirect('/add-policy?error=invalid_type', 303);
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return Response.redirect('/add-policy?error=file_too_large', 303);
    }

    // Store the file in cache for the app to retrieve
    const cache = await caches.open('shared-files');
    const fileResponse = new Response(file, {
      headers: {
        'Content-Type': file.type,
        'X-File-Name': encodeURIComponent(file.name),
        'X-File-Size': file.size.toString()
      }
    });
    await cache.put('/shared-pdf', fileResponse);

    // Redirect to add-policy page with shared flag
    return Response.redirect('/add-policy?shared=pending', 303);
  } catch (error) {
    console.error('Error handling share target:', error);
    return Response.redirect('/add-policy?error=processing_failed', 303);
  }
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/logo.png',
      badge: '/logo.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      },
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'PolicyTracker', options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
