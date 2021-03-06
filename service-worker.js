// nama cache
const CACHE_NAME = "firstpwa-v1";

// daftar aset dan halaman mana saja yang akan disimpan ke dalam cache.
var urlsToCache = [
  "/",
  "/nav.html",
  "/index.html",
  "/article.html",
  "/pages/home.html",
  "/pages/about.html",
  "/pages/contact.html",
  "/css/materialize.min.css",
  "/js/materialize.min.js",
  "/js/showdown.min.js",
  "/js/nav.js",
  "/js/api.js",
  "/img/icon.png",
];

// daftarkan event listener untuk event install yang akan dipanggil
// setelah proses registrasi service worker berhasil
self.addEventListener("install", function (event) {
  event.waitUntil(
    //   open cache-storage
    caches.open(CACHE_NAME).then(function (cache) {
      // menyimpan aset ke dalam cache tersebut sejumlah daftar aset
      // yang sudah kita buat pada variable urlsToCache menggunakan method cache.addAll().
      return cache.addAll(urlsToCache);
    })
  );
});

// menggunakan aset yang sudah disimpan di cache
// versi 1
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     caches
//       .match(event.request, { cacheName: CACHE_NAME })
//       .then(function (response) {
//         if (response) {
//           console.log("ServiceWorker: Gunakan aset dari cache: ", response.url);
//           return response;
//         }

//         console.log(
//           "ServiceWorker: Memuat aset dari server: ",
//           event.request.url
//         );
//         return fetch(event.request);
//       })
//   );
// });

// menggunakan aset yang sudah disimpan di cache
// versi 2
self.addEventListener("fetch", function (event) {
  var base_url = "https://readerapi.codepolitan.com/";
  if (event.request.url.indexOf(base_url) > -1) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return fetch(event.request).then(function (response) {
          cache.put(event.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    event.respondWith(
      caches
        .match(event.request, { ignoreSearch: true })
        .then(function (response) {
          return response || fetch(event.request);
        })
    );
  }
});

// membuat mekanisme penghapusan cache yang lama agar tidak membebani pengguna.
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName != CACHE_NAME) {
            console.log("ServiceWorker: cache " + cacheName + " dihapus");
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Notification Actions
self.addEventListener("notificationclick", function (event) {
  // Tambahkan baris berikut
  event.notification.close();
  if (!event.action) {
    // Penguna menyentuh area notifikasi diluar action
    console.log("Notification Click.");
    return;
  }
  switch (event.action) {
    case "yes-action":
      console.log("Pengguna memilih action yes.");
      // buka tab baru
      clients.openWindow("https://google.com");
      break;
    case "no-action":
      console.log("Pengguna memilih action no");
      break;
    default:
      console.log(`Action yang dipilih tidak dikenal: '${event.action}'`);
      break;
  }
});

self.addEventListener("push", function (event) {
  var body;
  if (event.data) {
    body = event.data.text();
  } else {
    body = "Push message no payload";
  }
  var options = {
    body: body,
    // icon: 'img/notification.png',
    requireInteraction: true,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };
  event.waitUntil(
    self.registration.showNotification("This Title Push Notification", options)
  );
});
