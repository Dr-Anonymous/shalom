var CACHE_NAME = 'shalom-cache-v1';
var urlsToCache = [
  '/',
  '/assets/bootstrap/css/bootstrap.min.css',
  '/assets/bootstrap/js/bootstrap.min.js'
];

self.addEventListener('register', function(event) {
  // Perform install steps
          console.log('Opened cache');
  /*event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );*/
});
