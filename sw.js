const CACHE_NAME = 'lexicontext-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@phosphor-icons/web',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js'
];

// Cài đặt và lưu bộ đệm các tài nguyên giao diện cơ bản
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Kích hoạt và dọn dẹp các bản cache cũ nếu có
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Phản hồi từ bộ đệm (Cache First), nếu không có mới tải qua mạng (Network Fallback)
self.addEventListener('fetch', (event) => {
  // Bỏ qua các lệnh gọi API gửi tới Google Gemini hoặc từ điển bên ngoài
  if (event.request.url.includes('generativelanguage.googleapis.com') || 
      event.request.url.includes('translate.googleapis.com') || 
      event.request.url.includes('api.dictionaryapi.dev')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Dự phòng ngoại tuyến nếu mất mạng hoàn toàn
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
