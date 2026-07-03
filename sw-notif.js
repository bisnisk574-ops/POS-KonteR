// =====================================================
// Access-Konter — Service Worker Notifikasi
// Letakkan file ini di ROOT project (sejajar manifest.json)
// =====================================================

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Terima pesan dari halaman → tampilkan notifikasi OS
self.addEventListener('message', e => {
  if (!e.data || e.data.type !== 'SHOW_NOTIF') return;

  const { title, body, icon, badge, tag, data } = e.data;

  e.waitUntil(
    self.registration.showNotification(title || 'KonterKU', {
      body:    body   || '',
      icon:    icon   || '/icon-192.png',
      badge:   badge  || '/icon-96.png',
      tag:     tag    || 'konterku-' + Date.now(),
      vibrate: [200, 100, 200],
      data:    data   || {},
      // Agar notif muncul meski app di foreground (Android Chrome)
      requireInteraction: false,
    })
  );
});

// Klik notif → buka / fokus tab app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes('/app/') || c.url.includes('konterkupro'));
      if (existing) return existing.focus();
      return clients.openWindow(self.registration.scope);
    })
  );
});
