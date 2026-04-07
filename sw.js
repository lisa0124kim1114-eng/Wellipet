const CACHE = 'wellipet-v2';
const ASSETS = ['/', '/index.html', '/shop.html', '/ai.html', '/manifest.json', '/logo.png'];

// 캐시하지 않을 URL 패턴
const BYPASS = [
  'supabase.co',       // Supabase API
  'supabase.io',
  'functions/v1',      // Edge Functions
  'sourcing-pro.html', // 소싱 페이지 (동적 데이터)
  'admin.html',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // bypass 패턴에 해당하면 그냥 네트워크 요청
  if(BYPASS.some(p => url.includes(p))){
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
