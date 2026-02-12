// ===== Импорты Firebase =====
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js');

// ===== Инициализация Firebase =====
firebase.initializeApp({
  apiKey: "AIzaSyA64EfxQkGhcCKnxAT_0k_3BTFt5wc6x-E",
  authDomain: "cochat-18c46.firebaseapp.com",
  databaseURL: "https://cochat-18c46-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cochat-18c46",
  storageBucket: "cochat-18c46.firebasestorage.app",
  messagingSenderId: "966021418904",
  appId: "1:966021418904:web:efdf644f1203088c4025ed"
});

// ===== Создаем объект для уведомлений =====
const messaging = firebase.messaging();

// ===== Установка и активация SW (логика кеша) =====
const CACHE_NAME = "cochat-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json"
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // сразу активировать новый SW
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  clients.claim(); // сразу взять управление над всеми открытыми страницами
});

// ===== Перехват запросов (кеширование) =====
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// ===== Фоновые уведомления Firebase =====
messaging.onBackgroundMessage(function(payload) {
  console.log('[sw.js] Получено фоновое сообщение ', payload);

  const notificationTitle = payload.notification?.title || "Новое сообщение";
  const notificationOptions = {
    body: payload.notification?.body || "Вы получили новое сообщение",
    icon: '/icon-192.png', // иконка бренда
    tag: 'cochat-notification', // чтобы не спамить одинаковыми уведомлениями
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
