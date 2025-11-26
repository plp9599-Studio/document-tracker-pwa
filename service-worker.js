const CACHE_NAME = 'doc-tracker-v1.3.2';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/service-worker.js',
    // We would list the paths to static icons here in a real deployment:
    // '/icons/android-chrome-192x192.png', 
    // '/icons/android-chrome-512x512.png',
];

// Install event: caches the necessary files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache and cached core assets.');
                // We use skipWaiting() to activate the worker immediately
                self.skipWaiting(); 
                return cache.addAll(urlsToCache);
            })
    );
});

// Activate event: deletes old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Ensure the new Service Worker controls the current clients immediately
    self.clients.claim();
});

// Fetch event: serves cached content first, falling back to network
self.addEventListener('fetch', (event) => {
    // Only attempt to cache/serve assets that are not Firebase SDKs or API calls
    if (event.request.url.startsWith('https://www.gstatic.com/firebasejs/') || 
        event.request.url.includes('googleapis.com')) {
        return event.respondWith(fetch(event.request));
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // No cache hit - fetch from network
                return fetch(event.request);
            }
        )
    );
});