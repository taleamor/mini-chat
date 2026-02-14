importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// 1. Конфиг (используем v8 синтаксис для совместимости внутри importScripts)
const firebaseConfig = {
  apiKey: "AIzaSyA64EfxQkGhcCKnxAT_0k_3BTFt5wc6x-E",
  authDomain: "cochat-18c46.firebaseapp.com",
  databaseURL: "https://cochat-18c46-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cochat-18c46",
  storageBucket: "cochat-18c46.firebasestorage.app",
  messagingSenderId: "966021418904",
  appId: "1:966021418904:web:efdf644f1203088c4025ed"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

const CACHE_NAME = "cochat-cache-v2"; // Меняй версию здесь при крупных обновлениях
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Установка: кешируем базу
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Активация: удаляем старые кеши других версий
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  return self.clients.claim();
});

// === СТРАТЕГИЯ: Сначала кеш, обновление в фоне ===
self.addEventListener('fetch', (event) => {
  // Не кешируем запросы к Firebase Realtime DB и уведомления
  if (event.request.url.includes("firebaseio.com") || event.request.url.includes("googleapis")) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Если ответ от сети ок, кладем копию в кеш
          if (networkResponse.status === 200) {
             cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Если сеть упала — просто ничего не делаем, вернется кеш
        });

        // Возвращаем кеш сразу, если он есть, или ждем сеть
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Фоновые уведомления
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || "CoChat";
  const notificationOptions = {
    body: payload.notification?.body || "Новое сообщение в чате",
    icon: '/icon-192.png',
    badge: '/icon-192.png', // иконка в статус-баре Android
    tag: 'msg-group',
    renotify: true
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
